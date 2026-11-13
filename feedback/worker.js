const cors=(origin)=>({"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"});
const reply=(data,status,origin)=>new Response(JSON.stringify(data),{status,headers:{...cors(origin),"Content-Type":"application/json"}});
export default {async fetch(req,env){
const origin=req.headers.get("Origin")||"",allowed=env.ALLOWED_ORIGIN||"https://l4dx-training.github.io";
if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(allowed)});
if(origin!==allowed)return reply({error:"Origin not allowed"},403,allowed);
if(req.method!=="POST")return reply({error:"Method not allowed"},405,allowed);
if(!env.GITHUB_TOKEN)return reply({error:"Worker is not configured"},500,allowed);
try{
const body=await req.json();if(!body?.answers||typeof body.answers!=="object")return reply({error:"Invalid submission"},400,allowed);
const owner=env.GITHUB_OWNER||"L4Dx-Training",repo=env.GITHUB_REPO||"AI-STARTER-PROGRAM",branch=env.GITHUB_BRANCH||"main",path="feedback/feedback.txt";
const url=`https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
const headers={"Authorization":`Bearer ${env.GITHUB_TOKEN}`,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"L4DX-Feedback-Collector","Content-Type":"application/json"};
const line=JSON.stringify({submittedAt:body.submittedAt||new Date().toISOString(),answers:body.answers})+"\n";
for(let n=0;n<4;n++){
const r=await fetch(url+`?ref=${encodeURIComponent(branch)}`,{headers});let sha=null,old="";
if(r.status===200){const file=await r.json();sha=file.sha;const bin=atob(file.content.replace(/\n/g,""));old=new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));}
else if(r.status!==404)return reply({error:"Could not read feedback file"},502,allowed);
const bytes=new TextEncoder().encode(old+line),encoded=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(""));
const save=await fetch(url,{method:"PUT",headers,body:JSON.stringify({message:"Add AI Startup Program feedback submission",content:encoded,branch,...(sha?{sha}:{})})});
if(save.ok)return reply({ok:true},200,allowed);
if(save.status!==409&&save.status!==422)return reply({error:"Could not save feedback"},502,allowed);
await new Promise(res=>setTimeout(res,250*(n+1)));
}
return reply({error:"Please retry submission"},409,allowed);
}catch(e){return reply({error:"Invalid request or server error"},400,allowed);}
}};
