const BASE=import.meta.env.VITE_SUPABASE_URL||'';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
export const HOME_TENANT_ID=import.meta.env.VITE_HOME_TENANT_ID||'';
const assertConfigured=()=>{if(!BASE||!KEY||!HOME_TENANT_ID)throw Error('Conexão Supabase da Home Interiores não configurada.')};
const errorText=j=>j?.msg||j?.error_description||j?.message||j?.error||'Erro de comunicação com Supabase.';
export const cloudConfigured=()=>Boolean(BASE&&KEY&&HOME_TENANT_ID);
export async function api(path,{method='GET',body,headers={}}={}){
 assertConfigured();
 const response=await fetch(BASE+path,{
  method,
  headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',...headers},
  body:body===undefined?undefined:JSON.stringify(body)
 });
 const raw=await response.text();let result=null;
 try{result=raw?JSON.parse(raw):null}catch{result=raw}
 if(!response.ok)throw Error(errorText(result)+' ('+response.status+')');
 return result;
}
export const getSupabaseBase=()=>BASE;
export const getSupabaseKey=()=>KEY;
