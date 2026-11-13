export async function onRequestGet({env}){
  const {results}=await env.DB.prepare("SELECT data FROM products ORDER BY pos").all();
  const out=results.map(r=>JSON.parse(r.data)).filter(p=>!p.hide).map(p=>{if(p.hidePrice){delete p.price;delete p.old}return p});
  return new Response(JSON.stringify(out),{headers:{"content-type":"application/json","cache-control":"no-cache"}});
}