document.addEventListener("DOMContentLoaded", function () {
    const API_PRODUCTOS_URL = typeof API_PRODUCTOS !== "undefined" ? API_PRODUCTOS : "http://127.0.0.1:8003";

    const contenedor = document.querySelector("main") || document.body;

    contenedor.innerHTML = `
        <section class="seccion">
            <h1>Gestión de Productos</h1>

            <form id="formProducto" class="formulario">
                <input type="text" id="nombre" placeholder="Nombre del producto" required>
                <input type="text" id="descripcion" placeholder="Descripción del producto" required>
                <input type="number" id="precio" placeholder="Precio" min="1" required>

                <select id="categoria_id" required>
                    <option value="">Seleccione una categoría</option>
                </select>

                <select id="disponible" required>
                    <option value="true">Disponible</option>
                    <option value="false">No disponible</option>
                </select>

                <button type="submit">Registrar producto</button>
            </form>

            <p id="mensajeProducto"></p>

            <table class="tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Categoría</th>
                        <th>Disponible</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody id="tablaProductos"></tbody>
            </table>
        </section>
    `;

    const formProducto = document.getElementById("formProducto");
    const tablaProductos = document.getElementById("tablaProductos");
    const selectCategoria = document.getElementById("categoria_id");
    const mensajeProducto = document.getElementById("mensajeProducto");

    async function cargarCategorias() {
        try {
            const respuesta = await fetch(`${API_PRODUCTOS_URL}/categorias`);
            const data = await respuesta.json();

            selectCategoria.innerHTML = `<option value="">Seleccione una categoría</option>`;

            if (data.status && data.data.categorias) {
                data.data.categorias.forEach(function (categoria) {
                    selectCategoria.innerHTML += `
                        <option value="${categoria.id}">
                            ${categoria.nombre}
                        </option>
                    `;
                });
            }
        } catch (error) {
            mensajeProducto.textContent = "Error al cargar las categorías.";
        }
    }

    async function cargarProductos() {
        try {
            const respuesta = await fetch(`${API_PRODUCTOS_URL}/productos`);
            const data = await respuesta.json();

            tablaProductos.innerHTML = "";

            if (data.status && data.data.productos) {
                data.data.productos.forEach(function (producto) {
                    tablaProductos.innerHTML += `
                        <tr>
                            <td>${producto.id}</td>
                            <td>${producto.nombre}</td>
                            <td>${producto.descripcion}</td>
                            <td>$${Number(producto.precio).toLocaleString("es-CO")}</td>
                            <td>${producto.categoria_id}</td>
                            <td>${producto.disponible ? "Sí" : "No"}</td>
                            <td>
                                <button class="btnEliminarProducto" data-id="${producto.id}">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
        } catch (error) {
            mensajeProducto.textContent = "Error al cargar los productos.";
        }
    }

    formProducto.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nuevoProducto = {
            nombre: document.getElementById("nombre").value.trim(),
            descripcion: document.getElementById("descripcion").value.trim(),
            precio: Number(document.getElementById("precio").value),
            categoria_id: Number(document.getElementById("categoria_id").value),
            disponible: document.getElementById("disponible").value === "true"
        };

        try {
            const respuesta = await fetch(`${API_PRODUCTOS_URL}/productos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(nuevoProducto)
            });

            const data = await respuesta.json();

            if (data.status) {
                mensajeProducto.textContent = "Producto registrado correctamente.";
                formProducto.reset();
                cargarProductos();
            } else {
                mensajeProducto.textContent = data.message;
            }
        } catch (error) {
            mensajeProducto.textContent = "Error al registrar el producto.";
        }
    });

    tablaProductos.addEventListener("click", async function (event) {
        if (event.target.classList.contains("btnEliminarProducto")) {
            const id = event.target.getAttribute("data-id");

            try {
                const respuesta = await fetch(`${API_PRODUCTOS_URL}/productos/${id}`, {
                    method: "DELETE"
                });

                const data = await respuesta.json();

                if (data.status) {
                    mensajeProducto.textContent = "Producto eliminado correctamente.";
                    cargarProductos();
                } else {
                    mensajeProducto.textContent = data.message;
                }
            } catch (error) {
                mensajeProducto.textContent = "Error al eliminar el producto.";
            }
        }
    });

    cargarCategorias();
    cargarProductos();
});