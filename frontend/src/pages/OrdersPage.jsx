import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchOrders } from "../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();

  const newestOrderId = location.state?.orderId;

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await fetchOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load orders.");
      }
    }

    loadOrders();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Orders</h1>

      {newestOrderId && (
        <p>
          <strong>Order placed successfully. Your order ID is {newestOrderId}.</strong>
        </p>
      )}

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <Link to="/customer">
        <button style={{ marginBottom: "1rem" }}>Back to Customer Page</button>
      </Link>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.map((order) => (
            <div
              key={order.order_id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <h3>Order #{order.order_id}</h3>
              <p>Status: {order.status}</p>
              <p>Total: ${Number(order.total_amount).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}