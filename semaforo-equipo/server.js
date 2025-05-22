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
