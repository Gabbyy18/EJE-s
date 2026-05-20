const descargarBoletinWord = async () => {
    const resumen = procesarDatosSemanales(datosSemanales);
    
    // 1. Cargar la plantilla desde la carpeta public
    const response = await fetch('/plantilla_boletin.docx');
    const content = await response.arrayBuffer();
    
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    // 2. Mapear los datos del resumen a las etiquetas del Word
    // ¡AQUÍ ESTÁ LA ACTUALIZACIÓN, AHORA MAPEAMOS TODO!
    doc.setData({
      fecha_hoy: new Date().toLocaleDateString(),
      // Fechas del período
      fecha_inicio: resumen.fechaInicio,
      fecha_fin: resumen.fechaFin,
      // Totales
      registros: resumen.totalRegistros,
      // pH
      ph_promedio: resumen.ph.promedio,
      ph_max: resumen.ph.max,
      ph_min: resumen.ph.min,
      // Temperatura
      temp_promedio: resumen.temperatura.promedio,
      temp_max: resumen.temperatura.max,
      temp_min: resumen.temperatura.min,
      // EC
      ec_promedio: resumen.conductividad.promedio,
      ec_max: resumen.conductividad.max,
      ec_min: resumen.conductividad.min,
      // Salinidad
      sal_promedio: resumen.salinidad.promedio,
      sal_max: resumen.salinidad.max,
      sal_min: resumen.salinidad.min,
    });

    try {
      doc.render();
    } catch (error) {
      console.error(error);
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    saveAs(out, `Boletin_Semanal_${new Date().toLocaleDateString()}.docx`);
  };
