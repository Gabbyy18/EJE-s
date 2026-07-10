import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { ClipboardList, Bug, Fish, Leaf, LogOut } from 'lucide-react';
import RegistroForm from './components/RegistroForm';
import DashboardColmena from './components/DashboardColmena';
import DashboardAcuaponia from './components/DashboardAcuaponia';
import DashboardHidroponia from './components/DashboardHidroponia';
import Login from './components/Login';

function App() {
  const [session, setSession] = useState(null);
  const [rol, setRol] = useState(null);
  const [activeTab, setActiveTab] = useState('colmena');
  const inicializado = useRef(false);

  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      manejarSesion(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      manejarSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const manejarSesion = (sessionInfo) => {
    setSession(sessionInfo);
    if (sessionInfo?.user?.email) {
      const esAdmin = sessionInfo.user.email.includes('admin');
      setRol(esAdmin ? 'admin' : 'visita');
      
      // Solo forzamos la pestaña la PRIMERA vez que entras
      if (!inicializado.current) {
        setActiveTab(esAdmin ? 'registro' : 'colmena');
        inicializado.current = true;
      }
    } else {
      setRol(null);
      inicializado.current = false;
    }
  };

  if (!session) {
    return <Login onLoginExitoso={(user) => console.log("Login:", user.email)} />;
  }

  return (
    // CAMBIO: Aseguramos que el contenedor ocupe TODA la pantalla sin desbordarse
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      
      <header className="bg-white border-b p-4 px-8 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800">BioMonitor</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {rol === 'admin' ? 'Administrador' : 'Visitante'}
            </p>
          </div>
        </div>

        <nav className="flex bg-slate-200/60 rounded-2xl p-1 gap-1">
          {rol === 'admin' && (
            <button 
              onClick={() => setActiveTab('registro')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'registro' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-white'
              }`}
            >
              <ClipboardList size={16} /> Registro
            </button>
          )}
          <button onClick={() => setActiveTab('colmena')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'colmena' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}><Bug size={16} /> Colmena</button>
          <button onClick={() => setActiveTab('acuaponia')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'acuaponia' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}><Fish size={16} /> Acuaponía</button>
          <button onClick={() => setActiveTab('hidroponia')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'hidroponia' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}><Leaf size={16} /> Hidroponía</button>
        </nav>

        <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-rose-500 p-2"><LogOut size={20} /></button>
      </header>

      {/* CAMBIO: overflow-y-auto permite que el contenido se deslice si es muy largo */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'registro' && rol === 'admin' && <RegistroForm />}
          {activeTab === 'colmena' && <DashboardColmena rol={rol} />}
          {activeTab === 'acuaponia' && <DashboardAcuaponia rol={rol} />}
          {activeTab === 'hidroponia' && <DashboardHidroponia rol={rol} />}
        </div>
      </main>
    </div>
  );
}

export default App;