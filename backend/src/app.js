import express from "express";
import cors from "cors";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json());

// --- WEATHER API ---
app.get("/api/weather", async (req, res) => {
  console.log("PING: Weather requested");
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.334&current=temperature_2m&temperature_unit=fahrenheit");
    const data = await response.json();
    res.json({ temp: Math.round(data.current.temperature_2m) });
  } catch (error) {
    res.status(500).json({ error: "API unreachable" });
  }
});

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);

const PORT = 8080;


export default app; // 