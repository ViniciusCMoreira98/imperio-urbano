/** C9: dados no primeiro plano do miolo, aos lados da faixa inferior do logotipo. */
export function board34Dice(supportY,project){
 const size=.68,travel=.40,bounce=.50,radius=Math.sqrt(3)*size/2;
 const dice=[{x:-2.45,yaw:.25,face:5},{x:2.30,yaw:-.22,face:3}].map(({x,yaw,face})=>{
  const position=[x,supportY+size/2,2.40];return{face,size,pixel:project(position),yaw,position};
 });
 const minY=supportY+radius+.02;
 return{dice,diceRoll:{supportY,horizontalTravel:travel,bounceHeight:bounce,rotationClearance:'bounding-sphere',centerBounds:dice.map(({position:[x,,z]})=>({min:[x-travel,minY,z-travel],max:[x+travel,minY+bounce,z+travel]}))}};
}
