import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from 'google-auth-library';
import pool from "./config/db.js"; 
import fs from 'fs';

// --- Route Imports ---
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CLEAN URL LOGIC ---
// This ensures that even if your teammate puts a "/" on Render, the code fixes it.
const rawBackendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
const cleanBackendUrl = rawBackendUrl.replace(/\/+$/, ""); 

// We define this ONCE here and use it everywhere
const REDIRECT_URI = `${cleanBackendUrl}/auth/google/callback`;

// --- 1. Middleware & CORS ---
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// --- 2. Google OAuth Configuration ---
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET);

// --- 3. Auth Routes (GET) ---

/**
 * Initiates the Google OAuth flow.
 * Uses the cleaned REDIRECT_URI to prevent double-slash 404s.
 */
app.get("/auth/google", (req, res) => {
    const { state } = req.query; 
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: REDIRECT_URI, // FIXED: Now uses the clean variable
        client_id: CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        state: state || '/manager', 
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };
    const queryString = new URLSearchParams(options).toString();
    res.redirect(`${rootUrl}?${queryString}`);
});

/**
 * Handles the return trip from Google.
 */
app.get("/auth/google/callback", async (req, res) => {
    const { code, state } = req.query; 
    try {
        const { tokens } = await client.getToken({
            code,
            redirect_uri: REDIRECT_URI // FIXED: Now matches Google Console exactly
        });
        
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        const managers = ["ok.samgarces@gmail.com", "reveille.bubbletea@gmail.com", "ibrahimerandhawa@gmail.com", "4andrew.siv@gmail.com", "christianb62791@gmail.com", "rch27@tamu.edu"];
        const cashiers = ["purigarv@tamu.edu", "cqb.23000@tamu.edu", "andrewsiv14@tamu.edu", "garcesam0@tamu.edu", "ibrahime@tamu.edu"];
        
        let role = "customer";
        if (managers.includes(payload.email)) role = "manager";
        else if (cashiers.includes(payload.email)) role = "cashier";

        const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/login-success?role=${role}&name=${payload.given_name}&id=${payload.sub}&dest=${state}`);
        
    } catch (err) {
        console.error("Callback Error:", err);
        res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/portal`);
    }
});

// --- 4. API & Other Routes ---
// Registering these BEFORE the static deployment logic ensures they are reachable.

app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: CLIENT_ID });
        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const fullName = payload.name;
        const managers = ["ok.samgarces@gmail.com", "reveille.bubbletea@gmail.com", "ibrahimerandhawa@gmail.com", "4andrew.siv@gmail.com", "christianb62791@gmail.com", "rch27@tamu.edu"];
        const cashiers = ["purigarv@tamu.edu", "cqb.23000@tamu.edu", "andrewsiv14@tamu.edu", "garcesam0@tamu.edu", "ibrahime@tamu.edu"];

        let role = "customer";
        if (managers.includes(payload.email)) role = "manager";
        else if (cashiers.includes(payload.email)) role = "cashier";

        let stamps = 0;
        if (role === "customer") {
            await pool.query(
                `INSERT INTO public.customers (customer_id, name, stamps, lucky_draw_eligible, reward_points) 
                 VALUES ($1, $2, 0, false, 0) ON CONFLICT (customer_id) DO NOTHING`,
                [googleId, fullName]
            );
            const customerData = await pool.query("SELECT stamps FROM public.customers WHERE customer_id = $1", [googleId]);
            if (customerData.rows.length > 0) stamps = customerData.rows[0].stamps;
        }
        res.json({ success: true, role, name: fullName.split(' ')[0], customer_id: googleId, stamps: stamps });
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
});

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/reports", reportRoutes);

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: "You are Reveille-Bot." }, { role: "user", content: req.body.message }]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) { res.status(500).json({ error: "AI error" }); }
});

app.get("/api/weather", async (req, res) => {
  try {
    const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=30.628&longitude=-96.334&current=temperature_2m&temperature_unit=fahrenheit");
    const data = await response.json();
    res.json({ temp: Math.round(data.current.temperature_2m) });
  } catch (error) { res.status(500).json({ error: "Weather unavailable" }); }
});

// --- 5. Deployment Logic ---
const buildPath = path.join(__dirname, "../../frontend/dist");

if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get(/^(?!\/api|\/auth).+/, (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("Backend is running.");
    });
}

// --- 6. Server Start ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Aura Backend running on port ${PORT}`);
});