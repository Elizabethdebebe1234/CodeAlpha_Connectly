require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://connectly-ashen-three.vercel.app",
  "https://connectly-gsa4u62ud-elizabethdebebe1234s-projects.vercel.app",
  "https://connectly-cpqldw49f-elizabethdebebe1234s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
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