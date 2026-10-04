export default function Home({ setPage }) {
  return (
    <div className="hero">
      <div class="logo">
        <img src="https://vault.monthlyteeclub.com/cdn/shop/products/CODEBUSTER_b4f89437-b333-49ec-972d-0748f73de7af_480x480.jpg?v=1656671572" alt="logo" /> 
        </div>
      <h1>¿Estresado con tu código, compa?</h1>
      <p>Comparte tu error y enseguida te tiramos paro en caliente</p>
      <button className="btn" onClick={() => setPage("create")}>
        Subir código 
      </button>
    </div>
  );
}