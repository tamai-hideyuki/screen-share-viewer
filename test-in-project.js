console.log("=== Test from project directory ===");
try {
  const { app } = require("electron");
  console.log("Success! app type:", typeof app);
} catch (err) {
  console.error("Error:", err.message);
}
