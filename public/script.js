// === Semáforo ===

const nombres = ["Mariana", "Ximena", "Mau", "Héctor", "Vero"];
let estado = [];

function cargarEstado() {
  fetch('/estado')
    .then(res => res.json())
    .then(data => {
      estado = data;
      actualizarSemaforos();
    });
}

function cambiarEstado(nombre, nuevoEstado) {
  fetch('/estado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, estado: nuevoEstado })
  }).then(() => cargarEstado());
}

function actualizarSemaforos() {
  const contenedor = document.getElementById('semaforos');
  contenedor.innerHTML = '';

  estado.forEach(persona => {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.innerHTML = `
      <strong>${persona.nombre}</strong>
      <button style="background-color: ${persona.estado === 'verde' ? 'green' : 'lightgray'}" onclick="cambiarEstado('${persona.nombre}', 'verde')">🟢</button>
      <button style="background-color: ${persona.estado === 'rojo' ? 'red' : 'lightgray'}" onclick="cambiarEstado('${persona.nombre}', 'rojo')">🔴</button>
    `;
    contenedor.appendChild(div);
  });

  actualizarSecuencias();
}

function getEditoresEnVerde() {
  return estado.filter(p => p.estado === "verde").map(p => p.nombre);
}

// === Secuencias ===

let secuencias = [];

function cargarSecuencias() {
  const input = document.getElementById("inputSecuencias").value;
  const numeros = input.split(",").map(n => n.trim()).filter(n => n !== "");

  secuencias = numeros.map(n => ({ numero: n, editor: "", completada: false }));

  fetch('/secuencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(secuencias)
  }).then(() => renderSecuencias());
}

function renderSecuencias() {
  fetch('/secuencias')
    .then(res => res.json())
    .then(data => {
      secuencias = data;

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
        select.onchange = () => {
          asignarEditor(i, select.value);
        };
        tdAsignar.appendChild(select);
        row.appendChild(tdAsignar);

        // completado
        const tdCheck = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = seq.completada;
        checkbox.onchange = () => {
          actualizarCampoSecuencia(i, "completada", checkbox.checked);
        };
        tdCheck.appendChild(checkbox);
        row.appendChild(tdCheck);

        tbody.appendChild(row);
      });
    });
}

function asignarEditor(index, editor) {
  actualizarCampoSecuencia(index, "editor", editor);
  cambiarEstado(editor, "rojo");
}

function actualizarCampoSecuencia(index, campo, valor) {
  fetch('/secuencias/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, campo, valor })
  }).then(() => renderSecuencias());
}

function resetearDia() {
  fetch('/secuencias/reset', { method: 'POST' }).then(() => renderSecuencias());
}

// === Inicialización ===

window.onload = () => {
  cargarEstado();
  renderSecuencias();
};
