document.addEventListener("DOMContentLoaded", function () {
    const API_PEDIDOS_URL = typeof API_PEDIDOS !== "undefined" ? API_PEDIDOS : "http://127.0.0.1:8004";
    const API_PRODUCTOS_URL = typeof API_PRODUCTOS !== "undefined" ? API_PRODUCTOS : "http://127.0.0.1:8003";

    const contenedor = document.querySelector("main") || document.body;
    let productosDisponibles = [];
    let detallePedido = [];

    contenedor.innerHTML = `
        <section class="seccion">
            <h1>Gestión de Pedidos</h1>

            <form id="formPedido" class="formulario">
                <input type="number" id="mesa_id" placeholder="ID de la mesa" min="1" required>

                <select id="producto_id" required>
                    <option value="">Seleccione un producto</option>
                </select>

                <input type="number" id="cantidad" placeholder="Cantidad" min="1" value="1" required>

                <button type="button" id="btnAgregarProducto">Agregar producto</button>
                <button type="submit">Registrar pedido</button>
            </form>

            <p id="mensajePedido"></p>

            <h2>Detalle del pedido</h2>

            <table class="tabla">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody id="tablaDetallePedido"></tbody>
            </table>

            <h3 id="totalPedido">Total: $0</h3>

            <h2>Pedidos registrados</h2>

            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mesa</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaPedidos"></tbody>
            </table>
        </section>
    `;

    const formPedido = document.getElementById("formPedido");
    const selectProducto = document.getElementById("producto_id");
    const tablaDetallePedido = document.getElementById("tablaDetallePedido");
    const tablaPedidos = document.getElementById("tablaPedidos");
    const mensajePedido = document.getElementById("mensajePedido");
    const totalPedido = document.getElementById("totalPedido");
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");

    async function cargarProductos() {
        try {
            const respuesta = await fetch(`${API_PRODUCTOS_URL}/productos/disponibles`);
            const data = await respuesta.json();

            selectProducto.innerHTML = `<option value="">Seleccione un producto</option>`;

            if (data.status && data.data.productos) {
                productosDisponibles = data.data.productos;

                productosDisponibles.forEach(function (producto) {
                    selectProducto.innerHTML += `
                        <option value="${producto.id}">
                            ${producto.nombre} - $${Number(producto.precio).toLocaleString("es-CO")}
                        </option>
                    `;
                });
            }
        } catch (error) {
            mensajePedido.textContent = "Error al cargar los productos.";
        }
    }

    async function cargarPedidos() {
        try {
            const respuesta = await fetch(`${API_PEDIDOS_URL}/pedidos`);
            const data = await respuesta.json();

            tablaPedidos.innerHTML = "";

            if (data.status && data.data.pedidos) {
                data.data.pedidos.forEach(function (pedido) {
                    tablaPedidos.innerHTML += `
                        <tr>
                            <td>${pedido.id}</td>
                            <td>${pedido.mesa_id}</td>
                            <td>${pedido.fecha}</td>
                            <td>${pedido.hora}</td>
                            <td>$${Number(pedido.total).toLocaleString("es-CO")}</td>
                            <td>${pedido.estado}</td>
                            <td>
                                <button class="btnEliminarPedido" data-id="${pedido.id}">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            mensajePedido.textContent = "Error al cargar los pedidos.";
        }
    }

    function actualizarDetallePedido() {
        let total = 0;
        tablaDetallePedido.innerHTML = "";

        detallePedido.forEach(function (item) {
            total += item.subtotal;

            tablaDetallePedido.innerHTML += `
                <tr>
                    <td>${item.nombre_producto}</td>
                    <td>${item.cantidad}</td>
                    <td>$${Number(item.precio_unitario).toLocaleString("es-CO")}</td>
                    <td>$${Number(item.subtotal).toLocaleString("es-CO")}</td>
                </tr>
            `;
        });

        totalPedido.textContent = `Total: $${Number(total).toLocaleString("es-CO")}`;
    }

    btnAgregarProducto.addEventListener("click", function () {
        const productoId = Number(selectProducto.value);
        const cantidad = Number(document.getElementById("cantidad").value);

        if (!productoId || cantidad < 1) {
            mensajePedido.textContent = "Seleccione un producto y una cantidad válida.";
            return;
        }

        const producto = productosDisponibles.find(function (item) {
            return Number(item.id) === productoId;
        });

        if (!producto) {
            mensajePedido.textContent = "Producto no encontrado.";
            return;
        }

        const subtotal = Number(producto.precio) * cantidad;

        detallePedido.push({
            producto_id: producto.id,
            nombre_producto: producto.nombre,
            cantidad: cantidad,
            precio_unitario: Number(producto.precio),
            subtotal: subtotal
        });

        mensajePedido.textContent = "Producto agregado al pedido.";
        actualizarDetallePedido();
    });

    formPedido.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (detallePedido.length === 0) {
            mensajePedido.textContent = "Debe agregar al menos un producto al pedido.";
            return;
        }

        const fechaActual = new Date();
        const fecha = fechaActual.toISOString().split("T")[0];
        const hora = fechaActual.toTimeString().split(" ")[0];

        const nuevoPedido = {
            mesa_id: Number(document.getElementById("mesa_id").value),
            fecha: fecha,
            hora: hora,
            estado: "pendiente",
            productos: detallePedido
        };

        try {
            const respuesta = await fetch(`${API_PEDIDOS_URL}/pedidos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoPedido)
            });

            const data = await respuesta.json();

            if (data.status) {
                mensajePedido.textContent = "Pedido registrado correctamente.";
                formPedido.reset();
                detallePedido = [];
                actualizarDetallePedido();
                cargarPedidos();
            } else {
                mensajePedido.textContent = data.message;
            }
        } catch (error) {
            mensajePedido.textContent = "Error al registrar el pedido.";
        }
    });

    tablaPedidos.addEventListener("click", async function (event) {
        if (event.target.classList.contains("btnEliminarPedido")) {
            const id = event.target.getAttribute("data-id");

            try {
                const respuesta = await fetch(`${API_PEDIDOS_URL}/pedidos/${id}`, {
                    method: "DELETE"
                });

                const data = await respuesta.json();

                if (data.status) {
                    mensajePedido.textContent = "Pedido eliminado correctamente.";
                    cargarPedidos();
                } else {
                    mensajePedido.textContent = data.message;
                }
            } catch (error) {
                mensajePedido.textContent = "Error al eliminar el pedido.";
            }
        }
    });

    cargarProductos();
    cargarPedidos();
});