function verificarSesion() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "../login.html";
    }
}

function obtenerToken() {
    return localStorage.getItem("token");
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "../login.html";
}

function navegarA(ruta) {
    window.location.href = ruta;
}