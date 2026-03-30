import { useEffect, useState } from "react";
import { fetchSalesSummary, fetchProductUsage } from "../services/api"; // Ensure fetchProductUsage is added to api.js

export default function ManagerStats() {
  const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date states for the report
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const loadData = async () => {
    setLoading(true);
    try {
      const [sales, usage] = await Promise.all([
        fetchSalesSummary(),
        fetchProductUsage(startDate, endDate)
      ]);
      setStats(sales);
      setUsageData(usage);
    } catch (err) {
      console.error("Failed to load manager data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      {/* Top Cards */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3 style={labelStyle}>Total Revenue</h3>
          <p style={moneyStyle}>${Number(stats.total_revenue).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={labelStyle}>Total Orders</h3>
          <p style={numberStyle}>{stats.total_orders}</p>
        </div>
      </div>

      <hr style={{ margin: "3rem 0", borderColor: "#eee" }} />

      {/* Product Usage Section */}
      <section style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#333" }}>Product Usage Report</h2>
        
        {/* Date Controls */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button onClick={loadData} style={buttonStyle}>Update Report</button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Updating usage data...</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={thStyle}>Inventory Item</th>
                <th style={thStyle}>Total Used</th>
                <th style={thStyle}>Usage Visualization</th>
              </tr>
            </thead>
            <tbody>
              {usageData.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{item.inventory_item}</td>
                  <td style={tdStyle}>{item.total_usage} (Unit: {item.unit})</td>
                  <td style={tdStyle}>
                    {/* Visual bar hack */}
                    <div style={{
                      height: "10px",
                      background: "#aa3bff",
                      borderRadius: "5px",
                      width: `${Math.min(item.total_usage, 100)}%`, // Simplified scaling
                      opacity: 0.7
                    }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// --- Added Styles ---
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "1rem", backgroundColor: "white" };
const thStyle = { padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", textAlign: "left" };
const buttonStyle = { padding: "0.5rem 1rem", backgroundColor: "#aa3bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

// --- Existing Styles (Keep your previous ones) ---
const cardStyle = { border: "2px solid #aa3bff", padding: "2rem", borderRadius: "16px", background: "rgba(170, 59, 255, 0.05)", minWidth: "250px", textAlign: "center" };
const labelStyle = { margin: "0 0 10px 0", color: "#6b6375" };
const moneyStyle = { margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#2ecc71" };
const numberStyle = { margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#aa3bff" };