document.addEventListener("DOMContentLoaded", function () {
    const API_RESERVAS_URL = typeof API_RESERVAS !== "undefined" ? API_RESERVAS : "http://127.0.0.1:8002";

    const contenedor = document.querySelector("main") || document.body;
    let reservaEditandoId = null;

    contenedor.innerHTML = `
        <section class="seccion">
            <h1>Gestión de Reservas</h1>

            <form id="formReserva" class="formulario">
                <input type="text" id="nombre_cliente" placeholder="Nombre del cliente" required>
                <input type="text" id="telefono_cliente" placeholder="Teléfono del cliente" required>
                <input type="number" id="cantidad_personas" placeholder="Cantidad de personas" min="1" required>
                <input type="date" id="fecha" required>
                <input type="time" id="hora" required>

                <select id="mesa_id" required>
                    <option value="">Seleccione una mesa</option>
                </select>

                <select id="estado_reserva" required>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="finalizada">Finalizada</option>
                </select>

                <textarea id="observaciones" placeholder="Observaciones"></textarea>

                <button type="submit" id="btnGuardarReserva">Registrar reserva</button>
                <button type="button" id="btnCancelarEdicionReserva" style="display:none;">Cancelar edición</button>
            </form>

            <p id="mensajeReserva"></p>

            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Personas</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Mesa</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaReservas"></tbody>
            </table>
        </section>
    `;

    const formReserva = document.getElementById("formReserva");
    const tablaReservas = document.getElementById("tablaReservas");
    const selectMesa = document.getElementById("mesa_id");
    const mensajeReserva = document.getElementById("mensajeReserva");
    const btnGuardarReserva = document.getElementById("btnGuardarReserva");
    const btnCancelarEdicionReserva = document.getElementById("btnCancelarEdicionReserva");

    async function cargarMesas() {
        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/mesas`);
            const data = await respuesta.json();

            selectMesa.innerHTML = `<option value="">Seleccione una mesa</option>`;

            if (data.status && data.data.mesas) {
                data.data.mesas.forEach(function (mesa) {
                    if (mesa.estado !== "fuera_servicio") {
                        selectMesa.innerHTML += `
                            <option value="${mesa.id}">
                                Mesa ${mesa.numero} - Capacidad ${mesa.capacidad}
                            </option>
                        `;
                    }
                });
            }
        } catch (error) {
            mensajeReserva.textContent = "Error al cargar las mesas.";
        }
    }

    async function cargarReservas() {
        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/reservas`);
            const data = await respuesta.json();

            tablaReservas.innerHTML = "";

            if (data.status && data.data.reservas) {
                data.data.reservas.forEach(function (reserva) {
                    tablaReservas.innerHTML += `
                        <tr>
                            <td>${reserva.id}</td>
                            <td>${reserva.nombre_cliente}</td>
                            <td>${reserva.telefono_cliente}</td>
                            <td>${reserva.cantidad_personas}</td>
                            <td>${reserva.fecha}</td>
                            <td>${reserva.hora}</td>
                            <td>${reserva.mesa_id}</td>
                            <td>${reserva.estado}</td>
                            <td>
                                <button class="btnEditarReserva"
                                    data-id="${reserva.id}"
                                    data-nombre="${reserva.nombre_cliente}"
                                    data-telefono="${reserva.telefono_cliente}"
                                    data-personas="${reserva.cantidad_personas}"
                                    data-fecha="${reserva.fecha}"
                                    data-hora="${reserva.hora}"
                                    data-mesa="${reserva.mesa_id}"
                                    data-estado="${reserva.estado}"
                                    data-observaciones="${reserva.observaciones || ""}">
                                    Editar
                                </button>

                                <button class="btnCancelarReserva" data-id="${reserva.id}">
                                    Cancelar
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            mensajeReserva.textContent = "Error al cargar las reservas.";
        }
    }

    formReserva.addEventListener("submit", async function (event) {
        event.preventDefault();

        const reserva = {
            nombre_cliente: document.getElementById("nombre_cliente").value.trim(),
            telefono_cliente: document.getElementById("telefono_cliente").value.trim(),
            cantidad_personas: Number(document.getElementById("cantidad_personas").value),
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            mesa_id: Number(document.getElementById("mesa_id").value),
            observaciones: document.getElementById("observaciones").value.trim(),
            estado: document.getElementById("estado_reserva").value
        };

        const url = reservaEditandoId
            ? `${API_RESERVAS_URL}/reservas/${reservaEditandoId}`
            : `${API_RESERVAS_URL}/reservas`;

        const metodo = reservaEditandoId ? "PUT" : "POST";

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(reserva)
            });

            const data = await respuesta.json();

            if (data.status) {
                mensajeReserva.textContent = reservaEditandoId
                    ? "Reserva actualizada correctamente."
                    : "Reserva registrada correctamente.";

                limpiarFormularioReserva();
                cargarReservas();
            } else {
                mensajeReserva.textContent = data.message;
            }
        } catch (error) {
            mensajeReserva.textContent = "Error al guardar la reserva.";
        }
    });

    tablaReservas.addEventListener("click", async function (event) {
        if (event.target.classList.contains("btnEditarReserva")) {
            reservaEditandoId = event.target.getAttribute("data-id");

            document.getElementById("nombre_cliente").value = event.target.getAttribute("data-nombre");
            document.getElementById("telefono_cliente").value = event.target.getAttribute("data-telefono");
            document.getElementById("cantidad_personas").value = event.target.getAttribute("data-personas");
            document.getElementById("fecha").value = event.target.getAttribute("data-fecha");
            document.getElementById("hora").value = event.target.getAttribute("data-hora");
            document.getElementById("mesa_id").value = event.target.getAttribute("data-mesa");
            document.getElementById("estado_reserva").value = event.target.getAttribute("data-estado");
            document.getElementById("observaciones").value = event.target.getAttribute("data-observaciones");

            btnGuardarReserva.textContent = "Actualizar reserva";
            btnCancelarEdicionReserva.style.display = "inline-block";
            mensajeReserva.textContent = "Editando reserva seleccionada.";
        }

        if (event.target.classList.contains("btnCancelarReserva")) {
            const id = event.target.getAttribute("data-id");

            try {
                const respuesta = await fetch(`${API_RESERVAS_URL}/reservas/${id}/cancelar`, {
                    method: "PATCH"
                });

                const data = await respuesta.json();

                if (data.status) {
                    mensajeReserva.textContent = "Reserva cancelada correctamente.";
                    cargarReservas();
                } else {
                    mensajeReserva.textContent = data.message;
                }
            } catch (error) {
                mensajeReserva.textContent = "Error al cancelar la reserva.";
            }
        }
    });

    btnCancelarEdicionReserva.addEventListener("click", limpiarFormularioReserva);

    function limpiarFormularioReserva() {
        reservaEditandoId = null;
        formReserva.reset();
        btnGuardarReserva.textContent = "Registrar reserva";
        btnCancelarEdicionReserva.style.display = "none";
    }

    cargarMesas();
    cargarReservas();
});