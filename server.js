const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const estadoPath = path.join(__dirname, 'estado.json');
const secuenciasPath = path.join(__dirname, 'secuencias.json');

// Leer archivo JSON de forma segura
function leerJSON(ruta) {
  try {
    if (!fs.existsSync(ruta)) return null;
    const data = fs.readFileSync(ruta, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error leyendo archivo:', ruta, err);
    return null;
  }
}

// Guardar JSON de forma segura
function guardarJSON(ruta, data) {
  try {
    fs.writeFileSync(ruta, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando archivo:', ruta, err);
  }
}

// ENDPOINT para obtener estado de semáforo
app.get('/estado', (req, res) => {
  const estado = leerJSON(estadoPath);
  if (estado) {
    res.json(estado);
  } else {
    // Si no existe, inicializar con 5 personas en rojo
    const inicial = [
      { nombre: 'Mariana', estado: 'rojo' },
      { nombre: 'Ximena', estado: 'rojo' },
      { nombre: 'Mau', estado: 'rojo' },
      { nombre: 'Héctor', estado: 'rojo' },
      { nombre: 'Vero', estado: 'rojo' }
    ];
    guardarJSON(estadoPath, inicial);
    res.json(inicial);
  }
});

// ENDPOINT para actualizar estado de semáforo
app.post('/estado', (req, res) => {
  const { nombre, estado } = req.body;
  if (!nombre || !estado) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const estadoActual = leerJSON(estadoPath) || [];
  const index = estadoActual.findIndex(p => p.nombre === nombre);

  if (index !== -1) {
    estadoActual[index].estado = estado;
    estadoActual[index].timestamp = (estado === 'verde') ? Date.now() : null;
    guardarJSON(estadoPath, estadoActual);
    return res.json({ ok: true });
  }

  res.status(404).json({ error: 'Persona no encontrada' });
});

  if (!nombre || !estado) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  const estadoActual = leerJSON(estadoPath) || [];
  const index = estadoActual.findIndex(p => p.nombre === nombre);
  if (index !== -1) {
    estadoActual[index].estado = estado;
    guardarJSON(estadoPath, estadoActual);
    return res.json({ ok: true });
  }
  res.status(404).json({ error: 'Persona no encontrada' });
});

// ENDPOINT para obtener secuencias
app.get('/secuencias', (req, res) => {
  const secuencias = leerJSON(secuenciasPath) || [];
  res.json(secuencias);
});

// ENDPOINT para agregar lista de secuencias (cada día se resetea)
app.post('/secuencias', (req, res) => {
  const { secuencias } = req.body;
  if (!Array.isArray(secuencias)) {
    return res.status(400).json({ error: 'Secuencias inválidas' });
  }
  // Crear arreglo con estructura: { nombre: secuencia, editor: null, completada: false }
  const lista = secuencias.map(s => ({
    nombre: s,
    editor: null,
    completada: false
  }));
  guardarJSON(secuenciasPath, lista);
  res.json({ ok: true });
});

// ENDPOINT para asignar editor manualmente a una secuencia
app.post('/asignar', (req, res) => {
  const { index, nombre } = req.body;
  if (typeof index !== 'number' || !nombre) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const secuencias = leerJSON(secuenciasPath) || [];
  if (index < 0 || index >= secuencias.length) {
    return res.status(400).json({ error: 'Índice fuera de rango' });
  }

  // Asignar editor
  secuencias[index].editor = nombre;
  guardarJSON(secuenciasPath, secuencias);

  // También cambiar el estado del editor a rojo (ocupado)
  const estadoActual = leerJSON(estadoPath) || [];
  const editorIndex = estadoActual.findIndex(p => p.nombre === nombre);
  if (editorIndex !== -1) {
    estadoActual[editorIndex].estado = 'rojo';
    guardarJSON(estadoPath, estadoActual);
  }

  res.json({ ok: true });
});

// ENDPOINT para marcar secuencia como completada o no
app.post('/completar', (req, res) => {
  const { index, completada } = req.body;
  if (typeof index !== 'number' || typeof completada !== 'boolean') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  const secuencias = leerJSON(secuenciasPath) || [];
  if (index < 0 || index >= secuencias.length) {
    return res.status(400).json({ error: 'Índice fuera de rango' });
  }
  secuencias[index].completada = completada;
  guardarJSON(secuenciasPath, secuencias);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
