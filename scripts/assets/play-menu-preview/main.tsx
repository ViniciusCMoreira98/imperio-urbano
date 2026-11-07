import React,{useState,useRef}from'react';import{createRoot}from'react-dom/client';import type{GameMode}from'@imperio/shared-types';
import{LocalPlayScreen,OnlinePlayScreen,CreateOnlineRoomScreen,PrivateRoomsScreen}from'../../../apps/web/src/play-menu/PlayEntryScreens';
import{PlayerMenuCard,CurrencyMenuCard}from'../../../apps/web/src/play-menu/MenuCards';
import{PublicRoomsScreen}from'../../../apps/web/src/play-menu/PublicRoomsScreen';
import{AvatarPortrait}from'../../../apps/web/src/hud/AvatarPortrait';

function Preview(){
 const initial=new URLSearchParams(location.search).get('view')??'lan';
 const[roomsState,setRoomsState]=useState('list'),[joiningRoom,setJoiningRoom]=useState<string|null>(null);
 const rooms=[{id:'sala-1',name:'Turma da Praia',hostName:'Marina',mode:'CLASSIC' as const,players:2,capacity:4,joinable:true},{id:'sala-2',name:'Partida rápida',hostName:'Lucas',mode:'QUICK' as const,players:3,capacity:4,joinable:true},{id:'sala-3',name:'Galera do Brasil',hostName:'Sofia',mode:'CLASSIC' as const,players:4,capacity:4,joinable:false}];
 const[view,setView]=useState(initial),[mode,setMode]=useState<GameMode>('CLASSIC'),[code,setCode]=useState(''),[pending,setPending]=useState<'create'|'join'|null>(null),[error,setError]=useState<string|undefined>(),[feedback,setFeedback]=useState(''),[nickname,setNickname]=useState('Vinícius'),[minimal,setMinimal]=useState(false),[longBalance,setLongBalance]=useState(false);
 const actions=useRef<{type:string;channel:string;mode?:string;code?:string}[]>([]);
 const act=(type:string)=>{actions.current.push({type,channel:view,...(type==='create'?{mode}:{}),...(type==='join'?{code}:{})});setFeedback(`Prévia visual — ${type==='create'?'criação':type==='join'?'entrada':'card'} registrada apenas nesta demonstração.`);};
 const player={nickname,portrait:<AvatarPortrait avatarId="avatar-2"/>,...(!minimal?{level:28,experience:{current:12450,target:15000}}:{})};
 const wallet=!minimal?{coins:longBalance?9999999:156800,diamonds:2430,onAddCoins:()=>act('coins'),onAddDiamonds:()=>act('diamonds')}:undefined;
 (window as any).playMenuQA={setView,setRoomsState,setJoiningRoom,setPending,setError,setNickname,setMinimal,setLongBalance,getActions:()=>actions.current,getMode:()=>mode,getCode:()=>code};
 if(view==='rooms')return <><PublicRoomsScreen player={player} rooms={roomsState==='empty'?[]:rooms} loading={roomsState==='loading'} joiningId={joiningRoom} error={roomsState==='error'?'Não foi possível carregar as salas. Tente atualizar.':undefined} onBack={()=>setView('online')} onRefresh={()=>{act('refresh');setRoomsState('list');}} onJoin={id=>{actions.current.push({type:'join-public',channel:'online',code:id});setFeedback('Prévia visual — sala selecionada: '+id+'. Nenhuma entrada enviada.');}}/><div className="preview-feedback" role="status">{feedback}</div></>;
 if(view==='cards')return <main className="cards-demo"><h1>Cards do menu</h1><PlayerMenuCard {...player}/><div className="cards-demo-row"><CurrencyMenuCard kind="coins" balance={156800} onAdd={()=>act('coins')}/><CurrencyMenuCard kind="diamonds" balance={2430} onAdd={()=>act('diamonds')}/></div><p className="cards-demo-caption">Jogador · Moedas · Diamantes</p><div className="preview-feedback" role="status">{feedback}</div></main>;
 const props={player,wallet,mode,onModeChange:setMode,inviteCode:code,onInviteCodeChange:setCode,pending,error,onCreate:()=>act('create'),onJoin:()=>act('join'),onBack:()=>{location.href='/scripts/assets/main-menu-preview/';}};
 return <>{view==='online'?<OnlinePlayScreen player={player} wallet={wallet} onBack={props.onBack} onCreateRoom={()=>setView('create-online')} onPublicRooms={()=>setView('rooms')} onPrivateRooms={()=>setView('private')}/>:view==='create-online'?<CreateOnlineRoomScreen {...props} onBack={()=>setView('online')}/>:view==='private'?<PrivateRoomsScreen {...props} onBack={()=>setView('online')}/>:<LocalPlayScreen {...props}/>}<div className="preview-feedback" role="status">{feedback}</div></>;
}
createRoot(document.querySelector('#root')!).render(<Preview/>);
