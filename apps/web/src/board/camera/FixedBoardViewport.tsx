import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { FIXED_CAMERA } from './fixedCamera';

/** A composição inteira escala uniformemente; a câmera não afasta nem aproxima no celular. */
export function FixedBoardViewport({children,expanded=false}:{children:ReactNode;expanded?:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:0,height:0});
  useLayoutEffect(()=>{
    const element=root.current;if(!element)return;
    const observer=new ResizeObserver(([entry])=>{
      const width=expanded?entry.contentRect.width:Math.min(entry.contentRect.width,entry.contentRect.height*FIXED_CAMERA.aspect);
      const height=expanded?entry.contentRect.height:width/FIXED_CAMERA.aspect;
      setSize(previous=>previous.width===width&&previous.height===height?previous:{width,height});
    });
    observer.observe(element);return()=>observer.disconnect();
  },[expanded]);
  return <div ref={root} className="board-stage" style={{width:'100%',height:'100%',display:'grid',placeItems:'center',background:'#2b1914'}}>
    <div className="board-composition" style={{width:size.width,height:size.height,position:'relative',overflow:'hidden'}}>{size.width>0&&children}</div>
  </div>;
}
