import React,{useState}from'react';
import{Boxes,Package}from'lucide-react';
import PageHeader from'../components/PageHeader';
import Stock from'./Stock';
import Products from'./Products';

export default function InventoryHub({products,setProducts,movements,setMovements,sales,setPage,initialTab='stock'}){
 const[tab,setTab]=useState(initialTab);
 return <section className="inventory-hub">
  <PageHeader title="Produtos e Estoque" subtitle="Cadastre os móveis, consulte quantidades e controle entradas e saídas em um só lugar."/>
  <div className="module-tabs inventory-hub-tabs" role="tablist" aria-label="Produtos e estoque">
   <button type="button" role="tab" aria-selected={tab==='stock'} className={tab==='stock'?'active':''} onClick={()=>setTab('stock')}><Boxes size={16}/>Estoque e movimentações</button>
   <button type="button" role="tab" aria-selected={tab==='products'} className={tab==='products'?'active':''} onClick={()=>setTab('products')}><Package size={16}/>Cadastro de produtos</button>
  </div>
  {tab==='stock'?<Stock embedded products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} sales={sales}/>:<Products embedded products={products} setProducts={setProducts} setPage={setPage} sales={sales}/>}
 </section>;
}