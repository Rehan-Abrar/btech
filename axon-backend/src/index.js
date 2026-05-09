require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const db = require("./db");
db.query("SELECT NOW()")
  .then(res => console.log("PostgreSQL Connected:", res.rows))
  .catch(err => console.error("PostgreSQL Error:", err));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
