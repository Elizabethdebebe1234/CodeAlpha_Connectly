require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Connectly API 🚀" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", app: "Connectly" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Connectly API running on port ${PORT}`);
  });
};

startServer();