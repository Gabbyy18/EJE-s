import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TestTubes, Thermometer, Waves, Activity, Fish, Trash2, Loader2 } from 'lucide-react';

const DashboardAcuaponia = ({ rol }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from('registro_acuaponia').select('*').order('created_at', { ascending: true });
      if (error) throw error;

      const datosFormateados = data.map(item => {
        const fecha = new Date(item.created_at);
        return {
          ...item,
          fecha_corta: `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`,
          fecha_larga: fecha.toLocaleString()
        };
      });
      setDatos(datosFormateados);
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const borrarRegistro = async (id) => {
    if (window.confirm("¿Borrar registro de Acuaponía?")) {
      const { error } = await supabase.from('registro_acuaponia').delete().eq('id', id);
      if (!error) obtenerDatos();
    }
  };

  const ultimo = datos.length > 0 ? datos[datos.length - 1] : null;

  if (cargando) return <div className="flex flex-col items-center justify-center h-64 text-cyan-500"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold">Sincronizando peces...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-500 p-3 rounded-xl text-white shadow-md"><Fish size={24} /></div>
        <div><h1 className="text-2xl font-bold text-slate-800">Dashboard Acuaponía</h1><p className="text-slate-500">{datos.length} registros sincronizados</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">PH DEL AGUA</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.ph_agua ?? '--'}</p></div>
          <div className="bg-cyan-50 p-3 rounded-full"><TestTubes className="text-cyan-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">TEMP. AGUA</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.temp_agua ?? '--'} <span className="text-lg font-medium text-slate-400">°C</span></p></div>
          <div className="bg-blue-50 p-3 rounded-full"><Thermometer className="text-blue-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">O₂ DISUELTO</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.oxigeno_disuelto ?? '--'} <span className="text-lg font-medium text-slate-400">mg/L</span></p></div>
          <div className="bg-emerald-50 p-3 rounded-full"><Waves className="text-emerald-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">AMONIACO</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.amoniaco ?? '--'} <span className="text-lg font-medium text-slate-400">ppm</span></p></div>
          <div className="bg-purple-50 p-3 rounded-full"><Activity className="text-purple-500" size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><TestTubes size={16} className="text-cyan-500"/> Evolución del pH</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={[0, 14]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" name="pH" dataKey="ph_agua" stroke="#06b6d4" strokeWidth={2} fill="url(#colorPh)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Faltan datos</div>)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Thermometer size={16} className="text-blue-500"/> Temperatura del Agua</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTempA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" name="Temp °C" dataKey="temp_agua" stroke="#3b82f6" strokeWidth={2} fill="url(#colorTempA)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Faltan datos</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-cyan-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-cyan-50/50"><div className="flex items-center gap-2"><Fish className="text-cyan-500" size={20} /><h3 className="font-bold text-slate-700">Historial de Registros</h3></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Tanque</th>
                <th className="px-6 py-4">pH</th>
                <th className="px-6 py-4">Temp °C</th>
                <th className="px-6 py-4">O₂ mg/L</th>
                <th className="px-6 py-4">Salud</th>
                {rol === 'admin' && <th className="px-6 py-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...datos].reverse().map((reg) => (
                <tr key={reg.id} className="hover:bg-cyan-50/30 transition">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{reg.fecha_larga}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{reg.id_tanque || 'N/D'}</td>
                  <td className="px-6 py-4 font-medium">{reg.ph_agua ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{reg.temp_agua ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{reg.oxigeno_disuelto ?? '--'}</td>
                  <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold">{reg.salud_peces || 'N/D'}</span></td>
                  {rol === 'admin' && (
                    <td className="px-6 py-4 text-right"><button onClick={() => borrarRegistro(reg.id)} className="text-slate-300 hover:text-rose-500 transition"><Trash2 size={18} /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAcuaponia;