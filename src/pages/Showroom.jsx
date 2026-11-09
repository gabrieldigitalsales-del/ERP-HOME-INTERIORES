import React,{useMemo,useState}from'react';
import{Plus,Search,Store,PackagePlus,Pencil,Trash2,ArrowRight}from'lucide-react';
import Modal from'../components/Modal';
import ConfirmDialog from'../components/ConfirmDialog';
import{toast}from'../components/ToastHost';
import{uid}from'../utils/ids';
import{money}from'../utils/erpEngine';
import{addAudit}from'../utils/audit';
import{can,currentRole}from'../utils/permissions';

const blank=()=>({name:'',sku:'',category:'',supplier:'',price:0,cost:0,stock:1,showroomStock:1,reserved:0,minStock:0,location:'Showroom',active:true,stockType:'Mostruário',inventoryClass:'showroom',source:'showroom'});
const isShowroom=p=>p?.inventoryClass==='showroom'||p?.stockType==='Mostruário';
const isSupplierCatalog=p=>(p?.inventoryClass==='supplier_catalog'||Boolean(p?.sourceTable))&&!isShowroom(p);

export default function Showroom({products,setProducts}){
 const[q,setQ]=useState(''),[catalogQ,setCatalogQ]=useState(''),[newOpen,setNewOpen]=useState(false);
 const[draft,setDraft]=useState(blank()),[pick,setPick]=useState(null),[pickQty,setPickQty]=useState(1),[edit,setEdit]=useState(null),[remove,setRemove]=useState(null);
 const showroom=useMemo(()=>products.filter(p=>p.active!==false&&isShowroom(p)).filter(p=>(String(p.name||'')+' '+String(p.sku||'')+' '+String(p.supplier||'')+' '+String(p.category||'')).toLowerCase().includes(q.toLowerCase())),[products,q]);
 const catalog=useMemo(()=>products.filter(p=>p.active!==false&&isSupplierCatalog(p)).filter(p=>(String(p.name||'')+' '+String(p.sku||'')+' '+String(p.supplier||'')+' '+String(p.category||'')).toLowerCase().includes(catalogQ.toLowerCase())).slice(0,80),[products,catalogQ]);
 const totalUnits=showroom.reduce((s,p)=>s+(Number(p.showroomStock??p.stock)||0),0);
 const totalValue=showroom.reduce((s,p)=>s+(Number(p.showroomStock??p.stock)||0)*(Number(p.price)||0),0);

 const addCustom=()=>{
  if(!can('products.write'))return toast('O perfil '+currentRole()+' não pode cadastrar produtos.','warning','Showroom');
  if(!draft.name.trim())return toast('Informe o nome do produto.','warning','Showroom');
  if(!draft.sku.trim())return toast('Informe o SKU ou referência.','warning','Showroom');
  if(!(Number(draft.price)>0))return toast('Informe o preço de venda.','warning','Showroom');
  const physical=Math.max(0,Number(draft.stock)||0);const item={...draft,id:uid('prd'),stock:physical,showroomStock:physical,price:Number(draft.price)||0,cost:Number(draft.cost)||0,reserved:0,active:true,stockType:'Mostruário',inventoryClass:'showroom',source:'showroom',createdAt:new Date().toISOString()};
  setProducts(rows=>[item,...rows]);
  addAudit('Produto adicionado ao showroom','Showroom',item.name+' · '+item.sku);
  setDraft(blank());setNewOpen(false);toast('Produto cadastrado no showroom e liberado no PDV.','success','Showroom');
 };

 const addFromCatalog=()=>{
  if(!pick)return;
  if(!can('products.write'))return toast('O perfil '+currentRole()+' não pode alterar estoque.','warning','Showroom');
  const qty=Math.max(0,Number(pickQty)||0);
  setProducts(rows=>rows.map(p=>String(p.id)===String(pick.id)?{...p,supplierStock:Number(p.supplierStock??p.stock)||0,stock:qty,showroomStock:qty,reserved:0,stockType:'Mostruário',inventoryClass:'showroom',source:'showroom-from-supplier',location:p.location||'Showroom',stockConfirmed:true,inventoryPending:false,showroomAddedAt:new Date().toISOString()}:p));
  addAudit('Catálogo enviado ao showroom','Showroom',pick.name+' · '+qty+' un.');
  setPick(null);setPickQty(1);toast('Item incluído no showroom e agora aparece no PDV.','success','Showroom');
 };

 const saveEdit=()=>{
  if(!edit)return;
  const qty=Math.max(0,Number(edit.showroomStock??edit.stock)||0);
  setProducts(rows=>rows.map(p=>String(p.id)===String(edit.id)?{...p,...edit,stock:qty,showroomStock:qty,price:Number(edit.price)||0,cost:Number(edit.cost)||0,stockType:'Mostruário',inventoryClass:'showroom',location:edit.location||'Showroom',updatedAt:new Date().toISOString()}:p));
  addAudit('Item do showroom alterado','Showroom',edit.name);
  setEdit(null);toast('Showroom atualizado. O PDV já usa esses dados.','success','Showroom');
 };

 const removeFromShowroom=()=>{
  if(!remove)return;
  setProducts(rows=>rows.map(p=>String(p.id)===String(remove.id)?{...p,stock:0,showroomStock:0,reserved:0,stockType:(p.sourceTable||p.supplierStock!=null)?'Catálogo':'Estoque',inventoryClass:(p.sourceTable||p.supplierStock!=null)?'supplier_catalog':'standard',showroomRemovedAt:new Date().toISOString()}:p));
  addAudit('Produto retirado do showroom','Showroom',remove.name);
  setRemove(null);toast('Produto retirado do showroom e removido do PDV.','success','Showroom');
 };

 return <section className="page">
  <div className="lux-products-header"><div><b>Estoque Showroom</b><small>Estoque físico da loja. Tudo aqui aparece automaticamente no Caixa/PDV.</small></div><button className="primary" onClick={()=>setNewOpen(true)}><Plus size={16}/>Novo item showroom</button></div>

  <div className="kpi-grid">
   <div className="kpi-card"><span>Itens no showroom</span><b>{showroom.length}</b><small>cadastros ativos</small></div>
   <div className="kpi-card"><span>Unidades físicas</span><b>{totalUnits}</b><small>disponíveis na loja</small></div>
   <div className="kpi-card"><span>Valor de venda</span><b>{money(totalValue)}</b><small>estoque do showroom</small></div>
  </div>

  <div className="panel">
   <div className="panel-head"><div><h3><Store size={18}/>Produtos no showroom</h3><p>Venda no PDV desconta deste mesmo estoque automaticamente.</p></div></div>
   <div className="toolbar"><label className="search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar no showroom..."/></label><span>{showroom.length} itens</span></div>
   <div className="list-panel">
    <div className="list-head product-columns"><span>Produto</span><span>Categoria</span><span>SKU</span><span>Local</span><span>Preço</span><span>Fornecedor</span><span>Disponível</span><span></span></div>
    {showroom.map(p=><div className="list-row product-columns" key={p.id}>
      <div><b>{p.name}</b><small>{p.sourceTable?'Origem: tabela do fornecedor':'Cadastro da loja'}</small></div>
      <span>{p.category||'—'}</span><span><b className="mono">{p.sku||'—'}</b></span><span>{p.location||'Showroom'}</span>
      <span><b>{money(p.price)}</b></span><span>{p.supplier||'—'}</span>
      <span><b>{Math.max(0,(Number(p.showroomStock??p.stock)||0)-(Number(p.reserved)||0))} un.</b><small>Físico {Number(p.showroomStock??p.stock)||0}</small></span>
      <div className="row-actions"><button title="Editar" onClick={()=>setEdit({...p})}><Pencil size={15}/></button><button title="Retirar do showroom" onClick={()=>setRemove(p)}><Trash2 size={15}/></button></div>
    </div>)}
    {!showroom.length&&<p className="empty">Nenhum produto cadastrado no showroom ainda.</p>}
   </div>
  </div>

  <div className="panel">
   <div className="panel-head"><div><h3><PackagePlus size={18}/>Adicionar do catálogo dos fornecedores</h3><p>As tabelas recebidas dos fornecedores continuam como catálogo. Escolha apenas o que existe fisicamente na loja.</p></div></div>
   <div className="toolbar"><label className="search"><Search size={17}/><input value={catalogQ} onChange={e=>setCatalogQ(e.target.value)} placeholder="Buscar fornecedor, produto, SKU..."/></label><span>{catalog.length} resultados</span></div>
   <div className="compact-list">{catalog.map(p=><button key={p.id} type="button" onClick={()=>{setPick(p);setPickQty(1)}}><span><b>{p.name}</b><small>{p.supplier||'Fornecedor'} · {p.sku||'sem SKU'} · {money(p.price)}</small></span><ArrowRight size={16}/></button>)}{!catalog.length&&<p className="empty">Nenhum item do catálogo encontrado.</p>}</div>
  </div>

  {newOpen&&<Modal title="Novo item de showroom" subtitle="Cadastre apenas o que está fisicamente disponível na loja." onClose={()=>setNewOpen(false)} wide>
    <div className="form-grid">
      <label className="form-field wide"><span>Produto *</span><input autoFocus value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
      <label className="form-field"><span>SKU / Referência *</span><input value={draft.sku} onChange={e=>setDraft({...draft,sku:e.target.value})}/></label>
      <label className="form-field"><span>Categoria</span><input value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></label>
      <label className="form-field"><span>Fornecedor</span><input value={draft.supplier} onChange={e=>setDraft({...draft,supplier:e.target.value})}/></label>
      <label className="form-field"><span>Preço de venda *</span><input type="number" min="0" step="0.01" value={draft.price||''} onChange={e=>setDraft({...draft,price:Number(e.target.value)})}/></label>
      <label className="form-field"><span>Custo</span><input type="number" min="0" step="0.01" value={draft.cost||''} onChange={e=>setDraft({...draft,cost:Number(e.target.value)})}/></label>
      <label className="form-field"><span>Quantidade física</span><input type="number" min="0" value={draft.stock} onChange={e=>setDraft({...draft,stock:Number(e.target.value)})}/></label>
      <label className="form-field"><span>Localização</span><input value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/></label>
    </div>
    <div className="modal-actions"><button className="secondary" onClick={()=>setNewOpen(false)}>Cancelar</button><button className="primary" onClick={addCustom}><Store size={16}/>Salvar no showroom</button></div>
  </Modal>}

  {pick&&<Modal title="Adicionar ao showroom" subtitle="Defina a quantidade física que realmente está na loja." onClose={()=>setPick(null)}>
    <div className="panel embedded"><b>{pick.name}</b><p>{pick.supplier||'Fornecedor'} · {pick.sku||'sem SKU'} · {money(pick.price)}</p></div>
    <label className="form-field"><span>Quantidade física no showroom</span><input autoFocus type="number" min="0" value={pickQty} onChange={e=>setPickQty(Number(e.target.value))}/></label>
    <div className="modal-actions"><button className="secondary" onClick={()=>setPick(null)}>Cancelar</button><button className="primary" onClick={addFromCatalog}><PackagePlus size={16}/>Adicionar ao showroom</button></div>
  </Modal>}

  {edit&&<Modal title="Editar item do showroom" onClose={()=>setEdit(null)} wide>
    <div className="form-grid">
      <label className="form-field wide"><span>Produto</span><input value={edit.name||''} onChange={e=>setEdit({...edit,name:e.target.value})}/></label>
      <label className="form-field"><span>SKU</span><input value={edit.sku||''} onChange={e=>setEdit({...edit,sku:e.target.value})}/></label>
      <label className="form-field"><span>Fornecedor</span><input value={edit.supplier||''} onChange={e=>setEdit({...edit,supplier:e.target.value})}/></label>
      <label className="form-field"><span>Preço de venda</span><input type="number" min="0" step="0.01" value={edit.price||''} onChange={e=>setEdit({...edit,price:Number(e.target.value)})}/></label>
      <label className="form-field"><span>Quantidade física</span><input type="number" min="0" value={edit.showroomStock??edit.stock??0} onChange={e=>setEdit({...edit,stock:Number(e.target.value),showroomStock:Number(e.target.value)})}/></label>
      <label className="form-field"><span>Localização</span><input value={edit.location||'Showroom'} onChange={e=>setEdit({...edit,location:e.target.value})}/></label>
    </div>
    <div className="modal-actions"><button className="secondary" onClick={()=>setEdit(null)}>Cancelar</button><button className="primary" onClick={saveEdit}>Salvar alterações</button></div>
  </Modal>}

  <ConfirmDialog open={Boolean(remove)} title="Retirar do showroom" message="O item deixará de aparecer no PDV. O cadastro e a origem do fornecedor serão preservados." confirmLabel="Retirar do showroom" danger onConfirm={removeFromShowroom} onCancel={()=>setRemove(null)}/>
 </section>;
}
