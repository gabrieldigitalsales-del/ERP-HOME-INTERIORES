import React,{useEffect,useState}from'react';
import App from'./App';
import LoadingScreen from'./components/LoadingScreen';
import{cloudConfigured}from'./utils/cloudAuth';
import{loadCloudDocuments,erpCloudStorage,importLegacyDocuments,availableLegacyKeys,flushCloudWrites}from'./services/cloudStore';

export default function CloudGate(){
 const[stage,setStage]=useState('loading'),[error,setError]=useState(''),[legacyKeys,setLegacyKeys]=useState([]),[busy,setBusy]=useState(false);
 const init=async()=>{
  if(!cloudConfigured()){setStage('unconfigured');return}
  setStage('loading');setError('');
  try{
   await loadCloudDocuments();
   const keys=availableLegacyKeys();
   setLegacyKeys(keys);
   if(erpCloudStorage.length===0&&keys.length){setStage('migrate');return}
   setStage('ready');
  }catch(e){setError(e.message||'Erro ao carregar o banco');setStage('error')}
 };
 useEffect(()=>{init()},[]);
 useEffect(()=>{
  if(stage!=='ready')return;
  let refreshing=false;
  const refresh=async()=>{
   if(refreshing||document.hidden)return;
   refreshing=true;
   try{await flushCloudWrites();await loadCloudDocuments()}catch(e){console.warn('Atualização Supabase:',e.message)}
   finally{refreshing=false}
  };
  const timer=setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh)}
 },[stage]);

 const importExisting=async()=>{
  if(busy)return;setBusy(true);setError('');
  try{await importLegacyDocuments(legacyKeys);await loadCloudDocuments();setStage('ready')}
  catch(e){setError(e.message||'Falha ao importar os dados existentes')}
  finally{setBusy(false)}
 };
 const startClean=()=>setStage('ready');
 const backup=()=>{
  const data={};
  for(const k of legacyKeys){const v=localStorage.getItem(k);if(v!==null)data[k]=v}
  const a=document.createElement('a'),blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});
  a.href=URL.createObjectURL(blob);a.download='home-erp-backup-antes-do-supabase.json';a.click();URL.revokeObjectURL(a.href);
 };

 if(stage==='loading')return <LoadingScreen persist/>;
 if(stage==='ready')return <App/>;
 return <div className="erp-cloud-gate"><div className="erp-cloud-gate-card">
  <h2>{stage==='migrate'?'Dados existentes encontrados':stage==='unconfigured'?'Conexão com Supabase ausente':'Não foi possível carregar o banco'}</h2>
  {stage==='migrate'?<>
   <p>Encontrei {legacyKeys.length} conjunto(s) de dados neste navegador e o banco da Home ainda está vazio. Você pode enviar esses dados para o Supabase sem alterar o login do ERP.</p>
   <button className="secondary" onClick={backup} disabled={busy}>Baixar cópia antes de migrar</button>
   <button className="primary" onClick={importExisting} disabled={busy}>{busy?'Importando...':'Importar dados existentes para o Supabase'}</button>
   <button className="secondary" onClick={startClean} disabled={busy}>Começar com o banco atual</button>
  </>:<p>{stage==='unconfigured'?'Configure as variáveis VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e VITE_HOME_TENANT_ID na Vercel.':error}</p>}
  {error&&stage==='migrate'&&<p className="login-error" role="alert">{error}</p>}
  {stage==='error'&&<button onClick={init}>Tentar novamente</button>}
 </div></div>;
}
