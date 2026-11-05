"""Geometria física independente de 34 casas; nenhuma foto do tabuleiro no modelo."""
import bpy,json,math
from pathlib import Path
root=Path(__file__).resolve().parents[2]
data=json.loads((root/'apps/web/src/board/board34/layout.json').read_text(encoding='utf-8'))
out=root/'apps/web/public/models/board/board34-v01.glb'
blend=root/'assets/3d/calibration/board34'
out.parent.mkdir(parents=True,exist_ok=True);blend.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0

def material(name,color,metal=0,roughness=.35):
 m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF');s.inputs['Base Color'].default_value=(*color,1);s.inputs['Metallic'].default_value=metal;s.inputs['Roughness'].default_value=roughness;return m
face=material('TileFace',(1,1,1));gold=material('BeveledGold',(.95,.56,.075),.78,.22);wood=material('WalnutBody',(.13,.041,.014),.05,.25);center=material('CenterArtwork',(1,1,1))

def signed(p):return sum(p[i][0]*p[(i+1)%len(p)][1]-p[(i+1)%len(p)][0]*p[i][1] for i in range(len(p)))/2

def solid(name,polygon,base,top,upper,side,bevel=.035):
 xy=[(p[0],-p[2]) for p in polygon]
 if signed(xy)<0:xy.reverse()
 n=len(xy);cx=sum(x for x,y in xy)/n;cy=sum(y for x,y in xy)/n
 vertices=[(x-cx,y-cy,z) for z in [base,top] for x,y in xy]
 faces=[tuple(reversed(range(n))),tuple(range(n,2*n))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.materials.append(side);mesh.materials.append(upper);mesh.polygons[1].material_index=1;mesh.update()
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.location=(cx,cy,0)
 mod=obj.modifiers.new('Rounded physical edge','BEVEL');mod.width=bevel;mod.segments=2;mod.material=0
 bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.modifier_apply(modifier=mod.name);obj.select_set(False)
 return obj
for tile in data['tiles']:solid(tile['modelNode'],tile['polygon'],0,data['tileHeight'],face,gold)
solid('BOARD_BODY',data['layers']['frame']['polygon'],-.505,0,wood,wood,.09)
solid('CENTER_ART',data['layers']['center']['polygon'],0,.035,center,gold,.012)
# Anel real de metal sobre o corpo, com centro vazado.
curve=bpy.data.curves.new('Gold frame','CURVE');curve.dimensions='2D';curve.fill_mode='BOTH';curve.resolution_u=1
for i,loop in enumerate([data['layers']['frame']['top'],data['layers']['frame']['inner']]):
 p=[(v[0],-v[2]) for v in loop]
 if (signed(p)>0)!=(i==0):p.reverse()
 spline=curve.splines.new('POLY');spline.points.add(len(p)-1)
 for co,point in zip(p,spline.points):point.co=(*co,0,1)
 spline.use_cyclic_u=True
obj=bpy.data.objects.new('FRAME_GOLD',curve);bpy.context.collection.objects.link(obj);obj.location.z=.025
bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH');obj=bpy.context.object;obj.data.materials.append(wood);obj.select_set(False)

def piping(name,loop,height,radius,mat):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=2;c.resolution_u=1
 s=c.splines.new('POLY');s.points.add(len(loop)-1)
 for p,v in zip(s.points,loop):p.co=(v[0],-v[2],height,1)
 s.use_cyclic_u=True
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(mat)
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');
 for p in bpy.context.object.data.polygons:p.use_smooth=True
 o.select_set(False)

# Filetes arredondados independentes: a moldura tem reflexos e espessura reais.
piping('FRAME_OUTER_ROLLED_GOLD',data['layers']['frame']['top'],.006,.035,gold)
piping('FRAME_INNER_ROLLED_GOLD',data['layers']['frame']['inner'],.005,.024,gold)
piping('FRAME_LOWER_INLAY',data['layers']['frame']['polygon'],-.29,.022,gold)
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in bpy.context.scene.objects if o.type=='MESH')
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_animations=False,export_tangents=False)
bpy.ops.wm.save_as_mainfile(filepath=str(blend/'board34.blend'))
report={'blenderVersion':bpy.app.version_string,'tileObjects':34,'triangles':triangles,'bytes':out.stat().st_size,'independentGeometry':True,'sourcePhotoPixelsUsed':False,'paidMeshyCredits':0}
(blend/'build.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8');print(json.dumps(report))
