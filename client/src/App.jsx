import React, { useState } from "react";

import Navbar from "./dlc/navbar";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Foro from "./pages/foro";
import CreatePost from "./pages/createpost";

export default function App() {

  const [page, setPage] = useState("home");

  const [user, setUser] = useState(null);

  return (
    <div>

      <Navbar setPage={setPage} />

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
        <Register />
      )}

      {page === "foro" && (
        <Foro />
      )}

      {page === "create" && (
        <CreatePost
          setPage={setPage}
          user={user}
        />
      )}

    </div>
  );
}