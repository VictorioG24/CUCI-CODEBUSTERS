
import { useState } from "react";

const API = "https://codebusters-api.onrender.com";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [content, setContent] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [comments, setComments] = useState(post.comments || []);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para editar publicaciones
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editDescription, setEditDescription] = useState(post.description || "");
  const [editCode, setEditCode] = useState(post.code || "");
  const [editLanguage, setEditLanguage] = useState(post.language || "javascript");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  const canDelete =
    role === "admin" ||
    role === "moderador" ||
    (username && username === post.user);

  const canEdit =
    role === "admin" ||
    role === "moderador" ||
    (username && username === post.user && post.user !== "Anónimo");

    const canDeleteComment = (comment) =>
  role === "admin" ||
  role === "moderador" ||
  (username && username === comment.user && comment.user !== "Anónimo");

  // Guardar cambios de la publicación
  const saveEdit = async () => {
    if (!editTitle.trim()) {
      alert("El título es obligatorio.");
      return;
    }

    if (!token || saving) return;

    try {
      setSaving(true);

      const res = await fetch(`${API}/posts/${post._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          code: editCode,
          language: editLanguage
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "No se pudo actualizar la publicación.");
        return;
      }

      alert("Publicación actualizada correctamente.");
      window.location.reload();
    } catch (error) {
      console.error("Error al editar publicación:", error);
      alert("Error de conexión al intentar editar.");
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditTitle(post.title || "");
    setEditDescription(post.description || "");
    setEditCode(post.code || "");
    setEditLanguage(post.language || "javascript");
    setEditing(false);
  };

  const deletePost = async () => {
    if (!canDelete || deleting) return;

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la publicación "${post.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const res = await fetch(`${API}/posts/${post._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.error || "No se pudo eliminar la publicación.");
        return;
      }

      alert("Publicación eliminada. Se actualizará la lista.");
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      alert("Error de conexión al intentar eliminar.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteComment = async (commentId) => {
  if (!token || deletingComment) return;

  const confirmed = window.confirm(
    "¿Seguro que quieres eliminar este comentario?"
  );

  if (!confirmed) return;

  try {
    setDeletingComment(commentId);

    const res = await fetch(
      `${API}/posts/${post._id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || "No se pudo eliminar el comentario.");
      return;
    }

    setComments(data.comments || []);
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    alert("Error de conexión al eliminar el comentario.");
  } finally {
    setDeletingComment(null);
  }
};

  const sendComment = async () => {
    if (!token) {
      alert("Debes iniciar sesión para responder.");
      return;
    }

    if (!content.trim() && !code.trim()) {
      alert("Escribe un comentario o agrega código");
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${API}/posts/${post._id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          code,
          language
        })
      });

      const updatedPost = await res.json();

      if (!res.ok) {
        alert(updatedPost.error || "Error al comentar");

        if (res.status === 401) {
          localStorage.removeItem("token");
        }

        return;
      }

      setComments(updatedPost.comments || []);
      setContent("");
      setCode("");
      setLanguage("javascript");
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card">
      {editing ? (
        <div className="edit-post-form">
          <h3>Editar publicación</h3>

          <input
            type="text"
            placeholder="Título de la publicación"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            placeholder="Descripción"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />

          <select
            value={editLanguage}
            onChange={(e) => setEditLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>

          <textarea
            className="code-editor"
            placeholder="Código"
            value={editCode}
            onChange={(e) => setEditCode(e.target.value)}
            spellCheck="false"
          />

          <div className="post-actions">
            <button
              className="btn"
              onClick={saveEdit}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <h3>{post.title}</h3>

          <p className="post-user">
            👤 {post.user || "Anónimo"}
          </p>

          {post.description && (
            <p className="post-description">
              {post.description}
            </p>
          )}

          {post.code && (
            <div className="code-container">
              <div className="code-header">
                <span>{post.language || "javascript"}</span>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(post.code)
                  }
                >
                  Copiar
                </button>
              </div>

              <pre>
                <code>{post.code}</code>
              </pre>
            </div>
          )}
        </>
      )}

      <div className="post-actions">
        {!editing && (
          <>
            <button onClick={() => setShowComments(!showComments)}>
              {comments.length} respuestas
            </button>

            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                disabled={deleting}
              >
                Editar publicación
              </button>
            )}

            {canDelete && (
              <button
                className="btn-delete"
                onClick={deletePost}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar publicación"}
              </button>
            )}
          </>
        )}
      </div>

      {!editing && showComments && (
        <div className="comments-section">
          <h4>Respuestas</h4>

          {comments.map((comment, index) => (
            <div
              className="comment"
              key={comment._id || index}
            >
              <strong>
                {comment.user || "Anónimo"}
              </strong>

              {comment.content && <p>{comment.content}</p>}

              {comment.code && (
                <div className="code-container">
                  <div className="code-header">
                    <span>{comment.language || "javascript"}</span>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(comment.code)
                      }
                    >
                      Copiar
                    </button>
                  </div>

                  <pre>
                    <code>{comment.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}

          {!token ? (
            <div className="comment-login-message">
              <p>¿Quieres participar en la conversación?</p>
              <p>Inicia sesión para publicar una respuesta.</p>
            </div>
          ) : (
            <div className="comment-form">
              <textarea
                placeholder="Escribe tu respuesta..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
              </select>

              <textarea
                className="code-editor"
                placeholder="Pega código aquí si quieres..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
              />

              <button
                className="btn"
                onClick={sendComment}
                disabled={sending}
              >
                {sending ? "Enviando..." : "Responder"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
