"""Blender em modo background: cópia estática para avaliação, nunca para publicar."""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
source, output, report_dir = [Path(p).resolve() for p in args[:3]]
quality_review = len(args) > 3 and args[3] == 'quality-review'
texture_limit = 2048 if quality_review else 1024
triangle_target = 50000 if quality_review else 10000
output.parent.mkdir(parents=True, exist_ok=True)
report_dir.mkdir(parents=True, exist_ok=True)
if output.exists():
    raise RuntimeError('Destino já existe; preserve a revisão anterior')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
# Preservar os mapas existentes em cópia, com resolução adequada à avaliação.
for image in bpy.data.images:
    if image.type == 'IMAGE' and image.size[0] > 0 and max(image.size) > texture_limit:
        factor = texture_limit / max(image.size)
        image.scale(max(1, round(image.size[0] * factor)), max(1, round(image.size[1] * factor)))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if not meshes or any(o.type == 'ARMATURE' for o in bpy.context.scene.objects):
    raise RuntimeError('Este fluxo é exclusivo para candidato estático sem rig')
points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
minimum = Vector(tuple(min(p[i] for p in points) for i in range(3)))
maximum = Vector(tuple(max(p[i] for p in points) for i in range(3)))
height = maximum.z - minimum.z
if height <= 0:
    raise RuntimeError('Altura inválida')
center = Vector(((minimum.x + maximum.x) / 2, (minimum.y + maximum.y) / 2, minimum.z))
for o in meshes:
    o.matrix_world.translation -= center
    o.matrix_world.translation /= height
    o.scale /= height
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.select_set(False)

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 24
scene.cycles.device = 'CPU'
scene.render.resolution_x = 800
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.world.color = (0.16, 0.16, 0.16)
bpy.ops.object.camera_add(location=(1.7, -2.5, 1.45))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0.5)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 1.5
scene.camera = camera
for location, energy, size in [((2, -3, 4), 450, 4), ((-2, -1, 2), 200, 3), ((0, 3, 3), 350, 3)]:
    bpy.ops.object.light_add(type='AREA', location=location)
    lamp = bpy.context.object
    lamp.data.energy = energy
    lamp.data.shape = 'DISK'
    lamp.data.size = size
    lamp.rotation_euler = (Vector((0, 0, 0.5)) - lamp.location).to_track_quat('-Z', 'Y').to_euler()
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.render.filepath = str(report_dir / 'original.png')
bpy.ops.render.render(write_still=True)
before = sum(len(o.data.polygons) for o in meshes)
for o in meshes:
    bpy.context.view_layer.objects.active = o
    modifier = o.modifiers.new('Preview-only reduction', 'DECIMATE')
    modifier.ratio = min(1.0, triangle_target / before)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    # Triangular para orçamento determinístico na exportação.
    tri = o.modifiers.new('Triangles', 'TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=tri.name)
    if quality_review:
        for polygon in o.data.polygons:
            polygon.use_smooth = True
        # O normal map do high-poly não foi rebakeado para a nova topologia.
        # A prévia de cor/silhueta usa material cartoon neutro para evitar esse artefato.
        for material in o.data.materials:
            if material and material.use_nodes:
                for shader in material.node_tree.nodes:
                    if shader.type == 'BSDF_PRINCIPLED':
                        for slot, value in [('Normal', None), ('Metallic', 0.0), ('Roughness', 0.65)]:
                            for link in list(shader.inputs[slot].links):
                                material.node_tree.links.remove(link)
                            if value is not None:
                                shader.inputs[slot].default_value = value
after = sum(len(o.data.polygons) for o in meshes)
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True, export_yup=True, export_animations=False, export_tangents=not quality_review)
scene.render.filepath = str(report_dir / 'reduced.png')
bpy.ops.render.render(write_still=True)
report = {'blenderVersion': bpy.app.version_string, 'sourceBoundsBlenderZUp': {'min': list(minimum), 'max': list(maximum)}, 'normalizationHeightMeters': 1, 'sourceFaces': before, 'reducedTriangles': after, 'staticPreviewOnly': True, 'approvedForRuntime': False, 'rig': False, 'animations': []}
(report_dir / 'blender.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
if quality_review:
    report.update({'qualityReview': True, 'triangleTarget': triangle_target, 'textureLimit': texture_limit, 'materialChanges': 'smooth shading, base color retained, no unreprojected normal map, metallic=0, roughness=0.65'})
    (report_dir / 'blender.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
