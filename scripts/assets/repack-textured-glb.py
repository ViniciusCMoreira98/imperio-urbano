"""Reexporta a mesma malha, reencodificando só a textura em JPEG de alta qualidade."""
import bpy
import json
import sys
from pathlib import Path

args = sys.argv[sys.argv.index('--') + 1:]
source, output, report = [Path(p).resolve() for p in args[:3]]
triangle_limit = int(args[3]) if len(args) > 3 else None
if output.exists():
    raise RuntimeError('Destino já existe')
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
triangles = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
if triangle_limit is not None:
    if not 11000 <= triangle_limit < 12000 or not 12000 < triangles <= 12500:
        raise RuntimeError('Esta redução leve exige alvo entre 11000 e 11999 e origem entre 12001 e 12500')
    for obj in meshes:
        bpy.context.view_layer.objects.active = obj
        modifier = obj.modifiers.new('Small budget correction', 'DECIMATE')
        modifier.ratio = triangle_limit / triangles
        bpy.ops.object.modifier_apply(modifier=modifier.name)
after = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
if triangle_limit is not None and after > 12000:
    raise RuntimeError('Saída ainda excede 12 mil triângulos')
images = []
for image in bpy.data.images:
    if image.type == 'IMAGE' and image.size[0] > 0:
        width, height = image.size[:]
        # Mesma resolução; marca os pixels para reencodificar em vez de copiar o JPEG original.
        image.scale(width, height)
        images.append({'name': image.name, 'width': width, 'height': height})
bpy.ops.object.select_all(action='DESELECT')
for obj in meshes:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True, export_animations=False, export_image_format='JPEG', export_jpeg_quality=90, export_tangents=False)
report.write_text(json.dumps({'blenderVersion': bpy.app.version_string, 'sourceTriangles': triangles, 'triangles': after, 'textureSizes': images, 'jpegQuality': 90, 'geometryDecimated': triangle_limit is not None, 'textureDownscaled': False, 'approvedForRuntime': False}, indent=2) + '\n', encoding='utf-8')
print('Exportação local concluída; resolução da textura preservada.')
