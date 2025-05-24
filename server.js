const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// === Configuración ===
app.use(express.static('public'));
app.use(express.json());

const estadoPath = './estado.json';
const secuenciasPath = './secuencias.json';

// === SEMÁFOROS ===

// Inicializa estado si no existe
if (!fs.existsSync(estadoPath)) {
  const inicial = [
    { nombre: "Mariana", estado: "rojo" },
    { nombre: "Ximena", estado: "rojo" },
    { nombre: "Mau", estado: "rojo" },
    { nombre: "Héctor", estado: "rojo" },
    { nombre: "Vero", estado: "rojo" }
  ];
  fs.writeFileSync(estadoPath, JSON.stringify(inicial, null, 2));
}

// Obtener estado
app.get('/estado', (req, res) => {
  fs.readFile(estadoPath, (err, data) => {
    if (err) return res.status(500).send('Error leyendo estado');
    res.send(JSON.parse(data));
  });
});

// Cambiar estado de una persona
app.post('/estado', (req, res) => {
  const { nombre, estado: nuevoEstado } = req.body;
  fs.readFile(estadoPath, (err, data) => {
    if (err) return res.status(500).send('Error leyendo estado');
    let estados = JSON.parse(data);

    const index = estados.findIndex(p => p.nombre === nombre);
    if (index !== -1) {
      estados[index].estado = nuevoEstado;
      fs.writeFile(estadoPath, JSON.stringify(estados, null, 2), err => {
        if (err) return res.status(500).send('Error guardando estado');
        res.sendStatus(200);
      });
    } else {
      res.status(404).send('Nombre no encontrado');
    }
  });
});

// === SECUENCIAS ===

// Inicializa archivo si no existe
if (!fs.existsSync(secuenciasPath)) {
  fs.writeFileSync(secuenciasPath, '[]');
}

// Obtener todas las secuencias
app.get('/secuencias', (req, res) => {
  fs.readFile(secuenciasPath, (err, data) => {
    if (err) return res.status(500).send('Error leyendo secuencias');
    res.send(JSON.parse(data));
  });
});

// Cargar nuevas secuencias
app.post('/secuencias', (req, res) => {
  const nuevas = req.body; // lista [{numero, editor: "", completada: false}]
  fs.writeFile(secuenciasPath, JSON.stringify(nuevas, null, 2), err => {
    if (err) return res.status(500).send('Error guardando secuencias');
    res.sendStatus(200);
  });
});

// Actualizar una secuencia
app.post('/secuencias/update', (req, res) => {
  const { index, campo, valor } = req.body;

  fs.readFile(secuenciasPath, (err, data) => {
    if (err) return res.status(500).send('Error leyendo secuencias');
    const secuencias = JSON.parse(data);
    if (index >= 0 && index < secuencias.length) {
      secuencias[index][campo] = valor;
      fs.writeFile(secuenciasPath, JSON.stringify(secuencias, null, 2), err => {
        if (err) return res.status(500).send('Error actualizando');
        res.sendStatus(200);
      });
    } else {
      res.status(400).send('Índice inválido');
    }
  });
});

// Resetear todas las secuencias
app.post('/secuencias/reset', (req, res) => {
  fs.writeFile(secuenciasPath, '[]', err => {
    if (err) return res.status(500).send('Error reseteando');
    res.sendStatus(200);
  });
});

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
