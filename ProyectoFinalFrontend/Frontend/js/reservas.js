document.addEventListener("DOMContentLoaded", function () {
    const API_RESERVAS_URL = typeof API_RESERVAS !== "undefined" ? API_RESERVAS : "http://127.0.0.1:8002";

    const contenedor = document.querySelector("main") || document.body;

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

                <textarea id="observaciones" placeholder="Observaciones"></textarea>

                <button type="submit">Registrar reserva</button>
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
                        <th>Acción</th>
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

    async function cargarMesas() {
        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/mesas`);
            const data = await respuesta.json();

            selectMesa.innerHTML = `<option value="">Seleccione una mesa</option>`;

            if (data.status && data.data.mesas) {
                data.data.mesas.forEach(function (mesa) {
                    if (mesa.estado === "disponible") {
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

        const nuevaReserva = {
            nombre_cliente: document.getElementById("nombre_cliente").value.trim(),
            telefono_cliente: document.getElementById("telefono_cliente").value.trim(),
            cantidad_personas: Number(document.getElementById("cantidad_personas").value),
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            mesa_id: Number(document.getElementById("mesa_id").value),
            observaciones: document.getElementById("observaciones").value.trim(),
            estado: "pendiente"
        };

        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/reservas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevaReserva)
            });

            const data = await respuesta.json();

            if (data.status) {
                mensajeReserva.textContent = "Reserva registrada correctamente.";
                formReserva.reset();
                cargarMesas();
                cargarReservas();
            } else {
                mensajeReserva.textContent = data.message;
            }
        } catch (error) {
            mensajeReserva.textContent = "Error al registrar la reserva.";
        }
    });

    tablaReservas.addEventListener("click", async function (event) {
        if (event.target.classList.contains("btnCancelarReserva")) {
            const id = event.target.getAttribute("data-id");

            try {
                const respuesta = await fetch(`${API_RESERVAS_URL}/reservas/${id}/cancelar`, {
                    method: "PATCH"
                });

                const data = await respuesta.json();

                if (data.status) {
                    mensajeReserva.textContent = "Reserva cancelada correctamente.";
                    cargarMesas();
                    cargarReservas();
                } else {
                    mensajeReserva.textContent = data.message;
                }
            } catch (error) {
                mensajeReserva.textContent = "Error al cancelar la reserva.";
            }
        }
    });

    cargarMesas();
    cargarReservas();
});