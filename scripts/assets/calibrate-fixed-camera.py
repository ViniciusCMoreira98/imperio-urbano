"""Blender em segundo plano: calibra a câmera no envelope existente, sem remodelar o jogo."""
import bpy, json, math, sys, hashlib
from pathlib import Path
import numpy as np
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view

root=Path(__file__).resolve().parents[2]
out=root/'assets/3d/calibration/fixed-camera'
out.mkdir(parents=True,exist_ok=True)
config_path=root/'apps/web/src/board/camera/fixedCamera.json'
config_path.parent.mkdir(parents=True,exist_ok=True)
width,height=1536,1024
extent=11.9
surface_y=.3
# Interseções estimadas das linhas retas da moldura na referência original.
target=np.array([[253.,43.],[1328.,47.],[1513.,902.],[22.,901.]])
points=np.array([[-extent/2,0,-extent/2],[extent/2,0,-extent/2],[extent/2,0,extent/2],[-extent/2,0,extent/2]])

def basis(p):
    az,el,ld,lf,cx,cy,roll,yaw_offset,pitch_offset=p
    distance=math.exp(ld)
    location=distance*np.array([math.cos(el)*math.sin(az),math.sin(el),math.cos(el)*math.cos(az)])
    optical_az=az+yaw_offset;optical_el=el+pitch_offset
    forward=-np.array([math.cos(optical_el)*math.sin(optical_az),math.sin(optical_el),math.cos(optical_el)*math.cos(optical_az)])
    right=np.cross(forward,np.array([0.,1.,0.]));right/=np.linalg.norm(right)
    up=np.cross(right,forward)
    right,up=math.cos(roll)*right+math.sin(roll)*up,-math.sin(roll)*right+math.cos(roll)*up
    return location,forward,right,up

def project(p):
    location,forward,right,up=basis(p)
    vectors=points-location
    depth=vectors@forward
    focal=math.exp(p[3])
    return np.column_stack([p[4]+focal*(vectors@right)/depth,p[5]-focal*(vectors@up)/depth])

p=np.array([.01,math.radians(41),math.log(26),math.log(2740),781,399,0.,0.,0.])
damping=.001
for iteration in range(300):
    residual=(project(p)-target).ravel()
    jac=np.zeros((8,len(p)))
    for i in range(len(p)):
        step=.001 if i in (4,5) else 1e-5
        trial=p.copy();trial[i]+=step
        jac[:,i]=(project(trial).ravel()-project(p).ravel())/step
    delta=np.linalg.lstsq(jac.T@jac+damping*np.eye(len(p)),-jac.T@residual,rcond=None)[0]
    trial=p+delta
    trial[1]=np.clip(trial[1],math.radians(20),math.radians(80))
    trial[2]=np.clip(trial[2],math.log(14),math.log(100))
    trial[3]=np.clip(trial[3],math.log(800),math.log(10000))
    if np.linalg.norm(project(trial)-target)<np.linalg.norm(residual):
        p=trial;damping=max(1e-8,damping/3)
        if np.linalg.norm(delta)<1e-9:break
    else:damping=min(1e10,damping*10)

location,forward,right,up=basis(p)
location[1]+=surface_y
look_target=location+forward*math.exp(p[2])
focal=math.exp(p[3]);fov=math.degrees(2*math.atan(height/(2*focal)))
reference=root/'assets/board/tabuleiro-brasil-alvo.png'
config={
 'schemaVersion':1,'reference':{'file':'assets/board/tabuleiro-brasil-alvo.png','sha256':hashlib.sha256(reference.read_bytes()).hexdigest(),'width':width,'height':height},
 'aspect':width/height,'position':location.tolist(),'up':up.tolist(),'target':look_target.tolist(),
 'fov':fov,'near':.1,'far':250,'principalPoint':[float(p[4]),float(p[5])],
 'viewOffset':[float(width/2-p[4]),float(height/2-p[5])],
 'envelope':{'width':extent,'depth':extent,'surfaceY':surface_y},
 'landmarks':{'labels':['NW','NE','SE','SW'],'referencePixels':target.tolist(),'worldPoints':[[float(x),surface_y,float(z)] for x,_,z in points]},
 'scope':'Calibração do envelope atual; não certifica fidelidade de arte, geometria ou percurso completo.'}

bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
scene.render.resolution_x=width;scene.render.resolution_y=height;scene.render.resolution_percentage=100
scene.render.pixel_aspect_x=scene.render.pixel_aspect_y=1
camera_data=bpy.data.cameras.new('ApprovedFrame_Calibration')
camera=bpy.data.objects.new('ApprovedFrame_Calibration',camera_data);scene.collection.objects.link(camera);scene.camera=camera
camera_data.type='PERSP';camera_data.sensor_fit='HORIZONTAL';camera_data.sensor_width=36;camera_data.lens=focal*36/width
camera_data.clip_start=.1;camera_data.clip_end=250
def native(v):return np.array([v[0],-v[2],v[1]])
r,u,b,c=native(right),native(up),native(-forward),native(location)
camera.matrix_world=Matrix([[r[0],u[0],b[0],c[0]],[r[1],u[1],b[1],c[1]],[r[2],u[2],b[2],c[2]],[0,0,0,1]])
origin=Vector(native(look_target))
def pixel(v):
    q=world_to_camera_view(scene,camera,v)
    return np.array([q.x*width,(1-q.y)*height])
bpy.context.view_layer.update()
baseline=pixel(origin)
camera_data.shift_x=.01;bpy.context.view_layer.update();slope_x=(pixel(origin)[0]-baseline[0])/.01;camera_data.shift_x=0
camera_data.shift_y=.01;bpy.context.view_layer.update();slope_y=(pixel(origin)[1]-baseline[1])/.01;camera_data.shift_y=0
camera_data.shift_x=(p[4]-baseline[0])/slope_x;camera_data.shift_y=(p[5]-baseline[1])/slope_y
bpy.context.view_layer.update()
blender_pixels=np.array([pixel(Vector(native(np.array([x,surface_y,z])))) for x,_,z in points])
if np.max(np.abs(blender_pixels-project(p)))>.02:raise RuntimeError('Projeção do Blender difere da calibração numérica.')
mesh=bpy.data.meshes.new('CalibrationEnvelope_NotFinalArt')
mesh.from_pydata([tuple(native(np.array([x,surface_y,z]))) for x,_,z in points],[(0,1),(1,2),(2,3),(3,0)],[])
envelope=bpy.data.objects.new('CalibrationEnvelope_NotFinalArt',mesh);scene.collection.objects.link(envelope)
envelope.display_type='WIRE';envelope.hide_render=True
camera_data.show_background_images=True
background=camera_data.background_images.new();background.image=bpy.data.images.load(str(reference));background.alpha=.5;background.display_depth='BACK'
background.image.filepath='//../../../board/tabuleiro-brasil-alvo.png'
error=np.linalg.norm(blender_pixels-target,axis=1)
report={'landmarkMethod':'Interseções estimadas manualmente dos trechos retos; validação de câmera, não contorno final arredondado.','projectedPixels':blender_pixels.tolist(),'errorsPixels':error.tolist(),'maxErrorPixels':float(np.max(error)),'rmsPixels':float(np.sqrt(np.mean(error**2))),'blenderVersion':bpy.app.version_string,'nativeCamera':{'lensMm':camera_data.lens,'shiftX':camera_data.shift_x,'shiftY':camera_data.shift_y},'paidCredits':0}
if report['maxErrorPixels']>3:raise RuntimeError('Envelope não atingiu tolerância de calibração de 3 px: '+str(report))
config_path.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(out/'calibration.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'fixed-camera.blend'))
print(json.dumps({'fov':fov,'maxErrorPixels':report['maxErrorPixels'],'position':config['position'],'principalPoint':config['principalPoint']}))
