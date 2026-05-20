import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Thermometer, Droplets, Bug, Save, Weight, Activity, 
  FileText, Fish, Leaf, TestTubes, Waves, Zap, Sun, Hash
} from 'lucide-react';

const RegistroForm = () => {
  const [loading, setLoading] = useState(false);
  const [subTab, setSubTab] = useState('colmena');

  const [formColmena, setFormColmena] = useState({ temp_interna: '', humedad_interna: '', peso_colmena: '', actividad_abejas: 'Media', temp_externa: '', humedad_externa: '', id_colmena: '', observaciones: '' });
  const [formAcuaponia, setFormAcuaponia] = useState({ ph_agua: '', temp_agua: '', oxigeno_disuelto: '', amoniaco: '', nitritos: '', nitratos: '', nivel_agua: '', salud_peces: 'Buena', id_tanque: '', observaciones: '' });
  const [formHidroponia, setFormHidroponia] = useState({ ph_solucion: '', ec_conductividad: '', tds: '', temp_solucion: '', temp_ambiente: '', humedad: '', horas_luz: '', id_sistema: '', observaciones: '' });

  
  const limpiarParaBD = (obj) => {
    const limpio = {};
    Object.keys(obj).forEach(key => {
      const valor = obj[key];
      if (valor === '' && key !== 'observaciones' && !key.startsWith('id_') && key !== 'actividad_abejas' && key !== 'salud_peces') {
        limpio[key] = null;
      } else {
        limpio[key] = valor;
      }
    });
    return limpio;
  };

  const manejarGuardado = async (e, tabla, datos, setLimpiar, inicial) => {
    e.preventDefault();
    setLoading(true);
    
    const datosListos = limpiarParaBD(datos);
    const { error } = await supabase.from(tabla).insert([datosListos]);

    if (error) {
      alert("Error al guardar en " + tabla + ": " + error.message);
    } else {
      alert("¡Registro guardado exitosamente en la nube!");
      setLimpiar(inicial);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Ecosistema */}
      <div className="flex bg-slate-200/50 rounded-2xl p-2 gap-2 shadow-inner">
        <button onClick={() => setSubTab('colmena')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${subTab === 'colmena' ? 'bg-amber-500 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-white'}`}><Bug size={18} /> Colmena</button>
        <button onClick={() => setSubTab('acuaponia')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${subTab === 'acuaponia' ? 'bg-cyan-500 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-white'}`}><Fish size={18} /> Acuaponía</button>
        <button onClick={() => setSubTab('hidroponia')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${subTab === 'hidroponia' ? 'bg-emerald-500 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-white'}`}><Leaf size={18} /> Hidroponía</button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border-2 overflow-hidden transition-colors duration-300" style={{ borderColor: subTab === 'colmena' ? '#f59e0b' : subTab === 'acuaponia' ? '#06b6d4' : '#10b981' }}>
        <div className="p-8">
          
          {/* --- COLMENA --- */}
          {subTab === 'colmena' && (
            <form onSubmit={(e) => manejarGuardado(e, 'registro_colmena', formColmena, setFormColmena, { temp_interna: '', humedad_interna: '', peso_colmena: '', actividad_abejas: 'Media', temp_externa: '', humedad_externa: '', id_colmena: '', observaciones: '' })} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-2 border-b pb-4 mb-2 text-amber-700 font-bold uppercase tracking-wider text-sm"><Bug size={20}/> Registro de Colmena</div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Thermometer size={14}/> TEMP. INTERNA (°C) *</label><input type="number" step="0.1" required value={formColmena.temp_interna} onChange={(e) => setFormColmena({...formColmena, temp_interna: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Droplets size={14}/> HUMEDAD INTERNA (%) *</label><input type="number" step="0.1" required value={formColmena.humedad_interna} onChange={(e) => setFormColmena({...formColmena, humedad_interna: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Weight size={14}/> PESO (KG)</label><input type="number" step="0.1" value={formColmena.peso_colmena} onChange={(e) => setFormColmena({...formColmena, peso_colmena: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Activity size={14}/> ACTIVIDAD</label><select value={formColmena.actividad_abejas} onChange={(e) => setFormColmena({...formColmena, actividad_abejas: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none"><option>Baja</option><option>Media</option><option>Alta</option></select></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Thermometer size={14}/> TEMP. EXTERNA (°C)</label><input type="number" step="0.1" value={formColmena.temp_externa} onChange={(e) => setFormColmena({...formColmena, temp_externa: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Droplets size={14}/> HUMEDAD EXTERNA (%)</label><input type="number" step="0.1" value={formColmena.humedad_externa} onChange={(e) => setFormColmena({...formColmena, humedad_externa: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Hash size={14}/> ID COLMENA</label><input type="text" value={formColmena.id_colmena} onChange={(e) => setFormColmena({...formColmena, id_colmena: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="md:col-span-2 space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText size={14}/> OBSERVACIONES</label><textarea value={formColmena.observaciones} onChange={(e) => setFormColmena({...formColmena, observaciones: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none resize-none" rows="2"></textarea></div>
              <button type="submit" disabled={loading} className="md:col-span-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"><Save /> {loading ? 'PROCESANDO...' : 'GUARDAR COLMENA'}</button>
            </form>
          )}

          {/* --- ACUAPONÍA --- */}
          {subTab === 'acuaponia' && (
            <form onSubmit={(e) => manejarGuardado(e, 'registro_acuaponia', formAcuaponia, setFormAcuaponia, { ph_agua: '', temp_agua: '', oxigeno_disuelto: '', amoniaco: '', nitritos: '', nitratos: '', nivel_agua: '', salud_peces: 'Buena', id_tanque: '', observaciones: '' })} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 flex items-center gap-2 border-b pb-4 mb-2 text-cyan-700 font-bold uppercase tracking-wider text-sm"><Fish size={20}/> Registro de Acuaponía</div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><TestTubes size={14}/> PH AGUA *</label><input type="number" step="0.1" required value={formAcuaponia.ph_agua} onChange={(e) => setFormAcuaponia({...formAcuaponia, ph_agua: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Thermometer size={14}/> TEMP. AGUA (°C) *</label><input type="number" step="0.1" required value={formAcuaponia.temp_agua} onChange={(e) => setFormAcuaponia({...formAcuaponia, temp_agua: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Waves size={14}/> O2 (MG/L)</label><input type="number" step="0.1" value={formAcuaponia.oxigeno_disuelto} onChange={(e) => setFormAcuaponia({...formAcuaponia, oxigeno_disuelto: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Activity size={14}/> AMONIACO</label><input type="number" step="0.01" value={formAcuaponia.amoniaco} onChange={(e) => setFormAcuaponia({...formAcuaponia, amoniaco: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Droplets size={14}/> NITRITOS</label><input type="number" step="0.01" value={formAcuaponia.nitritos} onChange={(e) => setFormAcuaponia({...formAcuaponia, nitritos: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Droplets size={14}/> NITRATOS</label><input type="number" step="0.01" value={formAcuaponia.nitratos} onChange={(e) => setFormAcuaponia({...formAcuaponia, nitratos: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Waves size={14}/> NIVEL AGUA (CM)</label><input type="number" step="0.1" value={formAcuaponia.nivel_agua} onChange={(e) => setFormAcuaponia({...formAcuaponia, nivel_agua: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Fish size={14}/> SALUD PECES</label><select value={formAcuaponia.salud_peces} onChange={(e) => setFormAcuaponia({...formAcuaponia, salud_peces: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none"><option>Mala</option><option>Regular</option><option>Buena</option></select></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Hash size={14}/> ID TANQUE</label><input type="text" value={formAcuaponia.id_tanque} onChange={(e) => setFormAcuaponia({...formAcuaponia, id_tanque: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
              <div className="md:col-span-3 space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText size={14}/> OBSERVACIONES</label><textarea value={formAcuaponia.observaciones} onChange={(e) => setFormAcuaponia({...formAcuaponia, observaciones: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none resize-none" rows="2"></textarea></div>
              <button type="submit" disabled={loading} className="md:col-span-3 bg-cyan-500 hover:bg-cyan-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"><Save /> {loading ? 'PROCESANDO...' : 'GUARDAR ACUAPONÍA'}</button>
            </form>
          )}

          {/* --- HIDROPONÍA --- */}
          {subTab === 'hidroponia' && (
            <form onSubmit={(e) => manejarGuardado(e, 'registro_hidroponia', formHidroponia, setFormHidroponia, { ph_solucion: '', ec_conductividad: '', tds: '', temp_solucion: '', temp_ambiente: '', humedad: '', horas_luz: '', id_sistema: '', observaciones: '' })} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 flex items-center gap-2 border-b pb-4 mb-2 text-emerald-700 font-bold uppercase tracking-wider text-sm"><Leaf size={20}/> Registro de Hidroponía</div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><TestTubes size={14}/> PH SOLUCIÓN *</label><input type="number" step="0.1" required value={formHidroponia.ph_solucion} onChange={(e) => setFormHidroponia({...formHidroponia, ph_solucion: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Zap size={14}/> EC (MS/CM) *</label><input type="number" step="0.1" required value={formHidroponia.ec_conductividad} onChange={(e) => setFormHidroponia({...formHidroponia, ec_conductividad: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><TestTubes size={14}/> TDS</label><input type="number" step="0.1" value={formHidroponia.tds} onChange={(e) => setFormHidroponia({...formHidroponia, tds: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Thermometer size={14}/> TEMP. SOLUCIÓN (°C)</label><input type="number" step="0.1" value={formHidroponia.temp_solucion} onChange={(e) => setFormHidroponia({...formHidroponia, temp_solucion: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Thermometer size={14}/> TEMP. AMBIENTE (°C)</label><input type="number" step="0.1" value={formHidroponia.temp_ambiente} onChange={(e) => setFormHidroponia({...formHidroponia, temp_ambiente: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Droplets size={14}/> HUMEDAD (%)</label><input type="number" step="0.1" value={formHidroponia.humedad} onChange={(e) => setFormHidroponia({...formHidroponia, humedad: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Sun size={14}/> HORAS LUZ</label><input type="number" step="0.1" value={formHidroponia.horas_luz} onChange={(e) => setFormHidroponia({...formHidroponia, horas_luz: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Hash size={14}/> ID SISTEMA</label><input type="text" value={formHidroponia.id_sistema} onChange={(e) => setFormHidroponia({...formHidroponia, id_sistema: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
              <div className="md:col-span-3 space-y-1"><label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText size={14}/> OBSERVACIONES</label><textarea value={formHidroponia.observaciones} onChange={(e) => setFormHidroponia({...formHidroponia, observaciones: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none resize-none" rows="2"></textarea></div>
              <button type="submit" disabled={loading} className="md:col-span-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"><Save /> {loading ? 'PROCESANDO...' : 'GUARDAR HIDROPONÍA'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistroForm;

