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
