import React,{useState}from'react';
import{Eye,EyeOff,LockKeyhole,UserRound}from'lucide-react';
import logo from'../assets/home-logo-bw.png';
import{loginLocal}from'../utils/auth';

export default function LoginScreen({onLogin}){
 const[user,setUser]=useState(''),[pass,setPass]=useState(''),[show,setShow]=useState(false),[error,setError]=useState('');
 const submit=e=>{e?.preventDefault();const s=loginLocal(user,pass);if(!s){setError('Usuário ou senha inválidos.');return}setError('');onLogin?.(s)};
 return <div className="login-screen"><div className="login-card">
  <div className="login-brand"><img src={logo} alt="Home Interiores"/></div>
  <form onSubmit={submit}>
   <label><span>Usuário</span><div className="login-input"><UserRound size={17}/><input autoFocus autoComplete="username" value={user} onChange={e=>setUser(e.target.value)}/></div></label>
   <label><span>Senha</span><div className="login-input"><LockKeyhole size={17}/><input type={show?'text':'password'} autoComplete="current-password" value={pass} onChange={e=>setPass(e.target.value)}/><button type="button" onClick={()=>setShow(v=>!v)} aria-label="Mostrar senha">{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
   {error&&<div className="login-error">{error}</div>}
   <button className="login-submit" type="submit">Entrar</button>
  </form>
 </div></div>;
}
