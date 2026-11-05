"""Normaliza GLBs Meshy para o cenário; fontes integrais permanecem no staging."""
import bpy,json,math,struct
from mathutils import Vector,Matrix
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'apps/web/public/models/decor';out.mkdir(parents=True,exist_ok=True);report=[]

def repair_zero_tangents(path):
 data=bytearray(path.read_bytes());length=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+length]);binary=28+length;fixed=0
 for mesh in doc['meshes']:
  for primitive in mesh['primitives']:
   attrs=primitive['attributes']
   if 'TANGENT' not in attrs:continue
   tangent=doc['accessors'][attrs['TANGENT']];normal=doc['accessors'][attrs['NORMAL']];tv=doc['bufferViews'][tangent['bufferView']];nv=doc['bufferViews'][normal['bufferView']]
   for i in range(tangent['count']):
    offset=binary+tv.get('byteOffset',0)+tangent.get('byteOffset',0)+i*tv.get('byteStride',16);t=struct.unpack_from('<4f',data,offset)
    if sum(v*v for v in t[:3])>1e-10:continue
    no=binary+nv.get('byteOffset',0)+normal.get('byteOffset',0)+i*nv.get('byteStride',12);n=Vector(struct.unpack_from('<3f',data,no));axis=Vector((0,1,0)if abs(n.y)<.9 else(1,0,0));direction=axis.cross(n).normalized();struct.pack_into('<4f',data,offset,*direction,1 if t[3]>=0 else -1);fixed+=1
 path.write_bytes(data);return fixed
for name,height in [('plant',2.0),('mug',1.22)]:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 source=root/f'assets/3d/staging/decor-v3/{name}-textured.glb'
 bpy.ops.import_scene.gltf(filepath=str(source));bpy.context.view_layer.update()
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];coords=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box];lo=Vector(tuple(min(p[i]for p in coords)for i in range(3)));hi=Vector(tuple(max(p[i]for p in coords)for i in range(3)))
 scale=height/(hi.z-lo.z);center=Vector(((hi.x+lo.x)/2,(hi.y+lo.y)/2,lo.z))
 for o in meshes:
  matrix=o.matrix_world.copy()
  for v in o.data.vertices:v.co=(matrix@v.co-center)*scale
  o.parent=None;o.matrix_world=Matrix.Identity(4);o.name='DECOR_'+name.upper()
  for p in o.data.polygons:p.use_smooth=True
 replacements={};textures=root/'assets/3d/staging/decor-v3/runtime-textures';textures.mkdir(parents=True,exist_ok=True)
 for i,image in enumerate(list(bpy.data.images)):
  color=image.name.startswith('Image_0');size=1024 if color else 512 if image.name.startswith('Image_2') else 256
  if max(image.size)>size:
   ratio=size/max(image.size);image.scale(round(image.size[0]*ratio),round(image.size[1]*ratio))
  path=textures/f'{name}-{i}.{ "jpg" if color else "png" }';image.filepath_raw=str(path);image.file_format='JPEG' if color else 'PNG';image.save();replacement=bpy.data.images.load(str(path),check_existing=False);replacement.colorspace_settings.name=image.colorspace_settings.name;replacements[image]=replacement
 for material in bpy.data.materials:
  if material.use_nodes:
   for node in material.node_tree.nodes:
    if node.type=='TEX_IMAGE' and node.image in replacements:node.image=replacements[node.image]
 target=out/f'{name}-v3.glb';bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',export_yup=True,export_animations=False,export_tangents=True)
 fixed=repair_zero_tangents(target)
 report.append({'name':name,'height':height,'triangles':sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons),'bytes':target.stat().st_size,'source':str(source.relative_to(root)),'target':str(target.relative_to(root)),'maxTextureSize':1024,'repairedZeroTangents':fixed})
(root/'assets/3d/reviews/decor-v3/runtime-build.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
