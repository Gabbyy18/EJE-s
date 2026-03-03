import React, { useState, useEffect } from 'react';
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

  // Este "efecto" vigila si el usuario ya inició sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      manejarSesion(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      manejarSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para decidir qué permisos darte según tu correo
  const manejarSesion = (sessionInfo) => {
    setSession(sessionInfo);
    if (sessionInfo?.user?.email) {
      if (sessionInfo.user.email.includes('admin')) {
        setRol('admin');
        setActiveTab('registro'); // El admin empieza en la pantalla de captura
      } else {
        setRol('visita');
        setActiveTab('colmena'); // La visita empieza directamente en las gráficas
      }
    } else {
      setRol(null);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  // Si no hay sesión iniciada, mostramos la pantalla de Login
  if (!session) {
    return <Login onLoginExitoso={(user) => console.log("Bienvenido:", user.email)} />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 flex flex-col">
      <header className="bg-white border-b p-4 px-8 flex justify-between items-center shadow-sm w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-white p-1 rounded-xl shadow-sm border border-slate-100">
  <img src="/logo.svg" alt="Logo Oficial" className="h-18 w-auto object-contain" />
</div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-800 leading-tight">BioMonitor</h1>
            {/* El subtítulo cambia para decirte quién eres */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {rol === 'admin' ? 'Modo Administrador' : 'Modo Visitante'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex bg-slate-200/60 rounded-2xl p-1.5 shadow-inner gap-1">
            
            {/* MAGIA: Esta línea oculta el botón de Registro si eres visitante */}
            {rol === 'admin' && (
              <button 
                onClick={() => setActiveTab('registro')} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all outline-none ${
                  activeTab === 'registro' ? 'bg-slate-800 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
              >
                <ClipboardList size={18} /> Registro
              </button>
            )}
            
            <button 
              onClick={() => setActiveTab('colmena')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all outline-none ${
                activeTab === 'colmena' ? 'bg-amber-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Bug size={18} /> Colmena
            </button>
            
            <button 
              onClick={() => setActiveTab('acuaponia')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all outline-none ${
                activeTab === 'acuaponia' ? 'bg-cyan-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Fish size={18} /> Acuaponía
            </button>
            
            <button 
              onClick={() => setActiveTab('hidroponia')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all outline-none ${
                activeTab === 'hidroponia' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'
              }`}
            >
              <Leaf size={18} /> Hidroponía
            </button>
          </nav>

          <button 
            onClick={cerrarSesion}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors px-3 py-2 rounded-lg hover:bg-rose-50"
          >
            <LogOut size={18} /> Salir
          </button>
        </div>
      </header>

      <main className="flex-1 w-full p-8">
        {/* Le pasamos la variable "rol" a los Dashboards para que luego sepan si ocultar la papelera */}
        {activeTab === 'registro' && rol === 'admin' && <RegistroForm />}
        {activeTab === 'colmena' && <DashboardColmena rol={rol} />}
        {activeTab === 'acuaponia' && <DashboardAcuaponia rol={rol} />}
        {activeTab === 'hidroponia' && <DashboardHidroponia rol={rol} />}
      </main>
    </div>
  );
}

export default App;