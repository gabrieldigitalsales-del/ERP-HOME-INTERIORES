import React,{useState}from'react';
import{Boxes,ArrowLeftRight}from'lucide-react';
import PageHeader from'../components/PageHeader';
import Stock from'./Stock';
import Products from'./Products';

export default function InventoryHub({products,setProducts,movements,setMovements,sales,setPage,initialTab='products'}){
 const normalizedInitial=initialTab==='stock'?'products':initialTab==='showroom'?'products':initialTab;
 const[tab,setTab]=useState(normalizedInitial);
 return <section className="inventory-hub">
  <PageHeader title="Produtos e Estoque" subtitle="Todos os produtos em um só lugar. Marque como Showroom somente o que deve aparecer no Caixa."/>
  <div className="module-tabs inventory-hub-tabs" role="tablist" aria-label="Produtos e estoque">
   <button type="button" role="tab" aria-selected={tab==='products'} className={tab==='products'?'active':''} onClick={()=>setTab('products')}><Boxes size={16}/>Estoque geral</button>
   <button type="button" role="tab" aria-selected={tab==='movements'} className={tab==='movements'?'active':''} onClick={()=>setTab('movements')}><ArrowLeftRight size={16}/>Movimentações</button>
  </div>
  {tab==='products'
   ?<Products embedded products={products} setProducts={setProducts} setPage={setPage} sales={sales}/>
   :<Stock embedded products={products} setProducts={setProducts} movements={movements} setMovements={setMovements} sales={sales}/>}
 </section>;
}