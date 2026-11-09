import{api,cloudConfigured,HOME_TENANT_ID}from'../utils/cloudAuth';

const records=new Map(),versions=new Map(),listeners=new Set();
let loaded=false,queue=Promise.resolve(),lastError=null,syncing=0;
const show=(status,message='')=>{
 try{window.dispatchEvent(new CustomEvent('home-cloud-status',{detail:{status,message}}))}catch{}
 for(const fn of listeners)fn({status,message});
};
export const cloudReady=()=>loaded;
export const cloudError=()=>lastError;
export const subscribeCloud=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
export const erpCloudStorage={
 getItem:key=>records.has(key)?records.get(key):null,
 setItem:(key,value)=>{if(!loaded)throw Error('Banco não foi carregado.');const raw=String(value);if(records.get(key)===raw)return Promise.resolve();records.set(key,raw);return queueCloudWrite({[key]:raw})},
 removeItem:key=>{if(!loaded)throw Error('Banco não foi carregado.');records.delete(key);return queueCloudWrite({[key]:null})},
 key:index=>[...records.keys()][index]||null,
 get length(){return records.size}
};

export async function loadCloudDocuments(){
 if(!cloudConfigured())throw Error('Supabase da Home Interiores não configurado.');
 const page=await api('/rest/v1/erphomeinteriores_documents?select=document_key,document_value,revision&tenant_owner_id=eq.'+encodeURIComponent(HOME_TENANT_ID)+'&limit=1000');
 records.clear();versions.clear();
 for(const doc of page||[]){
  if(doc.document_value!==null)records.set(doc.document_key,String(doc.document_value));
  versions.set(doc.document_key,Number(doc.revision)||0);
 }
 lastError=null;loaded=true;show('ready');
 try{window.dispatchEvent(new CustomEvent('home-cloud-reloaded'))}catch{}
 return records.size;
}

export async function commitCloudDocuments(changes={}){
 if(!loaded)throw Error('O banco ainda não foi carregado.');
 const expected=Object.fromEntries(Object.keys(changes).map(k=>[k,versions.get(k)||0]));
 syncing++;show('saving');
 try{
  const updated=await api('/rest/v1/rpc/erphomeinteriores_save_documents',{method:'POST',body:{p_changes:changes,p_expected:expected}});
  for(const [k,v] of Object.entries(changes)){
   if(v===null)records.delete(k);else records.set(k,String(v));
   versions.set(k,updated?.[k]||((versions.get(k)||0)+1));
  }
  lastError=null;
  return updated;
 }catch(error){
  lastError=error;show('error',error.message);throw error;
 }finally{
  syncing--;
  if(syncing===0&&!lastError)show('saved');
 }
}

export function queueCloudWrite(changes={}){
 queue=queue.catch(()=>{}).then(()=>commitCloudDocuments(changes));
 queue.catch(err=>console.error('Falha ao persistir no Supabase:',err));
 return queue;
}
export async function flushCloudWrites(){await queue;if(lastError)throw lastError}
export function clearCloudDocuments(){records.clear();versions.clear();loaded=false;lastError=null;queue=Promise.resolve();show('disconnected')}

export async function importLegacyDocuments(keys=[]){
 const selections={};
 for(const key of keys){
  const raw=window.localStorage.getItem(key);
  if(raw!==null&&(!records.has(key)||records.get(key)===null))selections[key]=raw;
 }
 const batch=Object.entries(selections);
 if(!batch.length)return{inserted:0};
 for(let i=0;i<batch.length;i+=25)await commitCloudDocuments(Object.fromEntries(batch.slice(i,i+25)));
 return{inserted:batch.length};
}
export function availableLegacyKeys(){
 const keys=[];
 for(let i=0;i<window.localStorage.length;i++){
  const k=window.localStorage.key(i);
  if(k&&(k.startsWith('home-')||k.startsWith('homeerp-'))&&!k.includes('__snapshot__')&&!k.startsWith('home-auth')&&!k.includes('app-schema-version'))keys.push(k);
 }
 return keys;
}
