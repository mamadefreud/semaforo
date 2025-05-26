function cargarSemaforos() {
  fetch('/estado')
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById('semaforos');
      contenedor.innerHTML = '';
      data.forEach(persona => {
        const boton = document.createElement('button');
        boton.textContent = persona.nombre;
        boton.style.backgroundColor = persona.estado === 'verde' ? 'green' : 'red';
        boton.onclick = () => {
          const nuevoEstado = persona.estado === 'verde' ? 'rojo' : 'verde';
          fetch('/estado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: persona.nombre, estado: nuevoEstado })
          }).then(cargarSemaforos);
        };
        contenedor.appendChild(boton);
      });

      actualizarOrden(data);
    });
}

function actualizarOrdenDisponible(estado) {
  const ordenDiv = document.getElementById('ordenDisponible');
  const disponibles = estado.filter(p => p.estado === 'verde');
  disponibles.sort((a, b) => a.timestamp - b.timestamp); // ← orden por hora
  ordenDiv.innerHTML = '<h3>Orden disponible:</h3>' +
    disponibles.map(p => `<p>${p.nombre}</p>`).join('');
}


document.getElementById('formSecuencias').addEventListener('submit', e => {
  e.preventDefault();
  const texto = document.getElementById('inputSecuencias').value.trim();
  const secuencias = texto.split('\n').map(s => s.trim()).filter(s => s);
  fetch('/secuencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secuencias })
  }).then(cargarSecuencias);
});

function cargarSecuencias() {
  fetch('/secuencias')
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById('listaSecuencias');
      contenedor.innerHTML = '';
      data.forEach((s, i) => {
        const div = document.createElement('div');
        div.innerHTML = `
          <strong>${s.nombre}</strong> —
          ${s.editor ? `Asignada a ${s.editor}` : 'Sin asignar'}
          ${s.completada ? '✅' : ''}
          <br>
          <label>Asignar a:
            <select onchange="asignarEditor(${i}, this.value)">
              <option value="">--</option>
              <option value="Mariana">Mariana</option>
              <option value="Ximena">Ximena</option>
              <option value="Mau">Mau</option>
              <option value="Héctor">Héctor</option>
              <option value="Vero">Vero</option>
            </select>
          </label>
          <label>
            <input type="checkbox" ${s.completada ? 'checked' : ''} onchange="marcarCompletada(${i}, this.checked)" />
            Completada
          </label>
          <hr>
        `;
        contenedor.appendChild(div);
      });
    });
}

function asignarEditor(index, nombre) {
  fetch('/asignar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, nombre })
  }).then(() => {
    cargarSecuencias();
    if (nombre) {
      fetch('/estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, estado: 'rojo' })
      }).then(cargarSemaforos);
    }
  });
}

function marcarCompletada(index, completada) {
  fetch('/completar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, completada })
  }).then(cargarSecuencias);
}

cargarSemaforos();
cargarSecuencias();
