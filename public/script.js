document.addEventListener('DOMContentLoaded', () => {
  const nombres = ['Mariana', 'Ximena', 'Mau', 'Héctor', 'Vero'];
  const semaforosDiv = document.getElementById('semaforos');
  const ordenDisponibleDiv = document.getElementById('ordenDisponible');
  const listaSecuenciasDiv = document.getElementById('listaSecuencias');

  let estado = [];

  function cargarEstado() {
    fetch('/estado')
      .then(res => res.json())
      .then(data => {
        estado = data;
        renderSemaforos();
        actualizarOrdenDisponible();
        cargarSecuencias();
      });
  }

  function renderSemaforos() {
    semaforosDiv.innerHTML = '';
    estado.forEach(persona => {
      const btn = document.createElement('button');
      btn.textContent = persona.nombre;
      btn.style.backgroundColor = persona.estado === 'verde' ? 'green' : 'red';
      btn.addEventListener('click', () => {
        const nuevoEstado = persona.estado === 'verde' ? 'rojo' : 'verde';
        fetch('/estado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: persona.nombre, estado: nuevoEstado })
        }).then(() => cargarEstado());
      });
      semaforosDiv.appendChild(btn);
    });
  }

  function actualizarOrdenDisponible() {
    const disponibles = estado
      .filter(p => p.estado === 'verde')
      .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    ordenDisponibleDiv.innerHTML = '<h3>Orden disponible:</h3>' +
      (disponibles.length > 0
        ? disponibles.map(p => `<p>${p.nombre}</p>`).join('')
        : '<p><em>No hay nadie disponible.</em></p>');
  }

  // Secuencias

  document.getElementById('formSecuencias').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('inputSecuencias').value.trim();
    if (!input) return;
    const secuencias = input.split(',').map(s => s.trim()).filter(Boolean);
    fetch('/secuencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secuencias })
    }).then(() => {
      document.getElementById('inputSecuencias').value = '';
      cargarSecuencias();
    });
  });

  function cargarSecuencias() {
    fetch('/secuencias')
      .then(res => res.json())
      .then(secuencias => {
        listaSecuenciasDiv.innerHTML = '';
        secuencias.forEach((seq, index) => {
          const div = document.createElement('div');

          const label = document.createElement('span');
          label.textContent = `Secuencia ${seq.nombre}`;

          const select = document.createElement('select');
          const optionDefault = document.createElement('option');
          optionDefault.textContent = '-- Asignar editor --';
          optionDefault.disabled = true;
          optionDefault.selected = !seq.editor;
          select.appendChild(optionDefault);

          estado.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nombre;
            opt.textContent = p.nombre;
            if (seq.editor === p.nombre) opt.selected = true;
            select.appendChild(opt);
          });

          select.addEventListener('change', () => {
            fetch('/asignar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index, nombre: select.value })
            }).then(() => cargarEstado());
          });

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = seq.completada;
          checkbox.addEventListener('change', () => {
            fetch('/completar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ index, completada: checkbox.checked })
            });
          });

          div.appendChild(label);
          div.appendChild(select);
          div.appendChild(checkbox);
          listaSecuenciasDiv.appendChild(div);
        });
      });
  }

  cargarEstado();
});
