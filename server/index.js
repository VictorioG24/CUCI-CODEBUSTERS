const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// CONEXIÓN

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado"))
  .catch(err => console.log(err));

// MODCOMENT

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ""
  },

  code: {
    type: String,
    default: ""
  },

  language: {
    type: String,
    default: "javascript"
  },

  user: {
    type: String,
    default: "Anónimo"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  code: {
    type: String,
    default: ""
  },

  language: {
    type: String,
    default: "javascript"
  },

  user: {
    type: String,
    default: "Anónimo"
  },

  likes: {
    type: Number,
    default: 0
  },

  comments: {
    type: [commentSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model("Post", postSchema);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["usuario", "tester", "moderador", "admin"],
    default: "usuario"
  }
});

const User = mongoose.model("User", userSchema);

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Falta configurar JWT_SECRET en las variables de entorno");
}



async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Debes iniciar sesión"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id username role"
    );

    if (!user) {
      return res.status(401).json({
        error: "El usuario ya no existe"
      });
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token inválido o expirado"
      });
    }

    console.error("Error al verificar usuario:", error);

    return res.status(500).json({
      error: "Error al verificar la sesión"
    });
  }
}


function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Debes iniciar sesión"
      });
    }

    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        error: "No tienes permisos para realizar esta acción"
      });
    }

    next();
  };
}



 // OBTENER POSTS

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al obtener publicaciones"
    });
  }
});

// CREAR POST

app.post("/posts", verificarToken, async (req, res) => {
  try {
    const { title, description, code, language } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "El título es obligatorio"
      });
    }

    const newPost = new Post({
      title,
      description,
      code,
      language,
      user: req.user.username
    });

    await newPost.save();
    res.status(201).json(newPost);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error al crear la publicación"
    });
  }
});


 // AGREGAR COMENT

app.post("/posts/:id/comments", verificarToken, async (req, res) => {
  try {
    const { content, code, language } = req.body;

    if (!content?.trim() && !code?.trim()) {
      return res.status(400).json({
        error: "Escribe un comentario o agrega código"
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    post.comments.push({
      content: content || "",
      code: code || "",
      language: language || "javascript",
      user: req.user.username
    });

    await post.save();

    res.status(201).json(post);

  } catch (error) {
    console.log(error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "El ID de la publicación no es válido"
      });
    }

    res.status(500).json({
      error: "Error al agregar comentario"
    });
  }
});


/* EDITAR PUBLICACIÓN prop*/
app.patch("/posts/:id", verificarToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    // No permitir reclamar publicaciones
    if (!post.user || post.user === "Anónimo" ||
        post.user !== req.user.username) {
      return res.status(403).json({
        error: "Solo puedes editar tus propias publicaciones"
      });
    }

    const { title, description, code, language } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          error: "El título es obligatorio"
        });
      }
      post.title = title.trim();
    }

    if (description !== undefined) post.description = description;
    if (code !== undefined) post.code = code;
    if (language !== undefined) post.language = language;

    await post.save();
    return res.json(post);
  } catch (error) {
    console.error("Error al editar publicación:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "El ID de la publicación no es válido"
      });
    }

    return res.status(500).json({
      error: "Error al editar publicación"
    });
  }
});


/* ELIMINAR PUBLICACIÓN*/
app.delete("/posts/:id", verificarToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Publicación no encontrada"
      });
    }

    const esPropietario =
      post.user &&
      post.user !== "Anónimo" &&
      post.user === req.user.username;

    const esModerador =
      ["moderador", "admin"].includes(req.user.role);

    if (!esPropietario && !esModerador) {
      return res.status(403).json({
        error: "No tienes permiso para eliminar esta publicación"
      });
    }

    await post.deleteOne();

    return res.json({
      message: "Publicación eliminada correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar publicación:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "El ID de la publicación no es válido"
      });
    }

    return res.status(500).json({
      error: "Error al eliminar publicación"
    });
  }
});



// REGISTER

app.post("/register", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Faltan datos"
      });
    }

    const existingUser = await User.findOne({
      username
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Usuario ya existe"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.json({
      message: "Usuario registrado"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error en el registro"
    });
  }
});

/* CONSULTAR USUARIOS: solo administradores */
app.get("/users", verificarToken, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find()
      .select("_id username role")
      .sort({ username: 1 });

    return res.json(users);
  } catch (error) {
    console.error("Error al consultar usuarios:", error);
    return res.status(500).json({
      error: "Error al consultar usuarios"
    });
  }
});


/* CAMBIAR ROL: solo administradores */
app.patch("/users/:id/role", verificarToken, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const rolesPermitidos = ["usuario", "tester", "moderador", "admin"];

    if (!rolesPermitidos.includes(role)) {
      return res.status(400).json({
        error: "El rol seleccionado no es válido"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    // Evitar que el administrador se quite su propio rol.
    if (user._id.toString() === req.user.id && role !== "admin") {
      return res.status(400).json({
        error: "No puedes quitarte tu propio rol de administrador"
      });
    }

    user.role = role;
    await user.save();

    return res.json({
      message: "Rol actualizado correctamente",
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error al cambiar rol:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        error: "El ID del usuario no es válido"
      });
    }

    return res.status(500).json({
      error: "Error al cambiar el rol"
    });
  }
});

// LOGIN

app.post("/login", async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;

    const user = await User.findOne({
      username
    });

    if (!user) {
      return res.status(400).json({
        error: "Usuario no existe"
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        error: "Contraseña incorrecta"
      });
    }

    const token = jwt.sign(
  {
    id: user._id,
    username: user.username,
    role: user.role
  },
  JWT_SECRET,
  {
    expiresIn: "1d"
  }
);

res.json({
  token,
  username: user.username,
  role: user.role
});
  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error en login"
    });
  }
});

// SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Servidor en puerto " + PORT);
});