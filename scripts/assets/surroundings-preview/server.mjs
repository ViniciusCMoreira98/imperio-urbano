import {createServer} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const server=await createServer({root,configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4186,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei','zustand','gsap']}});
await server.listen();console.log('Mesa ampliada: http://127.0.0.1:4186/scripts/assets/surroundings-preview/');
