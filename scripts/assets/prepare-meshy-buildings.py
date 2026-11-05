"""Converte os cinco resultados Meshy guiados pelas artes do modal em miniaturas de runtime."""
import bpy,json,struct,sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2];source=root/'assets/3d/calibration/buildings-meshy';runtime=root/'apps/web/public/models/buildings';textures=source/'runtime-textures';textures.mkdir(parents=True,exist_ok=True);records=[]
def repair_tangents(path):
 data=bytearray(path.read_bytes());length=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+length]);base=28+length;fixed=0
 for mesh in doc['meshes']:
  for p in mesh['primitives']:
   if 'TANGENT' not in p['attributes']:continue
   t=doc['accessors'][p['attributes']['TANGENT']];n=doc['accessors'][p['attributes']['NORMAL']];tv=doc['bufferViews'][t['bufferView']];nv=doc['bufferViews'][n['bufferView']]
   for i in range(t['count']):
    offset=base+tv.get('byteOffset',0)+t.get('byteOffset',0)+i*tv.get('byteStride',16);values=struct.unpack_from('<4f',data,offset)
    if sum(v*v for v in values[:3])>1e-10:continue
    no=base+nv.get('byteOffset',0)+n.get('byteOffset',0)+i*nv.get('byteStride',12);normal=Vector(struct.unpack_from('<3f',data,no));axis=Vector((0,1,0)if abs(normal.y)<.9 else(1,0,0));direction=axis.cross(normal).normalized();struct.pack_into('<4f',data,offset,*direction,1 if values[3]>=0 else -1);fixed+=1
 path.write_bytes(data);return fixed
terrain_only='--terrain' in sys.argv
for level in ([0] if terrain_only else range(6)):
 bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.preferences.filepaths.save_version=0
 bpy.ops.import_scene.gltf(filepath=str(source/f'level-{level}-source.glb'));bpy.context.view_layer.update();meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];points=[o.matrix_world@Vector(p)for o in meshes for p in o.bound_box];lo=Vector(tuple(min(p[i]for p in points)for i in range(3)));hi=Vector(tuple(max(p[i]for p in points)for i in range(3)));span=max(hi.x-lo.x,hi.y-lo.y);center=Vector(((hi.x+lo.x)/2,(hi.y+lo.y)/2,lo.z))
 for o in meshes:
  bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
  if o.parent:bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
  bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
  for v in o.data.vertices:v.co=(v.co-center)/span
 width=(hi.x-lo.x)/span;depth=(hi.y-lo.y)/span;height=(hi.z-lo.z)/span
 # Identificação do proprietário separada da arquitetura e das texturas originais.
 bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-depth/2+.008,.018));accent=bpy.context.object;accent.dimensions=(width*.73,.009,.012);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mat=bpy.data.materials.new('OWNER_ACCENT');mat.use_nodes=True;shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=(.36,.11,.68,1);shader.inputs['Roughness'].default_value=.4;accent.data.materials.append(mat);meshes.append(accent)
 replacements={}
 for i,image in enumerate(list(bpy.data.images)):
  color=image.name.startswith('Image_0');normal=image.name.startswith('Image_2');size=1024 if color else 512 if normal else 256
  if max(image.size)>size:
   ratio=size/max(image.size);image.scale(round(image.size[0]*ratio),round(image.size[1]*ratio))
  path=textures/f'level-{level}-{i}.{ "jpg" if color else "png" }';image.filepath_raw=str(path);image.file_format='JPEG'if color else'PNG';image.save();new=bpy.data.images.load(str(path),check_existing=False);new.colorspace_settings.name=image.colorspace_settings.name;replacements[image]=new
 for material in bpy.data.materials:
  if material.use_nodes:
   for node in material.node_tree.nodes:
    if node.type=='TEX_IMAGE' and node.image in replacements:node.image=replacements[node.image]
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();model=bpy.context.object;model.name=f'PROPERTY_LEVEL_{level}';model['level']=level;model['provider']='Meshy 7.1 / original modal image';triangles=sum(len(p.vertices)-2 for p in model.data.polygons)
 path=runtime/f'property-level-{level}-meshy-v1.glb';bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_animations=False,export_tangents=True);fixed=repair_tangents(path)
 bpy.ops.wm.save_as_mainfile(filepath=str(source/f'level-{level}-prepared.blend'))
 record={'level':level,'floors':4 if level==5 else level,'label':'Terreno'if level==0 else 'Hotel'if level==5 else f'Casa {level}','model':f'/models/buildings/{path.name}','width':width,'depth':depth,'height':height,'triangles':triangles,'bytes':path.stat().st_size,'referenceArtwork':'terrain-v2.png'if level==0 else 'hotel-v2.png'if level==5 else f'house-{level}-v2.png','provider':'Meshy 7.1','textureSource':'Original modal illustration','sourceResolution':'2k','runtimeTextureMaxSize':1024,'repairedZeroTangents':fixed};records.append(record);print(json.dumps(record),flush=True)
if terrain_only:
 previous=json.loads((root/'apps/web/src/board/buildings/buildings.json').read_text(encoding='utf-8'));records+= [record for record in previous['models'] if record['level']!=0]
manifest={'version':3,'created':'2026-11-05','sourceThread':'ArtesImperio / 01a19495-b0d4-7790-8715-a844aeb27e85','sourceArtwork':'apps/web/src/property-evolution/art/','front':'+Z','baseY':0,'uniformScaleOnly':True,'ownerMaterial':'OWNER_ACCENT','meshyCredits':280,'models':records}
(root/'apps/web/src/board/buildings/buildings.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8');(source/'runtime-build.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
