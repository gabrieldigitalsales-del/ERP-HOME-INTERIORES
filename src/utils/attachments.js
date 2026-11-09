import{api,cloudConfigured,HOME_TENANT_ID,getSupabaseBase,getSupabaseKey}from'./cloudAuth';
import{getLocalSession}from'./auth';
const BUCKET='erphomeinteriores-files';
const DB_NAME='homeerp-attachments',STORE='files',VERSION=1;
function dbOpen(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(new Error('IndexedDB indisponível'));const req=indexedDB.open(DB_NAME,VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function legacyList(){try{const db=await dbOpen();return await new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)})}catch{return[]}}
export const listLegacyLocalAttachments=legacyList;
function legacyPut(row){return dbOpen().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(row);tx.oncomplete=()=>resolve(row.id);tx.onerror=()=>reject(tx.error)}))}
function legacyGet(id){return dbOpen().then(db=>new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)}))}
async function legacyDelete(id){try{const db=await dbOpen();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)})}catch{return false}}
async function requestObject(path,options={}){
 const BASE=getSupabaseBase(),KEY=getSupabaseKey();
 const response=await fetch(BASE+'/storage/v1/object/'+path,{...options,headers:{apikey:KEY,Authorization:'Bearer '+KEY,...options.headers}});
 if(!response.ok){const t=await response.text();throw Error('Falha no armazenamento Supabase: '+t.slice(0,220))}
 return response;
}
const fullPath=p=>p.split('/').map(encodeURIComponent).join('/');
const isAdmin=()=>getLocalSession()?.role==='Administrador';
export async function putAttachment({id,name,type,dataUrl,module,recordId}){
 if(!cloudConfigured())return legacyPut({id,name,type,dataUrl,module,recordId,createdAt:new Date().toISOString()});
 if(!isAdmin())throw Error('Somente o administrador pode incluir anexos.');
 if(!id||!dataUrl)throw Error('Arquivo inválido ou vazio.');
 const blob=await fetch(dataUrl).then(r=>r.blob());
 if(blob.size>15728640)throw Error('Tamanho máximo: 15 MB por arquivo.');
 const objectPath=HOME_TENANT_ID+'/'+encodeURIComponent(id);
 await requestObject(BUCKET+'/'+fullPath(objectPath),{method:'POST',headers:{'Content-Type':type||blob.type||'application/octet-stream','cache-control':'3600','x-upsert':'true'},body:blob});
 try{
  await api('/rest/v1/erphomeinteriores_attachments',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:{id,tenant_owner_id:HOME_TENANT_ID,object_path:objectPath,filename:name||'Arquivo',content_type:type||blob.type||'',module:module||'',record_id:recordId||'',file_size:blob.size}});
 }catch(error){
  try{await requestObject(BUCKET+'/'+fullPath(objectPath),{method:'DELETE'})}catch{}
  throw error;
 }
 return id;
}
export async function getAttachment(id){
 if(!id)return null;
 if(!cloudConfigured())return legacyGet(id);
 const rows=await api('/rest/v1/erphomeinteriores_attachments?select=*&tenant_owner_id=eq.'+HOME_TENANT_ID+'&id=eq.'+encodeURIComponent(id));
 if(!rows?.length)return null;
 const row=rows[0];
 const blob=await requestObject('authenticated/'+BUCKET+'/'+fullPath(row.object_path)).then(r=>r.blob());
 const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
 return{id:row.id,name:row.filename,type:row.content_type,dataUrl,module:row.module,recordId:row.record_id,createdAt:row.created_at};
}
export async function listAttachments(){
 if(!cloudConfigured())return(await legacyList()).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
 const rows=await api('/rest/v1/erphomeinteriores_attachments?select=*&tenant_owner_id=eq.'+HOME_TENANT_ID+'&order=created_at.desc&limit=1000');
 return(rows||[]).map(r=>({id:r.id,name:r.filename,type:r.content_type,module:r.module,recordId:r.record_id,createdAt:r.created_at,bytes:r.file_size,objectPath:r.object_path}));
}
export async function deleteAttachment(id){
 if(!cloudConfigured())return legacyDelete(id);
 if(!isAdmin())return false;
 const rows=await api('/rest/v1/erphomeinteriores_attachments?select=object_path&tenant_owner_id=eq.'+HOME_TENANT_ID+'&id=eq.'+encodeURIComponent(id));
 if(!rows?.length)return false;
 await requestObject(BUCKET+'/'+fullPath(rows[0].object_path),{method:'DELETE'});
 await api('/rest/v1/erphomeinteriores_attachments?tenant_owner_id=eq.'+HOME_TENANT_ID+'&id=eq.'+encodeURIComponent(id),{method:'DELETE'});
 return true;
}
export async function countAttachments(){return(await listAttachments()).length}
export async function attachmentStorageEstimate(){const rows=await listAttachments();return{count:rows.length,bytes:rows.reduce((s,r)=>s+(Number(r.bytes)||String(r.dataUrl||'').length),0)}}
