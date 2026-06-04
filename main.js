import app from "./api/index.js";

const PORT = 9060;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});