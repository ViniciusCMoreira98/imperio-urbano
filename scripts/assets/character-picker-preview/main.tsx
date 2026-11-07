import React from 'react';
import {createRoot} from 'react-dom/client';
import {CharacterPicker} from '../../../apps/web/src/play-menu/CharacterPicker';
import {useAppStore} from '../../../apps/web/src/store/appStore';
import {useCharacterStore} from '../../../apps/web/src/store/characterStore';

let saveMode='success',releaseSave:(()=>void)|undefined;
const calls:{avatarId:string;pawnColor:string}[]=[];
// Estado restrito à prévia. Não chama API nem usa a sessão real do dispositivo.
useAppStore.setState({session:{playerId:'art-preview',nickname:'Vinícius',token:'preview-only'},screen:'menu'});
useCharacterStore.setState({character:{avatarId:'avatar-2',pawnColor:'AZUL'},pickerOpen:true,save:async(_token,avatarId,pawnColor)=>{
 calls.push({avatarId,pawnColor});
 if(saveMode==='pending')await new Promise<void>(resolve=>{releaseSave=resolve;});
 if(saveMode==='error')throw new Error('Prévia de erro');
 useCharacterStore.setState({character:{avatarId,pawnColor}});
}});
(window as any).characterPickerQA={open:()=>useCharacterStore.getState().openPicker(),setSaveMode:(mode:string)=>{saveMode=mode;},release:()=>releaseSave?.(),calls:()=>calls,getCharacter:()=>useCharacterStore.getState().character};
function Preview(){return <><main className="cp-preview-launch"><h1>Seu personagem</h1><button type="button" onClick={()=>useCharacterStore.getState().openPicker()}>Escolher personagem</button></main><CharacterPicker/></>;}
createRoot(document.getElementById('root')!).render(<Preview/>);
