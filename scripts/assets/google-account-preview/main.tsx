import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MenuScreen} from '../../../apps/web/src/screens/MenuScreen';
import {SettingsDialog} from '../../../apps/web/src/hud/SettingsDialog';
import {useAppStore} from '../../../apps/web/src/store/appStore';
import {api,ApiError} from '../../../apps/web/src/net/api';
import type {LobbyView} from '@imperio/shared-types';

const params=new URLSearchParams(location.search),view=params.get('view')??'menu',state=params.get('state')??'guest';
const guest={playerId:'art-preview',nickname:'Vinícius',token:'preview-only',google:false,email:null,photoUrl:null};
useAppStore.setState({session:view==='menu'?null:{...guest,google:state==='linked',email:state==='linked'?'vinicius.nome.completo@exemplo.com.br':null},screen:'menu'});
sessionStorage.removeItem('imperio.session');
if(params.has('last'))localStorage.setItem('imperio.lastSession',JSON.stringify(guest));else localStorage.removeItem('imperio.lastSession');
const calls:{type:string;token?:string|null}[]=[];let credentialCallback:((response:{credential:string})=>void)|undefined;
api.authConfig=async()=>({googleClientId:state==='off'?null:'1234567890-artpreview.apps.googleusercontent.com'});
api.me=async()=>{const s=useAppStore.getState().session!;return{playerId:s.playerId,nickname:s.nickname,google:!!s.google,email:s.email??null,photoUrl:s.photoUrl??null};};
api.googleSignIn=async(_credential,token)=>{calls.push({type:'google',token});if(state==='error')throw new ApiError('Não foi possível entrar. Tente novamente.',503);return{...guest,google:true,email:'vinicius@exemplo.com.br',outcome:token?'LINKED':'CREATED'};};
api.createSession=async nickname=>{calls.push({type:'guest'});return{...guest,nickname};};
api.wallet=async()=>({coins:1000,diamonds:0,wins:2});api.myGames=async()=>view==='home'?[{gameId:'art-room',inviteCode:'ARTE01',status:'LOBBY',mode:'CLASSIC',players:[]}] as LobbyView[]:[];api.character=async()=>({avatarId:'avatar-2',pawnColor:'AZUL'});api.logout=async token=>{calls.push({type:'logout',token});};
// O slot neutro isola o layout: não copia a marca Google nem solicita credencial real.
window.google={accounts:{id:{initialize:options=>{credentialCallback=options.callback;},renderButton:(parent,options)=>{if(state==='sdk-error')throw new Error('SDK indisponível na simulação');const frame=document.createElement('iframe');frame.title='Área do botão oficial (prévia de layout)';frame.width=String(options.width??280);frame.height='40';frame.style.border='0';frame.srcdoc='<html><body style="margin:0;display:grid;place-items:center;height:40px;box-sizing:border-box;border:1px dashed #91b4c9;border-radius:8px;background:#102e45;color:#bed6e3;font:11px Arial">Área do botão oficial · prévia</body></html>';parent.appendChild(frame);calls.push({type:'renderer'});}}}};
(window as any).googleAccountQA={credential:()=>credentialCallback?.({credential:'preview-credential'}),calls:()=>calls,getSession:()=>useAppStore.getState().session};
function Preview(){const[open,setOpen]=useState(true);return view!=='account'?<MenuScreen/>:<main className="account-art-stage"><SettingsDialog open={open} onClose={()=>setOpen(false)} inGame={false}/></main>;}
createRoot(document.getElementById('root')!).render(<Preview/>);
