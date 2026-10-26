
import React, { useState } from "react";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!username.trim() || !password) {
      alert("Ingresa tu usuario y contraseña");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://codebusters-api.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: username.trim(),
            password
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo iniciar sesión");
        return;
      }

      if (!data.token) {
        alert("El servidor no devolvió un token válido");
        return;
      }

      const loggedUser = {
        username: data.username || username.trim(),
        role: data.role || "usuario"
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", loggedUser.username);
      localStorage.setItem("role", loggedUser.role);

      setUser(loggedUser);

      alert("¡Bienvenido a CodeBusters!");
      setPage("foro");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>

      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        autoComplete="username"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            login();
          }
        }}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </div>
  );
}
