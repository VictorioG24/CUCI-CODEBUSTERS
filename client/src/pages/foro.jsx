import PostCard from "../dlc/postcard";
import { useEffect, useState } from "react";

export default function Foro() {

  const [posts, setPosts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetch("http://localhost:5000/posts")

      .then(res => res.json())

      .then(data => {
        setPosts(data);
        setLoading(false);
      })

      .catch(error => {
        console.log(error);
        setLoading(false);
      });

  }, []);

  return (

    <div className="container">

      <h2>Foro 👻</h2>

      {loading && (
        <p>Cargando publicaciones...</p>
      )}

      {!loading && posts.length === 0 && (
        <p>
          Todavía no hay publicaciones.
        </p>
      )}

      {posts.map(post => (

        <PostCard
          key={post._id}
          post={post}
        />

      ))}

    </div>
  );
}