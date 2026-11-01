"""Pose estática da Luana: dois ossos temporários, aplicados à cópia sem exportar rig."""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Matrix, Vector

source, output, report_path = [Path(p).resolve() for p in sys.argv[sys.argv.index('--') + 1:]]
if output.exists():
    raise RuntimeError('Preserve revisões existentes: escolha um novo destino')
output.parent.mkdir(parents=True, exist_ok=True)
report_path.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if len(meshes) != 1 or any(o.type == 'ARMATURE' for o in bpy.context.scene.objects):
    raise RuntimeError('Esperada somente a malha estática da Luana')
mesh = meshes[0]
before = [v.co.copy() for v in mesh.data.vertices]
triangles = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
if triangles != 11900 or not (0.93 < max(v.z for v in before) < 0.97):
    raise RuntimeError('Fonte não corresponde à revisão validada da Luana')

def smooth(a, b, value):
    t = max(0.0, min(1.0, (value - a) / (b - a)))
    return t * t * (3 - 2 * t)

bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.armature_add(enter_editmode=True)
rig = bpy.context.object
rig.name = 'Temporary rest-pose rig'
root = rig.data.edit_bones[0]
root.name = 'body'
root.head, root.tail = (0, 0, -.5), (0, 0, .1)
for sign, name in [(1, 'arm-right'), (-1, 'arm-left')]:
    bone = rig.data.edit_bones.new(name)
    bone.head = (sign * .23, 0, -.06)
    bone.tail = (sign * .60, 0, -.06)
    bone.parent = root
bpy.ops.object.mode_set(mode='OBJECT')
groups = {name: mesh.vertex_groups.new(name=name) for name in ['body', 'arm-right', 'arm-left']}
weights = []
for index, co in enumerate(before):
    # Blender importa Y-up do glTF como Z-up. Limites específicos desta personagem.
    x, height, depth = co.x, co.z, -co.y
    shoulder = smooth(.20, .36, abs(x))
    band = smooth(-.25, -.18, height) * (1 - smooth(.04, .10, height))
    depth_band = smooth(-.24, -.20, depth) * (1 - smooth(.22, .27, depth))
    weight = shoulder * band * depth_band
    weights.append(weight)
    if weight < 1:
        groups['body'].add([index], 1 - weight, 'REPLACE')
    if weight > 0:
        groups['arm-right' if x > 0 else 'arm-left'].add([index], weight, 'REPLACE')
for sign, name in [(1, 'arm-right'), (-1, 'arm-left')]:
    pivot = Vector((sign * .23, 0, -.06))
    transform = Matrix.Translation(pivot) @ Matrix.Rotation(sign * math.radians(60), 4, 'Y') @ Matrix.Translation(-pivot)
    rig.pose.bones[name].matrix = transform @ rig.data.bones[name].matrix_local
bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
mesh.select_set(True)
bpy.context.view_layer.objects.active = mesh
modifier = mesh.modifiers.new('Apply relaxed arm pose', 'ARMATURE')
modifier.object = rig
bpy.ops.object.modifier_apply(modifier=modifier.name)
bpy.data.objects.remove(rig, do_unlink=True)
for group in list(mesh.vertex_groups):
    mesh.vertex_groups.remove(group)
after = [v.co.copy() for v in mesh.data.vertices]
if len(after) != len(before):
    raise RuntimeError('A pose mudou a topologia')
unchanged_regions = [i for i, co in enumerate(before) if co.z >= .10 or co.z <= -.25 or abs(co.x) <= .20]
if any((after[i] - before[i]).length > 1e-6 for i in unchanged_regions):
    raise RuntimeError('A pose atingiu cabeça, pernas ou centro do corpo')
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True, export_animations=False, export_image_format='AUTO', export_tangents=False)
report = {'blenderVersion': bpy.app.version_string, 'armRotationDegrees': 60, 'triangles': triangles, 'sourceVertices': len(before), 'modifiedVertices': sum((a-b).length > 1e-6 for a,b in zip(after,before)), 'unchangedProtectedVertices': len(unchanged_regions), 'textureReencoded': False, 'temporaryRigAppliedAndRemoved': True, 'exportedRig': False, 'animations': []}
report_path.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report))
