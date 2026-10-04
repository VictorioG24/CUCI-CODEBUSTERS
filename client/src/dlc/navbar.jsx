export default function Navbar({ setPage }) {
  return (
    <nav>
      <h2 onClick={() => setPage("home")}>CUCI FORO</h2>
      

      <button onClick={() => setPage("foro")}>Foro</button>
      <button onClick={() => setPage("register")}>Registro</button>
      <button onClick={() => setPage("login")}>Login</button>
    </nav>
  );
}