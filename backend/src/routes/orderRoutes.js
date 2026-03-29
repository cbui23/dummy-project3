import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT order_id, customer_id, employee_id, "date", status, total_amount, "time", z_reported
      FROM public.orders
      ORDER BY "date" DESC, "time" DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/orders failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { items, total_amount } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must include at least one item." });
    }

    const result = await pool.query(
      `
      INSERT INTO public.orders
        (customer_id, employee_id, "date", status, total_amount, "time", z_reported)
      VALUES
        ($1, $2, CURRENT_DATE, $3, $4, CURRENT_TIME, $5)
      RETURNING order_id, customer_id, employee_id, "date", status, total_amount, "time", z_reported
      `,
      [1, 1, "pending", Number(total_amount), false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/orders failed:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:orderId", async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;

    const result = await pool.query(
      `
      UPDATE public.orders
      SET status = $1
      WHERE order_id = $2
      RETURNING order_id, customer_id, employee_id, "date", status, total_amount, "time", z_reported
      `,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/orders/:orderId failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;