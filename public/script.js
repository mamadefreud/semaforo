const miembros = ["Mariana", "Ximena", "Mau", "Héctor", "Vero"];
let estados = {};
let ordenVerde = [];

async function fetchEstado() {
  try {
    const res = await fetch("/estado");
    const data = await res.json();
    estados = data.estados;
    ordenVerde = data.ordenVerde;
    actualizarUI();
  } catch (err) {
    console.error("Error al cargar estado:", err);
  }
}

function actualizarUI() {
  const container = document.getElementById("team");
  container.innerHTML = "";

  miembros.forEach(nombre => {
    const estado = estados[nombre] || "rojo";

    const div = document.createElement("div");
    div.className = "miembro";
    div.id = nombre;

    const semaforo = document.createElement("div");
    semaforo.className = `semaforo ${estado}`;
    semaforo.id = `semaforo-${nombre}`;

    const label = document.createElement("span");
    label.textContent = nombre;

    const boton = document.createElement("button");
    boton.textContent = estado === "rojo" ? "Poner verde" : "Poner rojo";
    boton.onclick = () => toggleEstado(nombre);

    div.appendChild(semaforo);
    div.appendChild(label);
    div.appendChild(boton);
    container.appendChild(div);
  });

  actualizarListaVerde();
}

async function toggleEstado(nombre) {
  const nuevoEstado = estados[nombre] === "rojo" ? "verde" : "rojo";
  try {
    const res = await fetch("/cambiarEstado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, estado: nuevoEstado })
    });
    const data = await res.json();
    estados = data.estados;
    ordenVerde = data.ordenVerde;
    actualizarUI();
  } catch (err) {
    console.error("Error al cambiar estado:", err);
  }
}

function actualizarListaVerde() {
  const ul = document.getElementById("lista-verde");
  ul.innerHTML = "";

  if (ordenVerde.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nadie está disponible";
    ul.appendChild(li);
    return;
  }

  ordenVerde.forEach((nombre, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${nombre}`;
    ul.appendChild(li);
  });
}

async function asignarTarea() {
  if (ordenVerde.length === 0) {
    alert("No hay nadie disponible");
    return;
  }
  try {
    const res = await fetch("/asignarTarea", {
      method: "POST"
    });
    const data = await res.json();
    estados = data.estados;
    ordenVerde = data.ordenVerde;

    actualizarUI();

    const p = document.getElementById("ultimo-asignado");
    p.textContent = `✅ Última secuencia asignada a: ${data.asignado}`;
  } catch (err) {
    console.error("Error al asignar secuencia:", err);
  }
}

window.onload = fetchEstado;

let secuencias = []; // lista de objetos {numero, editor, completada}
let editores = ["Mariana", "Ximena", "Mau", "Héctor", "Vero"];

function cargarSecuencias() {
  const input = document.getElementById("inputSecuencias").value;
  const numeros = input.split(",").map(n => n.trim()).filter(n => n !== "");

  secuencias = numeros.map(n => ({ numero: n, editor: "", completada: false }));
  renderSecuencias();
}

function renderSecuencias() {
  const tbody = document.getElementById("tablaSecuencias").querySelector("tbody");
  tbody.innerHTML = "";

  secuencias.forEach((seq, i) => {
    const row = document.createElement("tr");

    // número
    const tdNumero = document.createElement("td");
    tdNumero.textContent = seq.numero;
    row.appendChild(tdNumero);

    // asignar a
    const tdAsignar = document.createElement("td");
    const select = document.createElement("select");

    const defaultOpt = document.createElement("option");
    defaultOpt.textContent = "-- Seleccionar --";
    defaultOpt.value = "";
    select.appendChild(defaultOpt);

    getEditoresEnVerde().forEach(editor => {
      const opt = document.createElement("option");
      opt.value = editor;
      opt.textContent = editor;
      select.appendChild(opt);
    });

    select.value = seq.editor;
    select.onchange = () => asignarEditor(i, select.value);
    tdAsignar.appendChild(select);
    row.appendChild(tdAsignar);

    // completado
    const tdCheck = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = seq.completada;
    checkbox.onchange = () => {
      secuencias[i].completada = checkbox.checked;
    };
    tdCheck.appendChild(checkbox);
    row.appendChild(tdCheck);

    tbody.appendChild(row);
  });
}

function asignarEditor(index, editor) {
  secuencias[index].editor = editor;
  cambiarEstado(editor, "rojo"); // lo pone en rojo al asignarle
  renderSecuencias(); // refresca selectores
  actualizarSemaforos();
}

function resetearDia() {
  secuencias = [];
  renderSecuencias();
  actualizarSemaforos();
  // podrías también restaurar todos los estados a "rojo" si querés
}

// Asume que hay una variable "estado" con los estados actuales
function getEditoresEnVerde() {
  return estado.filter(p => p.estado === "verde").map(p => p.nombre);
}

