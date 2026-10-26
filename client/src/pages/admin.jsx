
import { useEffect, useState } from "react";

const API = "https://codebusters-api.onrender.com";

const ROLES = ["usuario", "tester", "moderador", "admin"];

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  const cargarUsuarios = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron consultar los usuarios");
      }

      setUsers(data);
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cambiarRol = async (id, role) => {
    setError("");
    setMessage("");
    setSavingId(id);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo cambiar el rol");
      }

      setUsers((actuales) =>
        actuales.map((user) =>
          user._id === id ? { ...user, role: data.user.role } : user
        )
      );

      setMessage(`El rol de ${data.user.username} se actualizó correctamente.`);
    } catch (err) {
      setError(err.message || "Error al cambiar el rol");
    } finally {
      setSavingId("");
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: 20 }}>
      <h1>Administración de usuarios</h1>
      <p>Consulta las cuentas registradas y administra sus permisos.</p>

      {error && (
        <p role="alert" style={{ color: "#c62828" }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "#16803d" }}>
          {message}
        </p>
      )}

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : users.length === 0 && !error ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
                  Usuario
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
                  Rol actual
                </th>
                <th style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
                  Cambiar rol
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
                    {user.username}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
                    {user.role}
                  </td>

                  <td style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
                    <select
                      value={user.role}
                      disabled={savingId === user._id}
                      onChange={(e) => cambiarRol(user._id, e.target.value)}
                      aria-label={`Cambiar rol de ${user.username}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    {savingId === user._id && <span> Guardando...</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
