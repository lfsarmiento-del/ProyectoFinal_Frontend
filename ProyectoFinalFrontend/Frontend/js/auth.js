document.addEventListener("DOMContentLoaded", function () {
    const formLogin = document.getElementById("formLogin");
    const mensaje = document.getElementById("mensaje");

    if (!formLogin) {
        return;
    }

    formLogin.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();

        mensaje.textContent = "";

        if (!usuario || !contrasena) {
            mensaje.textContent = "Debe ingresar usuario y contraseña.";
            return;
        }

        try {
            const respuesta = await fetch(`${API_AUTH}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario: usuario,
                    contrasena: contrasena
                })
            });

            const data = await respuesta.json();

            if (data.status) {
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("usuario", JSON.stringify(data.data.usuario));

                window.location.href = "pages/dashboard.html";
            } else {
                mensaje.textContent = data.message;
            }
        } catch (error) {
            mensaje.textContent = "No se pudo conectar con el servidor de autenticación.";
        }
    });
});