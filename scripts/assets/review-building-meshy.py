import bpy,json
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parents[2];bpy.ops.wm.read_factory_settings(use_empty=True);records=[]
for level in range(1,6):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(root/f'assets/3d/calibration/buildings-meshy/level-{level}-preview.glb'));bpy.context.view_layer.update();meshes=[o for o in set(bpy.data.objects)-before if o.type=='MESH'];coords=[o.matrix_world@Vector(p)for o in meshes for p in o.bound_box];lo=Vector(tuple(min(p[i]for p in coords)for i in range(3)));hi=Vector(tuple(max(p[i]for p in coords)for i in range(3)));factor=1/max(hi.x-lo.x,hi.y-lo.y);center=Vector(((hi.x+lo.x)/2,(hi.y+lo.y)/2,lo.z));offset=Vector(((level-3)*1.35*.868,(level-3)*1.35*.496,0))
 for o in meshes:
  matrix=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4)
  for v in o.data.vertices:v.co=(matrix@v.co-center)*factor+offset
 records.append({'level':level,'height':(hi.z-lo.z)*factor,'triangles':sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)})
bpy.ops.object.camera_add(location=(4,-7,6));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.75))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=7.8;s=bpy.context.scene;s.camera=cam;s.world=bpy.data.worlds.new('Studio');s.world.color=(.2,.22,.24);s.render.engine='BLENDER_WORKBENCH';s.display.shading.light='STUDIO';s.display.shading.color_type='MATERIAL';s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH';s.display.shading.show_shadows=True;s.display.shading.background_type='WORLD';s.render.resolution_x=1600;s.render.resolution_y=780;s.render.resolution_percentage=100;s.render.filepath=str(root/'assets/3d/reviews/buildings/meshy-geometry.png');bpy.ops.render.render(write_still=True);print(json.dumps(records))
