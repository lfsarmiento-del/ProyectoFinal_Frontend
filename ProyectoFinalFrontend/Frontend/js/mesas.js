document.addEventListener("DOMContentLoaded", function () {
    const API_RESERVAS_URL = typeof API_RESERVAS !== "undefined" ? API_RESERVAS : "http://127.0.0.1:8002";

    const contenedor = document.querySelector("main") || document.body;

    contenedor.innerHTML = `
        <section class="seccion">
            <h1>Gestión de Mesas</h1>

            <form id="formMesa" class="formulario">
                <input type="text" id="numero" placeholder="Número de mesa" required>
                <input type="number" id="capacidad" placeholder="Capacidad" min="1" required>

                <select id="estado" required>
                    <option value="disponible">Disponible</option>
                    <option value="reservada">Reservada</option>
                    <option value="ocupada">Ocupada</option>
                    <option value="fuera_servicio">Fuera de servicio</option>
                </select>

                <button type="submit">Registrar mesa</button>
            </form>

            <p id="mensajeMesa"></p>

            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Número</th>
                        <th>Capacidad</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaMesas"></tbody>
            </table>
        </section>
    `;

    const formMesa = document.getElementById("formMesa");
    const tablaMesas = document.getElementById("tablaMesas");
    const mensajeMesa = document.getElementById("mensajeMesa");

    async function cargarMesas() {
        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/mesas`);
            const data = await respuesta.json();

            tablaMesas.innerHTML = "";

            if (data.status && data.data.mesas) {
                data.data.mesas.forEach(function (mesa) {
                    tablaMesas.innerHTML += `
                        <tr>
                            <td>${mesa.id}</td>
                            <td>${mesa.numero}</td>
                            <td>${mesa.capacidad}</td>
                            <td>${mesa.estado}</td>
                            <td>
                                <button class="btnEliminarMesa" data-id="${mesa.id}">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            mensajeMesa.textContent = "Error al cargar las mesas.";
        }
    }

    formMesa.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nuevaMesa = {
            numero: document.getElementById("numero").value.trim(),
            capacidad: Number(document.getElementById("capacidad").value),
            estado: document.getElementById("estado").value
        };

        try {
            const respuesta = await fetch(`${API_RESERVAS_URL}/mesas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevaMesa)
            });

            const data = await respuesta.json();

            if (data.status) {
                mensajeMesa.textContent = "Mesa registrada correctamente.";
                formMesa.reset();
                cargarMesas();
            } else {
                mensajeMesa.textContent = data.message;
            }
        } catch (error) {
            mensajeMesa.textContent = "Error al registrar la mesa.";
        }
    });

    tablaMesas.addEventListener("click", async function (event) {
        if (event.target.classList.contains("btnEliminarMesa")) {
            const id = event.target.getAttribute("data-id");

            try {
                const respuesta = await fetch(`${API_RESERVAS_URL}/mesas/${id}`, {
                    method: "DELETE"
                });

                const data = await respuesta.json();

                if (data.status) {
                    mensajeMesa.textContent = "Mesa eliminada correctamente.";
                    cargarMesas();
                } else {
                    mensajeMesa.textContent = data.message;
                }
            } catch (error) {
                mensajeMesa.textContent = "Error al eliminar la mesa.";
            }
        }
    });

    cargarMesas();
});