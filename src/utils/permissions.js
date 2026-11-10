import{getLocalSession}from'./auth';
export const PERMISSIONS={
  Administrador:['*'],
  Gerente:['sales.create','sales.cancel','stock.move','stock.inventory','cash.open','cash.move','cash.close','finance.write','products.write','products.cost.view','reports.view'],
  Vendedor:['sales.create','cash.open','cash.close','products.view','stock.view','clients.write'],
  Estoque:['stock.move','stock.inventory','products.view'],
  Financeiro:['finance.write','reports.view','products.cost.view'],
  Fiscal:['reports.view']
};
export function currentRole(){return getLocalSession()?.role||localStorage.getItem('home-current-role')||'Administrador'}
export function can(action,role=currentRole()){const list=PERMISSIONS[role]||[];return list.includes('*')||list.includes(action)}
export function requirePermission(action){return{ok:can(action),role:currentRole(),action}}
export const PAGE_ACCESS={
  Administrador:['dashboard','products','stock','movements','sales','orders','cashier','registries','clients','suppliers','finance','operations','reports','settings','salespeople'],
  Gerente:['dashboard','products','stock','movements','sales','orders','cashier','registries','clients','suppliers','finance','operations','reports','settings','salespeople'],
  Vendedor:['dashboard','products','stock','sales','orders','cashier','registries','clients','operations'],
  Estoque:['dashboard','products','stock','movements','orders','purchases','registries','suppliers'],
  Financeiro:['dashboard','finance','reports','registries','clients','suppliers'],
  Fiscal:['dashboard','reports']
};
export function canViewPage(page,role=currentRole()){return(PAGE_ACCESS[role]||[]).includes(page)}
