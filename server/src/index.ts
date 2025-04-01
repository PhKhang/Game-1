import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"; // Import path module

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
const clientBuildPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientBuildPath));

// API route
app.get("/api", (req, res) => {
  res.send("Quiz Game Backend");
});

// Serve the frontend for all other routes
app.get("/", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
