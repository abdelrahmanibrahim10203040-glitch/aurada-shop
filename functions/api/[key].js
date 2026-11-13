export async function onRequestGet({env,params}){
  const o=await env.BUCKET.get(params.key);if(!o)return new Response("",{status:404});
  return new Response(o.body,{headers:{"content-type":o.httpMetadata?.contentType||"image/webp","cache-control":"public,max-age=31536000,immutable"}})}
