const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const estadoPath = path.join(__dirname, 'estado.json');
const secuenciasPath = path.join(__dirname, 'secuencias.json');

function leerJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch (e) {
    return [];
  }
}

function guardarJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Inicializar archivos si no existen
if (!fs.existsSync(estadoPath)) {
  guardarJSON(estadoPath, [
    { nombre: 'Mariana', estado: 'rojo', timestamp: null },
    { nombre: 'Ximena', estado: 'rojo', timestamp: null },
    { nombre: 'Mau', estado: 'rojo', timestamp: null },
    { nombre: 'Héctor', estado: 'rojo', timestamp: null },
    { nombre: 'Vero', estado: 'rojo', timestamp: null }
  ]);
}

if (!fs.existsSync(secuenciasPath)) {
  guardarJSON(secuenciasPath, []);
}

// Rutas

app.get('/estado', (req, res) => {
  res.json(leerJSON(estadoPath));
});

app.post('/estado', (req, res) => {
  const { nombre, estado } = req.body;
  if (!nombre || !estado) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const estadoActual = leerJSON(estadoPath);
  const index = estadoActual.findIndex(p => p.nombre === nombre);
  if (index !== -1) {
    estadoActual[index].estado = estado;
    estadoActual[index].timestamp = (estado === 'verde') ? Date.now() : null;
    guardarJSON(estadoPath, estadoActual);
    return res.json({ ok: true });
  }

  res.status(404).json({ error: 'Persona no encontrada' });
});

app.get('/secuencias', (req, res) => {
  res.json(leerJSON(secuenciasPath));
});

app.post('/secuencias', (req, res) => {
  const { secuencias } = req.body;
  if (!Array.isArray(secuencias)) return res.status(400).json({ error: 'Formato incorrecto' });

  const nuevas = secuencias.map(nombre => ({
    nombre,
    editor: null,
    completada: false
  }));

  guardarJSON(secuenciasPath, nuevas);
  res.json({ ok: true });
});

app.post('/asignar', (req, res) => {
  const { index, nombre } = req.body;
  const secuencias = leerJSON(secuenciasPath);
  if (!secuencias[index]) return res.status(404).json({ error: 'Secuencia no encontrada' });

  secuencias[index].editor = nombre;
  guardarJSON(secuenciasPath, secuencias);

  // Cambiar semáforo a rojo al asignar tarea
  const estadoActual = leerJSON(estadoPath);
  const persona = estadoActual.find(p => p.nombre === nombre);
  if (persona) {
    persona.estado = 'rojo';
    persona.timestamp = null;
    guardarJSON(estadoPath, estadoActual);
  }

  res.json({ ok: true });
});

app.post('/completar', (req, res) => {
  const { index, completada } = req.body;
  const secuencias = leerJSON(secuenciasPath);
  if (!secuencias[index]) return res.status(404).json({ error: 'Secuencia no encontrada' });

  secuencias[index].completada = completada;
  guardarJSON(secuenciasPath, secuencias);
  res.json({ ok: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
