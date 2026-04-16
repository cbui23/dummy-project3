import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from 'google-auth-library';
import pool from "./config/db.js"; 

// --- Route Imports ---
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. Middleware & CORS (CRITICAL FOR RENDER) ---
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true, // This allows Google OAuth session cookies to pass
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// --- 2. Google OAuth Configuration ---
const CLIENT_ID = "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// --- 3. Auth Route (With Loyalty Upsert) ---
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const googleId = payload.sub;
        const fullName = payload.name;

        // Whitelists
        const managers = ["ok.samgarces@gmail.com", "reveille.bubbletea@gmail.com", "ibrahimerandhawa@gmail.com", "4andrew.siv@gmail.com", "christianb62791@gmail.com", "rch27@tamu.edu"];
        const cashiers = ["purigarv@tamu.edu", "cqb.23000@tamu.edu", "andrewsiv14@tamu.edu", "garcesam0@tamu.edu", "ibrahime@tamu.edu"];

        let role = "customer";
        if (managers.includes(userEmail)) role = "manager";
        else if (cashiers.includes(userEmail)) role = "cashier";

        // Logic for Customer Loyalty (Feature 3)
        if (role === "customer") {
            await pool.query(
                `INSERT INTO public.customers (customer_id, name, stamps, lucky_draw_eligible, reward_points) 
                 VALUES ($1, $2, 0, false, 0) ON CONFLICT (customer_id) DO NOTHING`,
                [googleId, fullName]
            );
        }

        res.json({ success: true, role, name: fullName.split(' ')[0], customer_id: googleId });
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
});

// --- 4. API Routes ---
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/reports", reportRoutes);

// --- 5. AI Chat & Weather ---
app.post("/api/chat", async (req, res) => {
    // ... keep your existing Groq logic from app.js ...
});

app.get("/api/weather", async (req, res) => {
    // ... keep your existing Open-Meteo logic from app.js ...
});

// --- 6. Deployment Logic (Serving Frontend) ---
const buildPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(buildPath));
app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

// --- 7. Server Start ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Aura Backend running on port ${PORT}`);
    console.log(`👉 Accepting requests from: ${allowedOrigin}`);
});