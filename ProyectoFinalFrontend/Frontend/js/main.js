document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");

    const paginaActual = window.location.pathname;
    const estaEnLogin = paginaActual.includes("login.html") || paginaActual.endsWith("/");
    const estaEnPaginaInterna = paginaActual.includes("/pages/");

    if (estaEnPaginaInterna && !token) {
        window.location.href = "../login.html";
        return;
    }

    if (!estaEnPaginaInterna && token && estaEnLogin) {
        window.location.href = "pages/dashboard.html";
        return;
    }

    if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);

        const nombreUsuario = document.getElementById("nombreUsuario");
        const rolUsuario = document.getElementById("rolUsuario");

        if (nombreUsuario) {
            nombreUsuario.textContent = usuario.nombre || usuario.usuario || "Usuario";
        }

        if (rolUsuario) {
            rolUsuario.textContent = usuario.rol || "Sin rol";
        }
    }

    const botonCerrarSesion = document.getElementById("btnLogout");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", function () {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "../login.html";
        });
    }
});