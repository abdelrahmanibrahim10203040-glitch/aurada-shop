const enc=new TextEncoder();
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
async function sig(env,t){const k=await crypto.subtle.importKey("raw",enc.encode(env.SESSION_SECRET),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(await crypto.subtle.sign("HMAC",k,enc.encode(t)))}
export const json=(d,s=200,h={})=>new Response(JSON.stringify(d),{status:s,headers:{"content-type":"application/json","cache-control":"no-store",...h}});
export async function login(env,pw){
  if(!env.ADMIN_PASSWORD||!env.SESSION_SECRET||pw!==env.ADMIN_PASSWORD){await new Promise(r=>setTimeout(r,800));return null}
  const exp=Date.now()+30*864e5;return exp+"."+await sig(env,""+exp)}
export async function authed(req,env){
  const m=(req.headers.get("cookie")||"").match(/(?:^|;\s*)s=(\d+)\.([0-9a-f]+)/);
  return !!(m&&env.SESSION_SECRET&&+m[1]>Date.now()&&m[2]===await sig(env,m[1]))}
export const cookie=(v,age)=>`s=${v}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
