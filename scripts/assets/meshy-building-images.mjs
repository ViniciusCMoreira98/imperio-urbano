// Conversão por imagem pelo conector Meshy instalado e explicitamente habilitado.
import{readFile,writeFile,mkdir}from'node:fs/promises';import{homedir}from'node:os';import{resolve}from'node:path';import{pathToFileURL,fileURLToPath}from'node:url';import{createHash}from'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url)),integration=resolve(homedir(),'.codex/integrations/meshy'),sdk=resolve(integration,'node_modules/@modelcontextprotocol/sdk/dist/esm');
const{Client}=await import(pathToFileURL(resolve(sdk,'client/index.js'))),{StdioClientTransport}=await import(pathToFileURL(resolve(sdk,'client/stdio.js')));
const config=await readFile(resolve(homedir(),'.codex/config.toml'),'utf8'),block=config.match(/^\[mcp_servers\.meshy\][\s\S]*?(?=^\[|(?![\s\S]))/m)?.[0]??'',list=block.match(/^enabled_tools\s*=\s*\[([^\r\n]*)\]/m)?.[1]??'';
if(![...list.matchAll(/['"]([^'"]+)['"]/g)].some(m=>m[1]==='meshy_image_to_3d'))throw Error('Conversão Meshy por imagem não habilitada.');
const client=new Client({name:'imperio-building-images',version:'1.0.0'}),transport=new StdioClientTransport({command:'C:/Program Files/nodejs/node.exe',args:[`--env-file=${resolve(root,'../../variable.env')}`,resolve(integration,'node_modules/@meshy-ai/meshy-mcp-server/dist/index.js')],cwd:integration,stderr:'pipe'});
const parse=r=>r.structuredContent??JSON.parse(r.content.find(c=>c.type==='text').text);
try{
 await client.connect(transport);
 if(process.argv[2]==='inspect'){const result=await client.listTools();const tool=result.tools.find(t=>t.name==='meshy_image_to_3d');console.log(JSON.stringify(tool?.inputSchema));}
 else if(['create','create-terrain'].includes(process.argv[2])){
  const terrain=process.argv[2]==='create-terrain';
  const plan=JSON.parse(await readFile(resolve(root,`assets/3d/requests/${terrain?'terrain-meshy-image-plan':'buildings-meshy-image-plan'}.json`),'utf8'));if(terrain?(plan.budgetCredits!==30||plan.tasks.length!==1||plan.tasks[0].level!==0||plan.tasks[0].sourceArtwork!=='terrain-v2.png'):(plan.budgetCredits!==250||plan.tasks.length!==5))throw Error('Plano fora do orçamento informado.');
  const balance=parse(await client.callTool({name:'meshy_check_balance',arguments:{response_format:'json'}}));if(balance.balance<(terrain?30:150))throw Error('Saldo insuficiente.');
  const directory=resolve(root,'assets/3d/requests/buildings-images');await mkdir(directory,{recursive:true});
  for(const task of plan.tasks){
   const path=resolve(directory,`level-${task.level}.json`),image=await readFile(resolve(root,'apps/web/src/property-evolution/art',task.sourceArtwork));
   const params={file_path:resolve(root,'apps/web/src/property-evolution/art',task.sourceArtwork),image_enhancement:false,ai_model:'meshy-7.1',model_type:'standard',geometry_resolution:'standard',should_remesh:true,target_polycount:task.level===5?14000:12000,topology:'triangle',should_texture:true,texture_resolution:'2k',enable_pbr:true,target_formats:['glb'],response_format:'json'};
   const state={level:task.level,sourceArtwork:task.sourceArtwork,sourceSha256:createHash('sha256').update(image).digest('hex'),expectedCredits:30,stage:'SUBMITTING_DO_NOT_RETRY',submittedAt:new Date().toISOString(),parameters:params,explicitImageUploadAuthorized:true};
   await writeFile(path,JSON.stringify(state,null,2)+'\n',{flag:'wx'});
   try{const result=await client.callTool({name:'meshy_image_to_3d',arguments:params},undefined,{timeout:60000});if(result.isError){state.stage='ERROR_CHECK_TASK_LIST';await writeFile(path,JSON.stringify(state,null,2));console.error('Meshy não confirmou a tarefa. Conferir histórico antes de repetir.');process.exitCode=1;break;}const data=parse(result);state.stage='CREATED';state.taskId=data.task_id;await writeFile(path,JSON.stringify(state,null,2)+'\n');console.log(JSON.stringify({level:task.level,taskId:data.task_id,status:data.status,credits:30}));}catch{console.error(`Nível ${task.level}: consultar registro e tarefas antes de repetir; nenhuma repetição automática.`);process.exitCode=1;break;}
  }
 }else throw Error('Usar inspect, create ou create-terrain');
}finally{await client.close();}
