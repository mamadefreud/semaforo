const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const estadoPath = path.join(__dirname, "estado.json");

function leerEstado() {
  const data = fs.readFileSync(estadoPath);
  return JSON.parse(data);
}

function guardarEstado(data) {
  fs.writeFileSync(estadoPath, JSON.stringify(data, null, 2));
}

app.get("/estado", (req, res) => {
  const data = leerEstado();
  res.json(data);
});

app.post("/cambiarEstado", (req, res) => {
  const { nombre, estado } = req.body;
  const data = leerEstado();

  data.estados[nombre] = estado;

  // Actualizar ordenVerde
  if (estado === "verde" && !data.ordenVerde.includes(nombre)) {
    data.ordenVerde.push(nombre);
  } else if (estado === "rojo") {
    data.ordenVerde = data.ordenVerde.filter(n => n !== nombre);
  }

  guardarEstado(data);
  res.json(data);
});

app.post("/asignarTarea", (req, res) => {
  const data = leerEstado();

  if (data.ordenVerde.length === 0) {
    return res.status(400).json({ error: "No hay nadie disponible" });
  }

  const asignado = data.ordenVerde.shift();
  data.estados[asignado] = "rojo";

  guardarEstado(data);

  res.json({ ...data, asignado });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

const fs = require('fs');
const secuenciasPath = './secuencias.json';

// Obtener secuencias
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

// Actualizar una secuencia (asignar editor o marcar completado)
app.post('/secuencias/update', (req, res) => {
  const { index, campo, valor } = req.body;

  fs.readFile(secuenciasPath, (err, data) => {
    if (err) return res.status(500).send('Error leyendo secuencias');
    const secuencias = JSON.parse(data);
    secuencias[index][campo] = valor;

    fs.writeFile(secuenciasPath, JSON.stringify(secuencias, null, 2), err => {
      if (err) return res.status(500).send('Error actualizando');
      res.sendStatus(200);
    });
  });
});

// Resetear secuencias
app.post('/secuencias/reset', (req, res) => {
  fs.writeFile(secuenciasPath, '[]', err => {
    if (err) return res.status(500).send('Error reseteando');
    res.sendStatus(200);
  });
});

