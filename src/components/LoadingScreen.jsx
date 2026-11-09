import React from 'react';
import logo from '../assets/home-logo-bw.png';

export default function LoadingScreen({persist=false}){
  return <div className={`app-loading${persist?' app-loading-persist':''}`} aria-label="Carregando Home Interiores">
    <div className="app-loading-inner">
      <img src={logo} alt="Home Interiores" className="app-loading-logo"/>
      <div className="app-loading-bar" aria-hidden="true"><span/></div>
      <small>GESTÃO EMPRESARIAL</small>
    </div>
  </div>
}
