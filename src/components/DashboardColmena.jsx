import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// 1. Aquí se agregó el ícono 'Download'
import { Thermometer, Droplets, Weight, Sun, Trash2, Bug, Loader2, Calendar, Download } from 'lucide-react';

const DashboardColmena = ({ rol }) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

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

  const datosFiltrados = datos.filter(item => {
    if (!fechaInicio && !fechaFin) return true;
    const fechaItem = new Date(item.created_at).getTime();
    const inicio = fechaInicio ? new Date(`${fechaInicio}T00:00:00`).getTime() : 0;
    const fin = fechaFin ? new Date(`${fechaFin}T23:59:59`).getTime() : Infinity;
    return fechaItem >= inicio && fechaItem <= fin;
  });

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

  const statsTemp = calcularStats(datosFiltrados, 'temp_interna');
  const statsHum = calcularStats(datosFiltrados, 'humedad_interna');
  const statsPeso = calcularStats(datosFiltrados, 'peso_colmena');
  const statsTempExt = calcularStats(datosFiltrados, 'temp_externa');

  // === 2. FUNCIÓN PARA EXPORTAR A EXCEL (CSV) ===
  const descargarExcel = () => {
    if (datosFiltrados.length === 0) {
      alert("No hay datos en este rango de fechas para exportar.");
      return;
    }

    const encabezados = ["Fecha", "ID Colmena", "Temp Interna (°C)", "Humedad Interna (%)", "Peso (kg)", "Temp Externa (°C)", "Humedad Externa (%)", "Actividad", "Medicion Extra", "Unidad", "Observaciones"];

    const filas = datosFiltrados.map(reg => [
      reg.fecha_larga,
      reg.id_colmena || 'N/D',
      reg.temp_interna || '',
      reg.humedad_interna || '',
      reg.peso_colmena || '',
      reg.temp_externa || '',
      reg.humedad_externa || '',
      reg.actividad_abejas || '',
      reg.campo_libre_valor || '',
      reg.campo_libre_unidad || '',
      reg.observaciones ? reg.observaciones.replace(/,/g, ';').replace(/\n/g, ' ') : '' 
    ]);

    const contenidoCSV = ["\uFEFF" + encabezados.join(","), ...filas.map(f => f.join(","))].join("\n");
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BioMonitor_Colmena_${fechaInicio || 'Inicio'}_al_${fechaFin || 'Fin'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (cargando) return <div className="flex flex-col items-center justify-center h-64 text-amber-500"><Loader2 className="animate-spin mb-4" size={40} /><p className="font-bold">Conectando con la base de datos...</p></div>;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-3 rounded-xl text-white shadow-md"><Bug size={24} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Colmena</h1>
            <p className="text-slate-500">{datosFiltrados.length} registros en este periodo</p>
          </div>
        </div>
        
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO TEMP. INT.</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsTemp.avg} <span className="text-lg font-medium text-slate-400">°C</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsTemp.min}°</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsTemp.max}°</span>
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-full shrink-0"><Thermometer className="text-amber-500" size={24} /></div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO HUMEDAD</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsHum.avg} <span className="text-lg font-medium text-slate-400">%</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsHum.min}%</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsHum.max}%</span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-full shrink-0"><Droplets className="text-blue-500" size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO PESO</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsPeso.avg} <span className="text-lg font-medium text-slate-400">kg</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsPeso.min}</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsPeso.max}</span>
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-full shrink-0"><Weight className="text-orange-500" size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-200 flex justify-between items-start transition-all hover:shadow-md">
          <div className="w-full">
            <p className="text-xs font-bold text-slate-400 tracking-wider">PROMEDIO TEMP. EXT.</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{statsTempExt.avg} <span className="text-lg font-medium text-slate-400">°C</span></p>
            <div className="flex gap-2 mt-3">
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Min: {statsTempExt.min}°</span>
              <span className="bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-500">Max: {statsTempExt.max}°</span>
            </div>
          </div>
          <div className="bg-rose-50 p-3 rounded-full shrink-0"><Sun className="text-rose-500" size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Thermometer size={16} className="text-amber-500"/> Temperatura Interna vs Externa</h3>
          <div className="h-64 w-full">
            {datosFiltrados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosFiltrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No hay datos en este rango de fechas</div>)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-200">
          <h3 className="text-sm font-bold text-slate-600 mb-4 flex items-center gap-2"><Weight size={16} className="text-orange-500"/> Evolución del Peso</h3>
          <div className="h-64 w-full">
            {datosFiltrados.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosFiltrados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="fecha_corta" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Line type="monotone" name="Peso (kg)" dataKey="peso_colmena" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 0}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (<div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">No hay datos en este rango de fechas</div>)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
        {/* 3. AQUÍ SE AGREGÓ EL BOTÓN EN LA CABECERA DE LA TABLA */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
          <div className="flex items-center gap-2">
            <Bug className="text-amber-500" size={20} />
            <h3 className="font-bold text-slate-700">Historial de Registros</h3>
          </div>
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
                <th className="px-6 py-4">Fecha y Hora</th>
                <th className="px-6 py-4">ID Colmena</th>
                <th className="px-6 py-4">Temp Int.</th>
                <th className="px-6 py-4">Hum Int.</th>
                <th className="px-6 py-4">Peso</th>
                <th className="px-6 py-4">Actividad</th>
                {rol === 'admin' && <th className="px-6 py-4 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...datosFiltrados].reverse().map((registro) => (
                <tr key={registro.id} className="hover:bg-amber-50/30 transition">
                  <td className="p-3">
                    {registro.campo_libre_valor ? (
                      <span className="font-bold text-slate-700">
                        {registro.campo_libre_valor} <span className="text-slate-400 font-normal">{registro.campo_libre_unidad}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
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