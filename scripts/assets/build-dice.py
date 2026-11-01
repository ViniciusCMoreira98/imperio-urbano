"""Dado original procedural: geometria arredondada, cavidades e pontos, sem serviços pagos."""
import bpy
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

output, descriptor_path, report_path = [Path(p).resolve() for p in sys.argv[sys.argv.index('--') + 1:]]
if output.exists():
    raise RuntimeError('Preserve revisões existentes')
for path in [output, descriptor_path, report_path]:
    path.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def linear(hex_color):
    values = [int(hex_color[i:i+2], 16) / 255 for i in [1, 3, 5]]
    return tuple(v / 12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values) + (1,)

def material(name, color, roughness):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = linear(color)
    shader.inputs['Metallic'].default_value = 0
    shader.inputs['Roughness'].default_value = roughness
    return result

ivory = material('Dice ivory', '#f5f1e7', .30)
charcoal = material('Dice charcoal', '#152039', .55)
bpy.ops.mesh.primitive_cube_add(size=1)
body = bpy.context.object
body.name = 'DiceBody'
body.data.materials.append(ivory)
bevel = body.modifiers.new('Rounded corners', 'BEVEL')
bevel.width = .105
bevel.segments = 4
bpy.ops.object.modifier_apply(modifier=bevel.name)
for layer in list(body.data.uv_layers):
    body.data.uv_layers.remove(layer)

# As bases abaixo são em coordenadas glTF, com normais/bases orientadas para fora.
faces = {
  1: ((0,1,0), (1,0,0), (0,0,-1)),
  6: ((0,-1,0), (1,0,0), (0,0,1)),
  2: ((0,0,1), (1,0,0), (0,1,0)),
  5: ((0,0,-1), (-1,0,0), (0,1,0)),
  3: ((1,0,0), (0,0,-1), (0,1,0)),
  4: ((-1,0,0), (0,0,1), (0,1,0)),
}
corners = [(-.23,-.23), (-.23,.23), (.23,-.23), (.23,.23)]
patterns = {1:[(0,0)], 2:[(-.23,-.23),(.23,.23)], 3:[(-.23,-.23),(0,0),(.23,.23)], 4:corners, 5:corners+[(0,0)], 6:[(x,y) for x in [-.23,.23] for y in [-.23,0,.23]]}
convert = lambda v: Vector((v[0], -v[2], v[1]))
pip_vertices, pip_faces = [], []
segments = 16
for value, (normal, horizontal, vertical) in faces.items():
    n, u, v = map(convert, [normal, horizontal, vertical])
    for x, y in patterns[value]:
        center = u*x + v*y
        bpy.ops.mesh.primitive_cylinder_add(vertices=segments, radius=.080, depth=.05, location=center+n*.505)
        cutter = bpy.context.object
        cutter.rotation_mode = 'QUATERNION'
        cutter.rotation_quaternion = Vector((0,0,1)).rotation_difference(n)
        bpy.context.view_layer.objects.active = body
        difference = body.modifiers.new('Recess pip', 'BOOLEAN')
        difference.operation = 'DIFFERENCE'
        difference.solver = 'EXACT'
        difference.object = cutter
        bpy.ops.object.modifier_apply(modifier=difference.name)
        bpy.data.objects.remove(cutter, do_unlink=True)
        start = len(pip_vertices)
        pip_vertices.append(tuple(center+n*.488))
        for radius, depth in [(.052,.492), (.0795,.4995)]:
            for index in range(segments):
                angle = 2*math.pi*index/segments
                pip_vertices.append(tuple(center+n*depth+radius*(u*math.cos(angle)+v*math.sin(angle))))
        for index in range(segments):
            next_index = (index+1)%segments
            pip_faces.append((start,start+1+index,start+1+next_index))
            a,b,c,d = start+1+index,start+1+next_index,start+1+segments+index,start+1+segments+next_index
            pip_faces.extend([(a,c,d),(a,d,b)])

for polygon in body.data.polygons:
    polygon.use_smooth = True
bpy.context.view_layer.objects.active = body
weighted = body.modifiers.new('Stable face normals', 'WEIGHTED_NORMAL')
weighted.keep_sharp = True
bpy.ops.object.modifier_apply(modifier=weighted.name)
pip_mesh = bpy.data.meshes.new('Pip cups')
pip_mesh.from_pydata(pip_vertices, [], pip_faces)
pip_mesh.update()
pips = bpy.data.objects.new('DicePips', pip_mesh)
bpy.context.collection.objects.link(pips)
pips.data.materials.append(charcoal)
for polygon in pips.data.polygons:
    polygon.use_smooth = True
bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
pips.select_set(True)
triangles = sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in [body,pips])
if triangles > 3000:
    raise RuntimeError(f'Orçamento excedido: {triangles}')
bpy.ops.export_scene.gltf(filepath=str(output), export_format='GLB', use_selection=True, export_animations=False, export_yup=True, export_tangents=False)
if output.stat().st_size > 128*1024:
    raise RuntimeError('GLB excede 128 KiB')
descriptor = {'schemaVersion':1, 'id':'dice-ivory-v01', 'file':'/models/dice/dice-ivory-v01.glb', 'nominalSize':1, 'origin':'center', 'upAxis':'+Y', 'suggestedSize':.5, 'faceNormals':{str(k):list(value[0]) for k,value in faces.items()}, 'oppositePairs':[[1,6],[2,5],[3,4]], 'triangles':triangles, 'materials':2, 'textures':0, 'pipCount':21, 'bodyColor':'#f5f1e7', 'pipColor':'#152039', 'provenance':'Produzido proceduralmente para o projeto; sem assets ou texturas de terceiros'}
descriptor_path.write_text(json.dumps(descriptor,indent=2)+'\n',encoding='utf-8')
report_path.write_text(json.dumps({'blenderVersion':bpy.app.version_string,'bytes':output.stat().st_size,'triangles':triangles,'pipCounts':{str(k):len(v) for k,v in patterns.items()},'additionalCredits':0},indent=2)+'\n',encoding='utf-8')
print(json.dumps({'bytes':output.stat().st_size,'triangles':triangles,'pipCount':21,'materials':2}))
