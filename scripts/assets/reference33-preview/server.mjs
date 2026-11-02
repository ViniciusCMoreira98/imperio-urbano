import{createServer}from'vite';import{fileURLToPath}from'node:url';
const server=await createServer({root:fileURLToPath(new URL('../../../',import.meta.url)),configFile:false,esbuild:{jsx:'automatic'},publicDir:fileURLToPath(new URL('../../../apps/web/public/',import.meta.url)),server:{host:'127.0.0.1',port:4183,strictPort:true},optimizeDeps:{include:['react','react-dom/client','three','@react-three/fiber','@react-three/drei']}});
await server.listen();console.log('Prévia das 33 casas: http://127.0.0.1:4183/scripts/assets/reference33-preview/');
