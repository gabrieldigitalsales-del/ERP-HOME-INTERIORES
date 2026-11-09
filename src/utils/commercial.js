import{uid}from'./ids';
const KEY='home-salespeople-v2';
const LEGACY='home-salespeople-v1';
const normalize=row=>{if(typeof row==='string')row={name:row};if(!row||typeof row!=='object')return null;const name=String(row.name||'').trim();if(!name)return null;return{...row,id:row.id||uid('seller'),name,active:row.active!==false,pin:String(row.pin||'').replace(/\D/g,'').slice(0,6),commission:row.commission===''||row.commission==null?null:Number(row.commission),target:Number(row.target)||0,discountLimit:row.discountLimit===''||row.discountLimit==null?null:Number(row.discountLimit)}};
function read(key){try{const v=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(v)?v:null}catch{return null}}
export function getSalespeople(){const current=read(KEY),legacy=read(LEGACY);const source=current||legacy||[];const rows=source.map(normalize).filter(Boolean);if(!current&&rows.length)localStorage.setItem(KEY,JSON.stringify(rows));return rows}
export function saveSalespeople(rows=[]){const clean=rows.map(normalize).filter(Boolean);localStorage.setItem(KEY,JSON.stringify(clean));localStorage.setItem(LEGACY,JSON.stringify(clean.filter(x=>x.active).map(x=>x.name)));window.dispatchEvent(new CustomEvent('home-salespeople-updated',{detail:{count:clean.length}}));return clean}
export function activeSalespeople(){return getSalespeople().filter(x=>x.active!==false)}
export function sellerByName(name){return getSalespeople().find(x=>x.name===name)||null}
export function sellerCommission(name){const row=sellerByName(name);const global=Number(localStorage.getItem('home-commission-rate')||2);return row?.commission==null?global:Number(row.commission)||0}
export function sellerDiscountLimit(name,role='Vendedor'){const row=sellerByName(name);if(row?.discountLimit!=null)return Number(row.discountLimit)||0;const roleKey=`home-discount-limit-${String(role).toLowerCase()}`;const roleDefault=role==='Administrador'?100:role==='Gerente'?25:10;return Number(localStorage.getItem(roleKey)||roleDefault)}
export function verifySellerPin(name,pin){const row=sellerByName(name);return !row?.pin||String(row.pin)===String(pin||'')}