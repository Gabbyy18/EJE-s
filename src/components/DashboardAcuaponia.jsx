import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// 1. Se agregó el ícono Download aquí
import { TestTubes, Thermometer, Waves, Activity, Fish, Trash2, Loader2, Calendar, Download } from 'lucide-react';

const DashboardAcuaponia = ({ rol }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // === ESTADOS PARA EL RANGO DE FECHAS ===
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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

  // === 1. LÓGICA DE FILTRADO POR FECHAS ===
  const datosFiltrados = datos.filter(item => {
    if (!fechaInicio && !fechaFin) return true;
    const fechaItem = new Date(item.created_at).getTime();
    const inicio = fechaInicio ? new Date(`${fechaInicio}T00:00:00`).getTime() : 0;
    const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`).getTime() : Infinity;
    return fechaItem >= inicio && fechaItem <= fin;
  });

  // === 2. MOTOR MATEMÁTICO (Promedio, Max, Min) ===
  const calcularStats = (data, llave) => {
    const valores = data.map(d => parseFloat(d[llave])).filter(n => !isNaN(n));
    if (valores.length === 0) return { avg: '--', max: '--', min: '--' };
    
    const suma = valores.reduce((a, b) => a + b, 0);
    return {
      avg: (suma / valores.length).toFixed(1),
      max: Math.max(...valores).toFixed(1),
      min: Math.min(...valores).toFixed(1)
    };
  };

  // Calculamos las estadísticas al vuelo para los tanques
  const statsPh = calcularStats(datosFiltrados, 'ph_agua');
  const statsTemp = calcularStats(datosFiltrados, 'temp_agua');
  const statsO2 = calcularStats(datosFiltrados, 'oxigeno_disuelto');
  const statsAmoniaco = calcularStats(datosFiltrados, 'amoniaco');

  // === 3. EXPORTAR A EXCEL (CSV) PARA ACUAPONÍA ===
  const descargarExcel = () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos en este rango de fechas para exportar.");
      return;
    }

    const encabezados = ["Fecha", "ID Tanque", "pH Agua", "Temp Agua (°C)", "O2 (mg/L)", "Amoniaco", "Nitritos", "Nitratos", "Nivel Agua (cm)", "Salud", "Medicion Extra", "Unidad", "Observaciones"];

    const filas = datosFiltrados.map(reg => [
      reg.fecha_larga,
      reg.id_tanque || 'N/D',
      reg.ph_agua || '',
      reg.temp_agua || '',
      reg.oxigeno_disuelto || '',
      reg.amoniaco || '',
      reg.nitritos || '',
      reg.nitratos || '',
      reg.nivel_agua || '',
      reg.salud_peces || '',
      reg.campo_libre_valor || '',
      reg.campo_libre_unidad || '',
      reg.observaciones ? reg.observaciones.replace(/,/g, ';').replace(/\n/g, ' ') : '' 
    ]);

    const contenidoCSV = ["\uFEFF" + encabezados.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BioMonitor_Acuaponia_${fechaInicio || 'Inicio'}_al_${fechaFin || 'Fin'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (cargando) return <div className="flex flex-col items-center justify-center h-64 text-cyan-500"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold">Sincronizando peces...</p></div>;

  return (
    <div className="space-y-6">
      
      {/* CABECERA Y FILTROS DE FECHA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-3 rounded-xl text-white shadow-md"><Fish size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Acuaponía</h1>
            <p className="text-slate-500">{datosFiltrados.length} registros en este periodo</p>
          </div>
        </div>
        
        {/* Controles de Rango de Fechas */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Calendar size={18} className="text-slate-400 ml-2" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Desde</span>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer px-2" />
          </div>
          <span className="text-slate-300 font-light text-2xl">-</span>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Hasta</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer px-2" />
          </div>
          {(fechaInicio || fechaFin) && (
            <button onClick={() => {setFechaInicio(''); setFechaFin('');}} className="ml-2 text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* TARJETAS DE INDICADORES DINÁMICOS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO PH AGUA</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsPh.avg}</p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsPh.min}</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsPh.max}</span>
            </div>
          </div>
          <div className="bg-cyan-50 p-3 rounded-full shrink-0"><TestTubes className="text-cyan-500" size={24} /></div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO TEMP.</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsTemp.avg} <span className="text-lg font-medium text-slate-400">°C</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsTemp.min}°</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsTemp.max}°</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-full shrink-0"><Thermometer className="text-blue-500" size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO O₂</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsO2.avg} <span className="text-lg font-medium text-slate-400">mg/L</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsO2.min}</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsO2.max}</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-full shrink-0"><Waves className="text-emerald-500" size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-purple-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO AMONIACO</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsAmoniaco.avg} <span className="text-lg font-medium text-slate-400">ppm</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsAmoniaco.min}</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsAmoniaco.max}</span>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-full shrink-0"><Activity className="text-purple-500" size={24} /></div>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-cyan-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><TestTubes size={16} className="text-cyan-500"/> Evolución del pH</h3>
          <div className="h-64 w-full">
            {datosFiltrados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosFiltrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No hay datos en este rango</div>)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Thermometer size={16} className="text-blue-500"/> Temperatura del Agua</h3>
          <div className="h-64 w-full">
            {datosFiltrados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosFiltrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No hay datos en este rango</div>)}
          </div>
        </div>
      </div>

      {/* HISTORIAL DE REGISTROS */}
      <div className="bg-white rounded-2xl shadow-sm border border-cyan-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-cyan-50/50">
          <div className="flex items-center gap-2">
            <Fish className="text-cyan-500" size={20} />
            <h3 className="font-bold text-slate-700">Historial de Registros</h3>
          </div>
          {/* 4. AQUÍ SE AGREGÓ EL BOTÓN EN LA CABECERA DE LA TABLA */}
          <button 
            onClick={descargarExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download size={16} /> Exportar Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3 text-left">Dato Extra</th>
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
              {[...datosFiltrados].reverse().map((reg) => (
                <tr key={reg.id} className="hover:bg-cyan-50/30 transition">
                  <td className="p-3">
                    {reg.campo_libre_valor ? (
                      <span className="font-bold text-slate-700">
                        {reg.campo_libre_valor} <span className="text-slate-400 font-normal">{reg.campo_libre_unidad}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{reg.fecha_larga}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{reg.id_tanque || 'N/D'}</td>
                  <td className="px-6 py-4 font-medium">{reg.ph_agua ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{reg.temp_agua ?? '--'}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{reg.oxigeno_disuelto ?? '--'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold">{reg.salud_peces || 'N/D'}</span>
                  </td>
                  {rol === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => borrarRegistro(reg.id)} className="text-slate-300 hover:text-rose-500 transition"><Trash2 size={18} /></button>
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

export default DashboardAcuaponia;