export const managerPinConfigured=()=>localStorage.getItem('home-manager-pin')||'1234';
export const checkManagerPin=value=>String(value||'')===String(managerPinConfigured());
