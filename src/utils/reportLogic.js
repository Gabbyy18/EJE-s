// utils/reportLogic.js
export const procesarDatosSemanales = (datos) => {
  if (!datos || datos.length === 0) return null;

  const calcularPromedio = (arr, clave) => 
    (arr.reduce((acc, curr) => acc + (curr[clave] || 0), 0) / arr.length).toFixed(2);

  const obtenerExtremos = (arr, clave) => {
    const valores = arr.map(d => d[clave]).filter(v => v != null);
    return {
      max: Math.max(...valores),
      min: Math.min(...valores)
    };
  };

  return {
    totalRegistros: datos.length,
    fechaInicio: datos[0].fecha,
    fechaFin: datos[datos.length - 1].fecha,
    ph: { promedio: calcularPromedio(datos, 'ph'), ...obtenerExtremos(datos, 'ph') },
    temperatura: { promedio: calcularPromedio(datos, 'temperatura'), ...obtenerExtremos(datos, 'temperatura') },
    conductividad: { promedio: calcularPromedio(datos, 'ec'), ...obtenerExtremos(datos, 'ec') },
    salinidad: { promedio: calcularPromedio(datos, 'salinidad'), ...obtenerExtremos(datos, 'salinidad') },
    // Agrega aquí los parámetros que necesites (ORP, TDS, etc.)
  };
};
