
import React, { useState } from "react";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    const nombre = username.trim();

    if (!nombre || !password.trim()) {
      alert("Completa el usuario y la contraseña.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://codebusters-api.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: nombre,
            password
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo crear la cuenta.");
        return;
      }

      alert("¡Cuenta creada! Ahora inicia sesión.");
      setPage("login");
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Registro</h2>

      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        type="password"
        placeholder="Contraseña (mínimo 6 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !loading) {
            register();
          }
        }}
      />

      <button onClick={register} disabled={loading}>
        {loading ? "Creando cuenta..." : "Registrarse"}
      </button>
    </div>
  );
}
