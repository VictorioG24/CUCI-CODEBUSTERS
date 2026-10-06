import React, { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const res = await fetch("https://codebusters-api.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("Usuario creado exitosamente");
      } else {
        alert(data.error);
      }

    } catch (error) {
      console.log(error);
      alert("Error de conexión");
    }
  };

  return (
    <div>
      <h2>Registro</h2>

      <input
        placeholder="Username"
        onChange={e => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={register}>Registrarse</button>
    </div>
  );
}
