const API_BASE = "http://localhost:8080/api";

export async function fetchMenu() {
  const response = await fetch(`${API_BASE}/menu`);

  if (!response.ok) {
    throw new Error("Failed to fetch menu");
  }

  return response.json();
}

export async function placeOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Failed to place order");
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function fetchOrders() {
  const response = await fetch(`${API_BASE}/orders`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
}

export async function updateOrderStatus(orderId, status) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
}