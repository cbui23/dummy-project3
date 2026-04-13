import express from 'express';
import pool from '/home/andr/team_60_csce331_project3/backend/src/config/db.js'; // Assuming you have a db.js that configures 'pg'

const router = express.Router();

// GET /api/reports/sales?startDay=2026-01-01&endDay=2026-03-31&startTime=08:00:00&endTime=22:00:00
router.get('/sales', async (req, res) => {
  try {
    const { startDay, endDay, startTime, endTime } = req.query;

    // --- Translated from Java: refreshSalesData() ---
    const sql = `
      SELECT mi.name, SUM(oi.quantity) as qty, SUM(oi.quantity * oi.price) as revenue 
      FROM orders o 
      JOIN orderitems oi ON o.order_id = oi.order_id 
      JOIN menuitems mi ON oi.menu_item_id = mi.menu_item_id 
      WHERE o.date BETWEEN $1 AND $2 
      AND o.time BETWEEN $3 AND $4 
      GROUP BY mi.name ORDER BY revenue DESC
    `;

    const result = await pool.query(sql, [startDay, endDay, startTime, endTime]);
    
    // Send the data back as JSON to the browser
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching sales report.' });
  }
});

export default router;