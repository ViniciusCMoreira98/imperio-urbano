"""Reexporta a mesma malha, reencodificando só a textura em JPEG de alta qualidade."""
import bpy
import json
import sys
from pathlib import Path

source, output, report = [Path(p).resolve() for p in sys.argv[sys.argv.index('--') + 1:]]
if output.exists():
    raise RuntimeError('Destino já existe')
output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
triangles = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
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
report.write_text(json.dumps({'blenderVersion': bpy.app.version_string, 'triangles': triangles, 'textureSizes': images, 'jpegQuality': 90, 'geometryDecimated': False, 'textureDownscaled': False, 'approvedForRuntime': False}, indent=2) + '\n', encoding='utf-8')
print('Textura reencodificada; resolução e malha preservadas.')
