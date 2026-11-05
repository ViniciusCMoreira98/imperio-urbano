import bpy,math,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
report=[]
for name,x,height in [('plant',-1.35,2.4),('mug',1.35,1.65)]:
 bpy.ops.import_scene.gltf(filepath=str(root/f'assets/3d/staging/decor-v3/{name}-preview.glb'))
 meshes=[o for o in bpy.context.selected_objects if o.type=='MESH']
 coords=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box];lo=Vector(tuple(min(p[i] for p in coords)for i in range(3)));hi=Vector(tuple(max(p[i] for p in coords)for i in range(3)))
 scale=height/(hi.z-lo.z);center=Vector(((hi.x+lo.x)/2,(hi.y+lo.y)/2,lo.z))
 for o in meshes:
  bpy.context.view_layer.objects.active=o;bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
  for v in o.data.vertices:v.co=(o.matrix_world@v.co-center)*scale+Vector((x,0,0))
  o.matrix_world.identity()
 report.append({'name':name,'dimensions':list((hi-lo)*scale),'triangles':sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)})
bpy.ops.object.camera_add(location=(4,-8,6));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=5.8;bpy.context.scene.camera=cam
s=bpy.context.scene;s.world=bpy.data.worlds.new('Studio');s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True;s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.background_type='WORLD';s.world.color=(.13,.16,.2)
s.render.resolution_x=1200;s.render.resolution_y=760;s.render.resolution_percentage=100
out=root/'assets/3d/reviews/decor-v3';out.mkdir(parents=True,exist_ok=True);s.render.filepath=str(out/'geometry-review.png');bpy.ops.render.render(write_still=True);(out/'geometry.json').write_text(json.dumps(report,indent=2));print(report)
