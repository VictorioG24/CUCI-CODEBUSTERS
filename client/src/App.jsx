
import React, { useState } from "react";

import Navbar from "./dlc/navbar";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Foro from "./pages/foro";
import CreatePost from "./pages/createpost";

export default function App() {
  const [page, setPage] = useState("home");

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (token && username) {
      return { username, role };
    }

    return null;
  });

  return (
    <div>
      <Navbar
        setPage={setPage}
        user={user}
        setUser={setUser}
      />

      {page === "home" && (
        <Home setPage={setPage} />
      )}

      {page === "login" && (
        <Login
          setUser={setUser}
          setPage={setPage}
        />
      )}

      {page === "register" && (
        <Register setPage={setPage} />
      )}

      {page === "foro" && (
        <Foro />
      )}

      {page === "create" && (
        <CreatePost setPage={setPage} />
      )}
    </div>
  );
}
