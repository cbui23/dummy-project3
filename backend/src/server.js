import app from "./app.js";
import { OAuth2Client } from 'google-auth-library';
import pool from "./config/db.js"; 

// 1. Configuration
const PORT = process.env.PORT || 8080;
const CLIENT_ID = "2055879532-b174qi00vahh6i55j79m27je0bkeosjq.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// 2. Auth Route
app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userEmail = payload.email.toLowerCase(); // Ensure case-insensitivity

        // Cleaned up Whitelist
        const managers = [
            "ok.samgarces@gmail.com",
            "reveille.bubbletea@gmail.com", 
            "ibrahimerandhawa@gmail.com", 
            "4andrew.siv@gmail.com",  
            "christianb62791@gmail.com",      
            "rch27@tamu.edu"
        ];

        const cashiers = [
            "purigarv@tamu.edu",
            "cqb.23000@tamu.edu",
            "andrewsiv14@tamu.edu",
            "garcesam0@tamu.edu",
            "ibrahime@tamu.edu"
        ];

        let assignedRole = null;
        if (managers.includes(userEmail)) {
            assignedRole = "manager";
        } else if (cashiers.includes(userEmail)) {
            assignedRole = "cashier";
        } else {
            console.warn(`Blocked access attempt: ${userEmail}`);
            return res.status(403).json({ error: "Access denied. Email not whitelisted." });
        }

        res.json({ 
            success: true, 
            role: assignedRole,
            name: payload.name.split(' ')[0] 
        });
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ error: "Invalid Google Token" });
    }
});

// 3. Inventory Route
app.get("/api/inventory", async (req, res) => {
    try {
        const result = await pool.query("SELECT inventory_id, name, quantity, unit FROM inventory ORDER BY quantity ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Inventory Fetch Error:", err.message);
        res.status(500).json([]); 
    }
});

// 4. Employees Route
app.get("/api/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT employee_id, name, role, shift_status FROM employees ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Employee Fetch Error:", err.message);
        res.status(500).json([]); 
    }
});

// 5. Add Employee Route
app.post("/api/employees", async (req, res) => {
    const { name, role } = req.body;
    try {
        const idRes = await pool.query("SELECT MAX(employee_id) FROM employees");
        const nextId = (idRes.rows[0].max || 0) + 1;
        
        await pool.query(
            "INSERT INTO employees (employee_id, name, role, shift_status) VALUES ($1, $2, $3, false)", 
            [nextId, name, role]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Add Employee Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 6. Start the server (Only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Aura Backend running on port ${PORT}`);
    });
}