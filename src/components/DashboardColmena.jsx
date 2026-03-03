import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Weight, Sun, Trash2, Bug, Loader2 } from 'lucide-react';

// AQUI RECIBIMOS EL ROL
const DashboardColmena = ({ rol }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase.from('registro_colmena').select('*').order('created_at', { ascending: true });
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
      console.error("Error al obtener datos:", error.message);
    } finally {
      setCargando(false);
    }
  };

  const borrarRegistro = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este registro?")) {
      const { error } = await supabase.from('registro_colmena').delete().eq('id', id);
      if (!error) obtenerDatos(); 
    }
  };

  const ultimoRegistro = datos.length > 0 ? datos[datos.length - 1] : null;

  if (cargando) return <div className="flex flex-col items-center justify-center h-64 text-amber-500"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold">Conectando con la base de datos...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-amber-500 p-3 rounded-xl text-white shadow-md"><Bug size={24} /></div>
        <div><h1 className="text-2xl font-bold text-slate-800">Dashboard Colmena</h1><p className="text-slate-500">{datos.length} registros sincronizados</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">TEMP. INTERNA</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimoRegistro?.temp_interna ?? '--'} <span className="text-lg font-medium text-slate-400">°C</span></p></div>
          <div className="bg-amber-50 p-3 rounded-full"><Thermometer className="text-amber-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">HUMEDAD INT.</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimoRegistro?.humedad_interna ?? '--'} <span className="text-lg font-medium text-slate-400">%</span></p></div>
          <div className="bg-blue-50 p-3 rounded-full"><Droplets className="text-blue-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">PESO</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimoRegistro?.peso_colmena ?? '--'} <span className="text-lg font-medium text-slate-400">kg</span></p></div>
          <div className="bg-orange-50 p-3 rounded-full"><Weight className="text-orange-500" size={24} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-200 flex justify-between items-center transition-all hover:shadow-md">
          <div><p className="text-xs font-bold text-slate-400 tracking-wider">TEMP. EXTERNA</p><p className="text-3xl font-bold text-slate-800 mt-1">{ultimoRegistro?.temp_externa ?? '--'} <span className="text-lg font-medium text-slate-400">°C</span></p></div>
          <div className="bg-rose-50 p-3 rounded-full"><Sun className="text-rose-500" size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Thermometer size={16} className="text-amber-500"/> Temperatura Interna vs Externa</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTempInt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorTempExt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" name="Temp. Interna" dataKey="temp_interna" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTempInt)" />
                  <Area type="monotone" name="Temp. Externa" dataKey="temp_externa" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorTempExt)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Faltan datos</div>)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Weight size={16} className="text-orange-500"/> Evolución del Peso</h3>
          <div className="h-64">
            {datos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Line type="monotone" name="Peso (kg)" dataKey="peso_colmena" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 0}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Faltan datos</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
          <div className="flex items-center gap-2"><Bug className="text-amber-500" size={20} /><h3 className="font-bold text-slate-700">Historial de Registros</h3></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">ID Colmena</th>
                <th className="px-6 py-4">Temp Int.</th>
                <th className="px-6 py-4">Hum Int.</th>
                <th className="px-6 py-4">Peso</th>
                <th className="px-6 py-4">Actividad</th>
                {/* MAGIA: Solo el admin ve la columna de Acción */}
                {rol === 'admin' && <th className="px-6 py-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...datos].reverse().map((registro) => (
                <tr key={registro.id} className="hover:bg-amber-50/30 transition">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{registro.fecha_larga}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{registro.id_colmena || 'N/D'}</td>
                  <td className="px-6 py-4 font-medium">{registro.temp_interna ? `${registro.temp_interna} °C` : '--'}</td>
                  <td className="px-6 py-4 font-medium">{registro.humedad_interna ? `${registro.humedad_interna} %` : '--'}</td>
                  <td className="px-6 py-4 font-medium text-orange-600">{registro.peso_colmena ? `${registro.peso_colmena} kg` : '--'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${registro.actividad_abejas === 'Alta' ? 'bg-rose-100 text-rose-600' : registro.actividad_abejas === 'Media' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {registro.actividad_abejas || 'N/D'}
                    </span>
                  </td>
                  {/* MAGIA: Solo el admin ve el botón de borrar */}
                  {rol === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => borrarRegistro(registro.id)} className="text-slate-300 hover:text-rose-500 transition" title="Eliminar registro"><Trash2 size={18} /></button>
                    </td>
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

export default DashboardColmena;