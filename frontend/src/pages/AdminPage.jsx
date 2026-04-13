import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSalesReport } from "../services/api"; // Import the connector

export default function AdminPage() {
  // --- State (Replacing Java variables) ---
  const [salesData, setSalesData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Form States (Replacing Java JTextFields) ---
  const [form, setForm] = useState({
    startDay: "2026-01-01",
    endDay: new Date().toISOString().split('T')[0], // Today's date
    startTime: "08:00:00",
    endTime: "22:00:00"
  });

  // --- Core Logic (Replacing Java refreshSalesData()) ---
  const runSalesReport = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await fetchSalesReport(form);
      setSalesData(data);
    } catch (err) {
      console.error(err);
      setMessage("Error: Check backend connection or date formats.");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on load (optional, matching Java behavior)
  useEffect(() => {
    runSalesReport();
  }, []);

  // Calculate Grand Total (Replacing Java grandTotal loop)
  const grandTotal = salesData.reduce((sum, item) => sum + Number(item.revenue), 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      {/* HEADER (Replacing Java topPanel) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Managerial Reports</h1>
        <Link to="/"><button>Back Home</button></Link>
      </div>

      {/* TABS SIMULATION (For now, just showing Sales Report) */}
      <div style={{ borderBottom: '2px solid #ccc', marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button style={{ background: 'none', border: 'none', fontWeight: 'bold', borderBottom: '2px solid blue', padding: '0.5rem 1rem' }}>Sales Report</button>
        <button style={{ background: 'none', border: 'none', color: '#666', padding: '0.5rem 1rem' }} disabled>Inventory Usage (Coming Soon)</button>
        <button style={{ background: 'none', border: 'none', color: '#666', padding: '0.5rem 1rem' }} disabled>X/Z Reports (Coming Soon)</button>
      </div>

      {/* CONTROLS (Replacing Java controls panel) */}
      <div style={{ background: '#f5f7fb', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>Dates: <input type="date" value={form.startDay} onChange={e => setForm({...form, startDay: e.target.value})} /></label>
        <span>-</span>
        <input type="date" value={form.endDay} onChange={e => setForm({...form, endDay: e.target.value})} />
        <label>Time: <input type="time" step="1" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} /></label>
        <span>-</span>
        <input type="time" step="1" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
        <button onClick={runSalesReport} disabled={loading}>{loading ? "Loading..." : "Run Sales Report"}</button>
      </div>

      {message && <p style={{ color: 'red', fontWeight: 'bold' }}>{message}</p>}

      {/* TABLE & TOTAL (Replacing Java JTable & totalRevenueLabel) */}
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', background: 'white' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ borderBottom: '2px solid #eee' }}>
            <tr>
              <th style={{ padding: '0.5rem' }}>Item Name</th>
              <th style={{ padding: '0.5rem' }}>Qty Sold</th>
              <th style={{ padding: '0.5rem' }}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {salesData.length === 0 && !loading && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No data found for this period.</td></tr>}
            {salesData.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{item.name}</td>
                <td style={{ padding: '0.5rem' }}>{item.qty}</td>
                <td style={{ padding: '0.5rem' }}>${Number(item.revenue).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'green' }}>
          Total Period Revenue: ${grandTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}