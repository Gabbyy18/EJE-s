import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TestTubes, Zap, Thermometer, Droplets, Trash2, Loader2 } from 'lucide-react';

const DashboardHidroponia = ({ rol }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from('registro_hidroponia').select('*').order('created_at', { ascending: true });
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
    if (window.confirm("¿Borrar registro de Hidroponía?")) {
      const { error } = await supabase.from('registro_hidroponia').delete().eq('id', id);
      if (!error) obtenerDatos();
    }
  };

  const ultimo = datos.length > 0 ? datos[datos.length - 1] : null;

  if (cargando) return <div className="flex flex-col items-center justify-center h-64 text-emerald-500"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold">Sincronizando plantas...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-500 p-3 rounded-xl text-white shadow-md"><Leaf size={24} /></div>
        <div><h1 className="text-2xl font-bold text-slate-800">Dashboard Hidroponía</h1><p className="text-slate-500">{datos.length} registros sincronizados</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">PH SOLUCIÓN</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.ph_solucion ?? '--'}</p></div>
          <div className="bg-emerald-50 p-3 rounded-full"><TestTubes className="text-emerald-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-teal-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">EC</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.ec_conductividad ?? '--'} <span className="text-lg font-medium text-slate-400">mS/cm</span></p></div>
          <div className="bg-teal-50 p-3 rounded-full"><Zap className="text-teal-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">TEMP. SOLUCIÓN</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.temp_solucion ?? '--'} <span className="text-lg font-medium text-slate-400">°C</span></p></div>
          <div className="bg-blue-50 p-3 rounded-full"><Thermometer className="text-blue-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">HUMEDAD</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimo?.humedad ?? '--'} <span className="text-lg font-medium text-slate-400">%</span></p></div>
          <div className="bg-purple-50 p-3 rounded-full"><Droplets className="text-purple-500" size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><TestTubes size={16} className="text-emerald-500"/> pH de la Solución</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPhH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={[0, 14]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" name="pH" dataKey="ph_solucion" stroke="#10b981" strokeWidth={2} fill="url(#colorPhH)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400">Faltan datos</div>)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-teal-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Zap size={16} className="text-teal-500"/> Conductividad (EC)</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" name="EC (mS/cm)" dataKey="ec_conductividad" stroke="#14b8a6" strokeWidth={2} fill="url(#colorEc)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400">Faltan datos</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50"><div className="flex items-center gap-2"><Leaf className="text-emerald-500" size={20} /><h3 className="font-bold text-slate-700">Historial de Registros</h3></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Sistema</th>
                <th className="px-6 py-4">pH</th>
                <th className="px-6 py-4">EC</th>
                <th className="px-6 py-4">Temp °C</th>
                {rol === 'admin' && <th className="px-6 py-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...datos].reverse().map((reg) => (
                <tr key={reg.id} className="hover:bg-emerald-50/30 transition">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{reg.fecha_larga}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{reg.id_sistema || 'N/D'}</td>
                  <td className="px-6 py-4 font-medium">{reg.ph_solucion ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-teal-600">{reg.ec_conductividad ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{reg.temp_solucion ?? '--'}</td>
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

export default DashboardHidroponia;