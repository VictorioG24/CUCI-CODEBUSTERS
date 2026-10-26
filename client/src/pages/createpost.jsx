
import { useState } from "react";

export default function CreatePost({ setPage }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para publicar código.");
      setPage("login");
      return;
    }

    if (!title.trim()) {
      alert("Escribe un título");
      return;
    }

    if (!code.trim()) {
      alert("Agrega el código");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://codebusters-api.onrender.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description,
            code,
            language
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          alert("Tu sesión venció. Inicia sesión nuevamente.");
          setPage("login");
          return;
        }

        alert(data.error || "Error al publicar");
        return;
      }

      alert("¡Publicación creada!");
      setPage("foro");

    } catch (error) {
      console.error(error);
      alert("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Subir código</h2>

      <input
        type="text"
        placeholder="Título de tu publicación"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Explica cuál es tu problema..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C++</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="sql">SQL</option>
        <option value="php">PHP</option>
      </select>

      <textarea
        className="code-editor"
        placeholder="Pega aquí tu código..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck="false"
      />

      <button
        className="btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Publicando..." : "Publicar código"}
      </button>
    </div>
  );
}
