import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Leaf, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = ({ onLoginExitoso }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const manejarIngreso = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Conexión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos");
    } else {
      // Si el login es exitoso, le pasamos los datos del usuario a la App principal
      onLoginExitoso(data.user);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Encabezado del Login */}
        <div className="bg-slate-800 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-500 w-24 h-24 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 bg-cyan-500 w-24 h-24 rounded-full opacity-20 blur-xl"></div>
          
          <div className="mb-4 relative z-10 flex justify-center">
  {/* Asegúrate de que el nombre del archivo coincida exactamente con el que pusiste en public */}
  <img src="/logo.svg" alt="Logo Oficial" className="h-35 w-auto drop-shadow-lg object-contain" />
</div>
          <h1 className="text-3xl font-black text-white relative z-10 tracking-tight">BioMonitor</h1>
          <p className="text-slate-300 text-sm mt-2 relative z-10">Acceso al Dashboard de Ecosistemas</p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-6">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={manejarIngreso} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@biomonitor.com"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 mt-4"
            >
              {loading ? 'VERIFICANDO...' : <><LogIn size={20} /> INICIAR SESIÓN</>}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Perfiles habilitados: Administrador y Visitante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;