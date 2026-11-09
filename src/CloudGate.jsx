import React,{useEffect,useState}from'react';
import App from'./App';
import LoadingScreen from'./components/LoadingScreen';
import{cloudConfigured}from'./utils/cloudAuth';
import{loadCloudDocuments,flushCloudWrites}from'./services/cloudStore';

export default function CloudGate(){
 const[stage,setStage]=useState('loading');
 const init=async()=>{
  if(!cloudConfigured()){setStage('ready');return}
  setStage('loading');
  try{await loadCloudDocuments();setStage('ready')}
  catch(error){console.error('Falha ao carregar banco:',error);setStage('ready')}
 };
 useEffect(()=>{init()},[]);
 useEffect(()=>{
  if(stage!=='ready'||!cloudConfigured())return;
  let refreshing=false;
  const refresh=async()=>{
   if(refreshing||document.hidden)return;
   refreshing=true;
   try{await flushCloudWrites();await loadCloudDocuments()}catch(error){console.warn('Atualização do banco:',error)}
   finally{refreshing=false}
  };
  const timer=setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh)}
 },[stage]);
 if(stage==='loading')return <LoadingScreen persist/>;
 return <App/>;
}
