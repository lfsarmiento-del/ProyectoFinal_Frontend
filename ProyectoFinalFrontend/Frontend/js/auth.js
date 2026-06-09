document.addEventListener("DOMContentLoaded", function () {
    const formLogin = document.getElementById("formLogin");

    if (!formLogin) {
        return;
    }

    formLogin.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const mensaje = document.getElementById("mensaje");

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
                localStorage.setItem("token", data.token || "token_temporal");
                localStorage.setItem("usuario", JSON.stringify(data.usuario || { usuario }));

                window.location.href = "pages/dashboard.html";
            } else {
                mensaje.textContent = data.message || "Credenciales incorrectas.";
            }
        } catch (error) {
            mensaje.textContent = "No fue posible conectar con el servidor.";
        }
    });
});