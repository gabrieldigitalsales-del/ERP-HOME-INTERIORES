import React,{useState}from'react';
import{Users,Truck,UserRound}from'lucide-react';
import PageHeader from'../components/PageHeader';
import SimpleRegistry from'./SimpleRegistry';
import Salespeople from'./Salespeople';
import{canViewPage}from'../utils/permissions';
export default function RegistryHub({clients,setClients,suppliers,setSuppliers,sales=[],purchases=[],finance=[],initialTab='clients'}){
 const allowed={clients:canViewPage('clients'),suppliers:canViewPage('suppliers'),salespeople:canViewPage('salespeople')};
 const firstAllowed=['clients','suppliers','salespeople'].find(k=>allowed[k])||'clients';
 const[tab,setTab]=useState(allowed[initialTab]?initialTab:firstAllowed);
 return <section className="registries-hub"><PageHeader title="Cadastros" subtitle="Clientes, fornecedores e vendedores organizados em um único lugar."/><div className="module-tabs registries-tabs" role="tablist" aria-label="Cadastros">{allowed.clients&&<button type="button" role="tab" aria-selected={tab==='clients'} className={tab==='clients'?'active':''} onClick={()=>setTab('clients')}><UserRound size={16}/>Clientes</button>}{allowed.suppliers&&<button type="button" role="tab" aria-selected={tab==='suppliers'} className={tab==='suppliers'?'active':''} onClick={()=>setTab('suppliers')}><Truck size={16}/>Fornecedores</button>}{allowed.salespeople&&<button type="button" role="tab" aria-selected={tab==='salespeople'} className={tab==='salespeople'?'active':''} onClick={()=>setTab('salespeople')}><Users size={16}/>Vendedores</button>}</div><div className="registries-content">{tab==='clients'&&<SimpleRegistry type="clients" items={clients} setItems={setClients} sales={sales} finance={finance}/>} {tab==='suppliers'&&<SimpleRegistry type="suppliers" items={suppliers} setItems={setSuppliers} purchases={purchases} finance={finance}/>} {tab==='salespeople'&&<Salespeople/>}</div></section>;
}
