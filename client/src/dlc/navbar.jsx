
export default function Navbar({ setPage, user, setUser }) {
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    setUser(null);
    setPage("home");
  };

  return (
    <nav>
      <h2
        onClick={() => setPage("home")}
        style={{ cursor: "pointer" }}
      >
        CUCI FORO
      </h2>

      <button onClick={() => setPage("home")}>
        Inicio
      </button>

      <button onClick={() => setPage("foro")}>
        Foro
      </button>

      {user ? (
        <>
          <span>
            Hola, {user.username}
          </span>
	{(user?.role === "admin" ||
  localStorage.getItem("role") === "admin") && (
  <button onClick={() => setPage("admin")}>
    Administrar usuarios
  </button>
		)
	}

          <button onClick={() => setPage("create")}>
            Crear publicación
          </button>

          <button onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <button onClick={() => setPage("register")}>
            Registro
          </button>

          <button onClick={() => setPage("login")}>
            Iniciar sesión
          </button>
          
        </>
      )}
    </nav>
  );
}
