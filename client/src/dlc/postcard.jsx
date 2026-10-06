import { useState } from "react";

export default function PostCard({ post }) {

  const [showComments, setShowComments] =
    useState(false);

  const [content, setContent] =
    useState("");

  const [code, setCode] =
    useState("");

  const [language, setLanguage] =
    useState("javascript");

  const [comments, setComments] =
    useState(post.comments || []);

  const sendComment = async () => {

    if (!content.trim() && !code.trim()) {
      alert("Escribe un comentario o agrega código");
      return;
    }

    try {

      const res = await fetch(
        `https://codebusters-api.onrender.com/posts/${post._id}/comments`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            content,
            code,
            language,
            user: "Anónimo"
          })
        }
      );

      const updatedPost = await res.json();

      if (!res.ok) {
        alert(
          updatedPost.error ||
          "Error al comentar"
        );
        return;
      }

      setComments(updatedPost.comments);

      setContent("");
      setCode("");

    } catch (error) {

      console.log(error);

      alert("Error de conexión");

    }
  };

  return (

    <div className="card">

      <h3>
        {post.title}
      </h3>

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

            <span>
              {post.language || "javascript"}
            </span>

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  post.code
                )
              }
            >
              Copiar
            </button>

          </div>

          <pre>
            <code>
              {post.code}
            </code>
          </pre>

        </div>
      )}

      <div className="post-actions">

        <button
          onClick={() =>
            setShowComments(!showComments)
          }
        >
          {comments.length} respuestas
        </button>

      </div>

      {showComments && (

        <div className="comments-section">

          <h4>
            Respuestas
          </h4>

          {comments.map((comment, index) => (

            <div
              className="comment"
              key={comment._id || index}
            >

              <strong>
                👤 {comment.user || "Anónimo"}
              </strong>

              {comment.content && (
                <p>
                  {comment.content}
                </p>
              )}

              {comment.code && (

                <div className="code-container">

                  <div className="code-header">

                    <span>
                      {comment.language ||
                        "javascript"}
                    </span>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          comment.code
                        )
                      }
                    >
                      Copiar
                    </button>

                  </div>

                  <pre>
                    <code>
                      {comment.code}
                    </code>
                  </pre>

                </div>

              )}

            </div>

          ))}

          <div className="comment-form">

            <textarea
              placeholder="Escribe tu respuesta..."
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
            />

            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
            >

              <option value="javascript">
                JavaScript
              </option>

              <option value="python">
                Python
              </option>

              <option value="java">
                Java
              </option>

              <option value="cpp">
                C++
              </option>

              <option value="html">
                HTML
              </option>

              <option value="css">
                CSS
              </option>

              <option value="sql">
                SQL
              </option>

            </select>

            <textarea
              className="code-editor"
              placeholder="Pega código aquí si quieres..."
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              spellCheck="false"
            />

            <button
              className="btn"
              onClick={sendComment}
            >
              Responder
            </button>

          </div>

        </div>

      )}

    </div>
  );
}
