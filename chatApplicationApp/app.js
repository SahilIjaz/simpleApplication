const express = require("express");
const app = express();

const cors = require("cors");

app.use(express.json());
app.use(cors());
app.options("*", cors());

const globalErrors = require("./controllers/errorControllers");

const authRoutes = require("./routes/authRutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);

app.use(globalErrors);

module.exports = app;
