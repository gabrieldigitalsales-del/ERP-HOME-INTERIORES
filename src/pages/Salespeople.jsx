import React,{useState}from'react';
import{Plus,Save,Users,Trash2,ShieldCheck}from'lucide-react';
import PageHeader from'../components/PageHeader';
import{toast}from'../components/ToastHost';
import{getSalespeople,saveSalespeople}from'../utils/commercial';
import{can}from'../utils/permissions';
import{addAudit}from'../utils/audit';
const blank=()=>({id:'seller-'+crypto.randomUUID(),name:'',active:true,pin:'',commission:null,target:0,discountLimit:null});
export default function Salespeople(){
 const[rows,setRows]=useState(()=>getSalespeople()),[dirty,setDirty]=useState(false);
 const admin=can('products.write');
 const edit=(i,k,v)=>{setDirty(true);setRows(r=>r.map((x,n)=>n===i?{...x,[k]:v}:x))};
 const add=()=>{setDirty(true);setRows(r=>[...r,blank()])};
 const remove=i=>{setDirty(true);setRows(r=>r.filter((_,n)=>n!==i))};
 const save=()=>{if(!admin)return toast('Você não tem permissão para alterar vendedoras.','warning','Permissão');const saved=saveSalespeople(rows);setRows(saved);setDirty(false);addAudit('Cadastro de vendedoras atualizado','Comercial',saved.length+' vendedoras');toast('Vendedoras salvas.','success','Vendedoras')};
 return <section className="page salespeople-page">
  <PageHeader title="Vendedoras" subtitle="Cadastre as profissionais disponíveis no PDV e nos relatórios." action={admin&&<div className="seller-actions"><button className="secondary" onClick={add}><Plus size={14}/>Adicionar</button><button className="primary" disabled={!dirty} onClick={save}><Save size={14}/>Salvar</button></div>}/>
  <div className="panel salespeople-panel">
   <div className="salespeople-info"><Users size={18}/><div><b>Equipe de vendas</b><p>Nome, PIN opcional, comissão, meta e limite de desconto. Desativar mantém o histórico.</p></div></div>
   {!rows.length?<div className="empty"><p>Nenhuma vendedora cadastrada.</p>{admin&&<button className="secondary" onClick={add}><Plus size={14}/>Adicionar vendedora</button>}</div>:<div className="salespeople-list">{rows.map((p,i)=><div key={p.id||i} className="salespeople-row">
    <label><span>Nome</span><input disabled={!admin} value={p.name} onChange={e=>edit(i,'name',e.target.value)}/></label>
    <label><span>PIN</span><input disabled={!admin} inputMode="numeric" value={p.pin||''} maxLength={6} onChange={e=>edit(i,'pin',e.target.value.replace(/\D/g,'').slice(0,6))}/></label>
    <label><span>Comissão (%)</span><input disabled={!admin} type="number" min="0" step=".1" value={p.commission??''} onChange={e=>edit(i,'commission',e.target.value)}/></label>
    <label><span>Meta mensal</span><input disabled={!admin} type="number" min="0" step="100" value={p.target??''} onChange={e=>edit(i,'target',e.target.value)}/></label>
    <label><span>Desconto máximo (%)</span><input disabled={!admin} type="number" min="0" max="100" step=".5" value={p.discountLimit??''} onChange={e=>edit(i,'discountLimit',e.target.value)}/></label>
    <label className="seller-active"><input disabled={!admin} type="checkbox" checked={p.active!==false} onChange={e=>edit(i,'active',e.target.checked)}/>Ativa</label>
    {admin&&<button className="icon-btn" title="Remover" onClick={()=>remove(i)}><Trash2 size={15}/></button>}
   </div>)}</div>}
   <div className="salespeople-note"><ShieldCheck size={15}/>A vendedora fica registrada na venda e nos relatórios. O login do usuário é separado.</div>
  </div>
 </section>;
}