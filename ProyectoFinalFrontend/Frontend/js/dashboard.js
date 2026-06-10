document.addEventListener("DOMContentLoaded", function () {
    const API_RESERVAS_URL = typeof API_RESERVAS !== "undefined" ? API_RESERVAS : "http://127.0.0.1:8002";
    const API_PRODUCTOS_URL = typeof API_PRODUCTOS !== "undefined" ? API_PRODUCTOS : "http://127.0.0.1:8003";
    const API_PEDIDOS_URL = typeof API_PEDIDOS !== "undefined" ? API_PEDIDOS : "http://127.0.0.1:8004";

    const contenedor = document.querySelector("main") || document.body;

    contenedor.innerHTML = `
        <section class="seccion">
            <h1>Panel principal</h1>
            <p>Resumen general del sistema de reservas y pedidos del restaurante.</p>

            <div class="tarjetas-dashboard">
                <div class="tarjeta">
                    <h3>Mesas</h3>
                    <p id="totalMesas">Cargando...</p>
                </div>

                <div class="tarjeta">
                    <h3>Reservas</h3>
                    <p id="totalReservas">Cargando...</p>
                </div>

                <div class="tarjeta">
                    <h3>Productos</h3>
                    <p id="totalProductos">Cargando...</p>
                </div>

                <div class="tarjeta">
                    <h3>Pedidos</h3>
                    <p id="totalPedidos">Cargando...</p>
                </div>
            </div>
        </section>
    `;

    async function cargarResumenDashboard() {
        try {
            const respuestaMesas = await fetch(`${API_RESERVAS_URL}/mesas`);
            const dataMesas = await respuestaMesas.json();

            const respuestaReservas = await fetch(`${API_RESERVAS_URL}/reservas`);
            const dataReservas = await respuestaReservas.json();

            const respuestaProductos = await fetch(`${API_PRODUCTOS_URL}/productos`);
            const dataProductos = await respuestaProductos.json();

            const respuestaPedidos = await fetch(`${API_PEDIDOS_URL}/pedidos`);
            const dataPedidos = await respuestaPedidos.json();

            document.getElementById("totalMesas").textContent = dataMesas.status ? dataMesas.data.mesas.length : 0;
            document.getElementById("totalReservas").textContent = dataReservas.status ? dataReservas.data.reservas.length : 0;
            document.getElementById("totalProductos").textContent = dataProductos.status ? dataProductos.data.productos.length : 0;
            document.getElementById("totalPedidos").textContent = dataPedidos.status ? dataPedidos.data.pedidos.length : 0;
        } catch (error) {
            document.getElementById("totalMesas").textContent = "Error";
            document.getElementById("totalReservas").textContent = "Error";
            document.getElementById("totalProductos").textContent = "Error";
            document.getElementById("totalPedidos").textContent = "Error";
        }
    }

    cargarResumenDashboard();
});