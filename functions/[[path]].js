import {json,login,authed,cookie} from "./_lib.js";
export async function onRequest({request:req,env,params}){
  const path=(params.path||[]).join("/"),M=req.method;
  
  // السماح للعامة بجلب المنتجات بدون تسجيل دخول
  if(path==="products"&&M==="GET"){
    const {results}=await env.DB.prepare("SELECT data FROM products ORDER BY pos").all();
    return json(results.map(r=>JSON.parse(r.data)));
  }

  if(path==="login"&&M==="POST"){const b=await req.json().catch(()=>({}));const v=await login(env,b.password);
    return v?json({ok:1},200,{"set-cookie":cookie(v,2592000)}):json({error:"bad"},401)}
  if(path==="logout")return json({ok:1},200,{"set-cookie":cookie("",0)});
  
  // باقي عمليات الأدمن تتطلب توثيق
  if(!await authed(req,env))return json({error:"auth"},401);
  
  if(path==="upload"&&M==="POST"){const t=req.headers.get("content-type")||"";if(!/^image\/(webp|jpeg|png)$/.test(t))return json({error:"type"},400);
    const buf=await req.arrayBuffer();if(buf.byteLength>6e6)return json({error:"big"},413);
    const k=crypto.randomUUID().slice(0,12)+".webp";await env.BUCKET.put(k,buf,{httpMetadata:{contentType:t}});return json({url:"/api/img/"+k})}
  
  const m=path.match(/^products\/([\w-]+)$/);
  if(m&&M==="PUT"){const p=await req.json();p.id=m[1];
    const old=await env.DB.prepare("SELECT pos FROM products WHERE id=?").bind(p.id).first();
    let pos=old?old.pos:((await env.DB.prepare("SELECT MIN(pos) m FROM products").first()).m??1)-1;
    p.pos=pos;await env.DB.prepare("INSERT OR REPLACE INTO products(id,pos,data) VALUES(?,?,?)").bind(p.id,pos,JSON.stringify(p)).run();return json(p)}
  if(m&&M==="DELETE"){const r=await env.DB.prepare("SELECT data FROM products WHERE id=?").bind(m[1]).first();
    if(r)for(const u of JSON.parse(r.data).img||[])if(u.startsWith("/api/img/"))await env.BUCKET.delete(u.slice(9));
    await env.DB.prepare("DELETE FROM products WHERE id=?").bind(m[1]).run();return json({ok:1})}
  return json({error:"nf"},404)}