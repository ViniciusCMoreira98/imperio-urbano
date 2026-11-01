"""Máscara técnica UV da Luana: casaco/mangas, sem editar o GLB ou albedo."""
import bpy
import json
import sys
from pathlib import Path
import numpy as np

source, destination, descriptor = [Path(p).resolve() for p in sys.argv[sys.argv.index('--') + 1:]]
if destination.exists() or descriptor.exists():
    raise RuntimeError('Use novos destinos para preservar revisões')
destination.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
if len(meshes) != 1:
    raise RuntimeError('Esperada uma malha da Luana')
mesh = meshes[0].data
mesh.calc_loop_triangles()
uv = mesh.uv_layers.active.data
images = [i for i in bpy.data.images if i.type == 'IMAGE' and i.size[0] > 0]
if len(images) != 1:
    raise RuntimeError('Esperado um albedo embutido')
image = images[0]
image.colorspace_settings.name = 'Non-Color'  # leitura do RGB codificado, sem conversão implícita
width, height = image.size[:]
if (width, height) != (4096, 4096):
    raise RuntimeError('Esperada a textura 4K validada')
pixels = np.empty(width * height * 4, dtype=np.float32)
image.pixels.foreach_get(pixels)
rgb = pixels.reshape(height, width, 4)[:, :, :3]
r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
# Burgundy contém azul e vermelho; pele/couro/dourado têm verde maior que azul.
burgundy = (r > g * 1.5 + .012) & (b > g * 1.25 + .006) & (r > b * 1.05) & (r > .045)
size = 1024
coat = np.zeros((size, size), dtype=bool)
protected = np.zeros_like(coat)

def raster(target, points, margin=0):
    points = np.asarray(points, dtype=np.float64) * size - .5
    minimum = np.maximum(0, np.floor(points.min(axis=0) - margin).astype(int))
    maximum = np.minimum(size - 1, np.ceil(points.max(axis=0) + margin).astype(int))
    if np.any(maximum < minimum):
        return
    a, b, c = points
    denominator = (b[1]-c[1])*(a[0]-c[0]) + (c[0]-b[0])*(a[1]-c[1])
    if abs(denominator) < 1e-10:
        return
    yy, xx = np.mgrid[minimum[1]:maximum[1]+1, minimum[0]:maximum[0]+1]
    first = ((b[1]-c[1])*(xx-c[0]) + (c[0]-b[0])*(yy-c[1])) / denominator
    second = ((c[1]-a[1])*(xx-c[0]) + (a[0]-c[0])*(yy-c[1])) / denominator
    first_margin = margin * np.linalg.norm(b-c) / abs(denominator)
    second_margin = margin * np.linalg.norm(c-a) / abs(denominator)
    third_margin = margin * np.linalg.norm(a-b) / abs(denominator)
    inside = (first >= -first_margin - 1e-6) & (second >= -second_margin - 1e-6) & (first + second <= 1 + third_margin + 1e-6)
    target[minimum[1]:maximum[1]+1, minimum[0]:maximum[0]+1] |= inside

selected_faces = 0
for triangle in mesh.loop_triangles:
    center_height = sum(mesh.vertices[i].co.z for i in triangle.vertices) / 3
    center_x = sum(mesh.vertices[i].co.x for i in triangle.vertices) / 3
    # Proteger também queixo/pescoço: tons de sombra da pele podem parecer burgundy.
    central_neck = center_height > .015 and abs(center_x) < .22
    is_coat_region = -.57 <= center_height <= .085 and not central_neck
    selected_faces += is_coat_region
    # Padding do casaco mantém cor nas costuras do atlas, sem desenhar a triangulação.
    raster(coat if is_coat_region else protected, [uv[i].uv[:] for i in triangle.loops], 1.5 if is_coat_region else 0)
coverage = burgundy.reshape(size, 4, size, 4).mean(axis=(1, 3))
core = np.clip((coverage - .85) / .15, 0, 1).astype(np.float32)
core *= coat & ~protected
# A cobertura fracionária de 4x4 texels já fornece a suavização; erosão desenharia costuras UV.
mask = core
if np.count_nonzero(mask > .5) < 1000:
    raise RuntimeError('Máscara vazia ou insuficiente')
sample_mask = np.repeat(np.repeat(mask > .9, 4, axis=0), 4, axis=1)
samples = rgb[sample_mask]
linear = np.where(samples <= .04045, samples / 12.92, ((samples + .055) / 1.055) ** 2.4)
reference = float(np.median(linear @ np.array([.2126, .7152, .0722])))
if not .001 < reference < 1:
    raise RuntimeError('Luminância inválida')
result = bpy.data.images.new('Luana uniform mask', width=size, height=size, alpha=False, is_data=True)
rgba = np.ones((size, size, 4), dtype=np.float32)
rgba[:, :, :3] = mask[:, :, None]
result.pixels.foreach_set(rgba.ravel())
result.filepath_raw = str(destination)
result.file_format = 'PNG'
result.save()
data = {'schemaVersion': 1, 'assetId': 'steampunk-brasil-v01-textured', 'glb': '/models/characters/steampunk-brasil-v01-rest-v01.glb', 'materialIndex': 0, 'uniform': {'mask': '/models/characters/' + destination.name, 'referenceLuminance': round(reference, 8), 'localYRange': [-.57, .07]}, 'channel': 'r', 'colorSpace': 'linear', 'flipY': False, 'generateMipmaps': False, 'minFilter': 'LinearFilter', 'magFilter': 'LinearFilter', 'guardSpace': 'mesh-local-bind-pose-Y', 'uvSet': 'TEXCOORD_0', 'method': 'masked-luminance-v1', 'size': [size, size], 'target': 'coat-and-sleeves-only', 'selectedGeometryFaces': selected_faces, 'maskedTexelsAboveHalf': int(np.count_nonzero(mask > .5)), 'maskedFraction': float(np.mean(mask > .5)), 'productionIntegration': 'pending-Claude'}
descriptor.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
print(json.dumps(data))
