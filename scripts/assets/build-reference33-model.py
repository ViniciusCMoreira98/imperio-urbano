import bpy,json,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'apps/web/src/board/reference33/layout.json').read_text(encoding='utf8'))
out=root/'apps/web/public/models/board/reference33-v01.glb';out.parent.mkdir(parents=True,exist_ok=True)
blend=root/'assets/3d/calibration/reference33';blend.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
def material(name,color,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=.32
 return m
printed=material('PrintedArtwork',(1,1,1))
gold=material('GoldSides',(.83,.42,.045),.55)
wood=material('WoodBody',(.12,.045,.018))
def native(p):return (p[0],-p[2],p[1])
def signed(points):return sum(points[i][0]*points[(i+1)%len(points)][1]-points[(i+1)%len(points)][0]*points[i][1] for i in range(len(points)))/2
def solid(name,polygon,base,top,topmaterial,side):
 xy=[(p[0],-p[2]) for p in polygon]
 if signed(xy)<0:xy.reverse()
 n=len(xy);cx=sum(x for x,y in xy)/n;cy=sum(y for x,y in xy)/n
 vertices=[(x-cx,y-cy,z) for z in [base,top] for x,y in xy]
 faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(side);mesh.materials.append(topmaterial)
 mesh.polygons[1].material_index=1;mesh.update()
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.location=(cx,cy,0)
 bevel=obj.modifiers.new('Contour bevel','BEVEL');bevel.width=.008;bevel.segments=3;bevel.affect='EDGES';bevel.material=0
 bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.modifier_apply(modifier=bevel.name);obj.select_set(False)
 return obj
for tile in data['tiles']:solid(tile['modelNode'],tile['polygon'],0,data['tileHeight'],printed,gold)
solid('BOARD_BODY',data['layers']['frame']['polygon'],-.34,0,wood,wood)
def flat_with_holes(name,outer,holes,mat):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.resolution_u=1
 for i,loop in enumerate([outer]+holes):
  p=[native(v) for v in loop]
  if (signed(p)>0)!=(i==0):p.reverse()
  spline=curve.splines.new('POLY');spline.points.add(len(p)-1)
  for co,point in zip(p,spline.points):point.co=(co[0],co[1],0,1)
  spline.use_cyclic_u=True
 obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);obj.location.z=outer[0][1]
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH');obj=bpy.context.object;obj.data.materials.append(mat);obj.select_set(False)
 return obj
flat_with_holes('CENTER_ART',data['layers']['center']['polygon'],[],printed)
flat_with_holes('FRAME_ART',data['layers']['frame']['top'],[data['layers']['frame']['inner']],printed)
flat_with_holes('TABLE_DECOR',data['layers']['backdrop']['polygon'],data['layers']['backdrop']['worldHoles'],printed)
flat_with_holes('GAP_ART',data['layers']['gaps']['polygon'],[],printed)
triangles=sum(sum(len(p.vertices)-2 for p in obj.data.polygons) for obj in bpy.context.scene.objects if obj.type=='MESH')
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_animations=False,export_tangents=False)
bpy.ops.wm.save_as_mainfile(filepath=str(blend/'reference33.blend'))
report={'blenderVersion':bpy.app.version_string,'tileObjects':33,'triangles':triangles,'bytes':out.stat().st_size,'source':'Polígonos da referência aprovados, extrudados no Blender; faces impressas por projeção de repouso no R3F.','credits':0}
(blend/'build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(report,ensure_ascii=False))
