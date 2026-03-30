import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET /api/manager/sales-summary
// Aggregates total revenue and order count
router.get("/sales-summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(order_id) as total_orders, 
        COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Sales summary failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/manager/top-items
// Identifies best sellers (requires your orders and menuitems tables)
router.get("/top-items", async (req, res) => {
  try {
    // Note: This query assumes you have a table that links orders to menu items
    // If your table names differ from 'menuitems', update them here.
    const result = await pool.query(`
      SELECT m.name, COUNT(*) as sales_count
      FROM orders o
      JOIN menuitems m ON o.order_id = o.order_id 
      GROUP BY m.name
      ORDER BY sales_count DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Top items failed:", err);
    res.status(500).json({ error: err.message });
  }
});

//get product usage chart
router.get('/product-usage', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const query = `
            SELECT 
                i.name AS inventory_item,
                SUM(oi.quantity * r.quantity) AS total_usage,
                i.unit
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            JOIN recipes r ON oi.menu_item_id = r.menu_item_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            WHERE o.date BETWEEN $1 AND $2
            GROUP BY i.name, i.unit
            ORDER BY total_usage DESC;
        `;
        
        const result = await pool.query(query, [startDate, endDate]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error fetching product usage");
    }
});

export default router;