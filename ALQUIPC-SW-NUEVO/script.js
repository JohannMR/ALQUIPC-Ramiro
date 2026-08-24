// ==============================================
// ALQUIPC - Lógica de facturación de alquiler
// ==============================================

const VALOR_DIA_EQUIPO = 35000; // valor por equipo por día

// Regla de días adicionales:
// El enunciado original ofrece un 2% de descuento por cada día adicional
// solicitado, SIN límite. Eso hace que, con muchos días adicionales, el
// descuento supere el 100% y la empresa termine regalando el servicio
// (por eso la nota en rojo: "para que la empresa no quiebre").
//
// SOLUCIÓN aplicada en este programa:
// Se limita (topa) el descuento acumulado de los días adicionales a un
// máximo del 30%, sin importar cuántos días adicionales se pidan.
const DESCUENTO_POR_DIA_ADICIONAL = 0.02;
const DESCUENTO_MAXIMO_DIAS_ADICIONALES = 0.30;

const form = document.getElementById('formFactura');
const divResultado = document.getElementById('resultado');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // ---- Lectura de datos del formulario ----
  const nombre = document.getElementById('nombre').value.trim();
  const equipos = parseInt(document.getElementById('equipos').value, 10);
  const diasIniciales = parseInt(document.getElementById('dias').value, 10);
  const diasAdicionales = parseInt(document.getElementById('diasAdicionales').value, 10) || 0;
  const opcion = document.querySelector('input[name="opcion"]:checked').value;
  const correo = document.getElementById('correo').value;

  // ---- Validación del nombre ----
  if (nombre === '') {
    alert('Debes ingresar el nombre del cliente.');
    return;
  }

  // ---- Validación mínima de equipos ----
  if (equipos < 2) {
    alert('El número de equipos a alquilar debe ser mínimo 2.');
    return;
  }

  // ---- Validación de días adicionales ----
  // Los días adicionales no pueden superar los días iniciales de alquiler.
  if (diasAdicionales > diasIniciales) {
    alert('Los días adicionales (' + diasAdicionales + ') no pueden ser superiores a los días iniciales (' + diasIniciales + ').');
    return;
  }

  // ---- Generación de Id-cliente ----
  const idCliente = 'CLI-' + Math.floor(1000 + Math.random() * 9000);

  // ---- Cálculo del alquiler inicial ----
  const baseInicial = equipos * diasIniciales * VALOR_DIA_EQUIPO;
  let porcentajeAjuste = 0;
  let textoAjuste = 'Sin incremento ni descuento (dentro de la ciudad): $0';

  if (opcion === 'fuera') {
    porcentajeAjuste = 0.05;
    textoAjuste = 'Incremento del 5% por servicio a domicilio (fuera de la ciudad): +$' + formatearMoneda(baseInicial * porcentajeAjuste);
  } else if (opcion === 'establecimiento') {
    porcentajeAjuste = -0.05;
    textoAjuste = 'Descuento del 5% por alquiler dentro del establecimiento: -$' + formatearMoneda(baseInicial * Math.abs(porcentajeAjuste));
  }

  let subtotalInicial = baseInicial * (1 + porcentajeAjuste);

  // ---- Cálculo de días adicionales (con el límite de descuento) ----
  let subtotalAdicionales = 0;
  let descuentoAdicionalesTexto = 'No se solicitaron días adicionales';

  if (diasAdicionales > 0) {
    const baseAdicionales = equipos * diasAdicionales * VALOR_DIA_EQUIPO;
    let descuentoCalculado = diasAdicionales * DESCUENTO_POR_DIA_ADICIONAL;
    const descuentoAplicado = Math.min(descuentoCalculado, DESCUENTO_MAXIMO_DIAS_ADICIONALES);
    const valorDescuento = baseAdicionales * descuentoAplicado;

    subtotalAdicionales = baseAdicionales - valorDescuento;

    descuentoAdicionalesTexto = `Descuento aplicado: ${(descuentoAplicado * 100).toFixed(0)}% (-$${formatearMoneda(valorDescuento)})`;
    if (descuentoCalculado > DESCUENTO_MAXIMO_DIAS_ADICIONALES) {
      descuentoAdicionalesTexto += ' (se limitó al tope máximo del 30% para proteger la rentabilidad de la empresa)';
    }
  }

  const total = subtotalInicial + subtotalAdicionales;

  // ---- Mostrar el resultado (recibo) ----
  divResultado.classList.remove('oculto');
  divResultado.innerHTML = `
    <h2>Recibo de Alquiler</h2>
    <p><strong>Cliente:</strong> ${nombre}</p>
    <p><strong>Id-cliente:</strong> ${idCliente}</p>
    <p><strong>Opción de alquiler:</strong> ${etiquetaOpcion(opcion)}</p>
    <p><strong>Equipos alquilados:</strong> ${equipos}</p>
    <p><strong>Días iniciales:</strong> ${diasIniciales}</p>
    <p><strong>Ajuste por opción de alquiler:</strong> ${textoAjuste}</p>
    <p><strong>Días adicionales:</strong> ${diasAdicionales}</p>
    <p><strong>Descuento por días adicionales:</strong> ${descuentoAdicionalesTexto}</p>
    <p class="total">Valor total a cancelar: $${formatearMoneda(total)}</p>
    <p class="aviso">
      Este recibo se enviaría al correo <strong>${correo}</strong>.
      (En este prototipo el envío de correo es simulado; no se conecta
      a un servidor de correo real, ya que es un archivo HTML/JS local).
    </p>
  `;
});

function etiquetaOpcion(opcion) {
  if (opcion === 'ciudad') return 'Dentro de la ciudad';
  if (opcion === 'fuera') return 'Fuera de la ciudad';
  if (opcion === 'establecimiento') return 'Dentro del establecimiento';
  return opcion;
}

function formatearMoneda(valor) {
  return Math.round(valor).toLocaleString('es-CO');
}
