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

// MODELO DE POST

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

// MODELO USUARIO

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model("User", userSchema);

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

app.post("/posts", async (req, res) => {
  try {

    const {
      title,
      description,
      code,
      language,
      user
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "El título es obligatorio"
      });
    }

    const newPost = new Post({
      title,
      description,
      code,
      language,
      user: user || "Anónimo"
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

// AGREGAR COMENTARIO

app.post("/posts/:id/comments", async (req, res) => {

  try {

    const {
      content,
      code,
      language,
      user
    } = req.body;

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
      user: user || "Anónimo"
    });

    await post.save();

    res.status(201).json(post);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error al agregar comentario"
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
        username: user.username
      },
      "secreto123",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      username: user.username
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Error en login"
    });
  }
});

// SERVER

app.listen(
  process.env.PORT,
  () => {
    console.log(
      "Servidor en puerto " +
      process.env.PORT
    );
  }
);