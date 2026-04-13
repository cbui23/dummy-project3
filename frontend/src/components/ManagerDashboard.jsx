import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function ManagerDashboard() {
    // --- STATE MANAGEMENT ---
    const [inventory, setInventory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [usageData, setUsageData] = useState([]);
    const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0 });
    const [loadingStats, setLoadingStats] = useState(false);
    
    // Dates for the Usage Report
    const [startDate, setStartDate] = useState("2026-01-01");
    const [endDate, setEndDate] = useState("2026-12-31");

    const [tasks] = useState([
        { id: 1, text: "Restock Oolong Tea Pearls", completed: true },
        { id: 2, text: "Update Employee Whitelist", completed: true },
        { id: 3, text: "Verify weekend inventory shipment", completed: false },
        { id: 4, text: "Prepare quarterly revenue report", completed: false }
    ]);

    const [menuForm, setMenuForm] = useState({
        name: '', category: '', base_price: '', description: '', recipe_id: '', temperature: ''
    });

    // --- DATA FETCHING ---
    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        setLoadingStats(true);
        try {
            // Inventory Fetch
            fetch("http://localhost:8080/api/inventory")
                .then(res => res.json())
                .then(data => setInventory(Array.isArray(data) ? data : []))
                .catch(() => setInventory([]));

            // Employees Fetch
            fetch("http://localhost:8080/api/employees")
                .then(res => res.json())
                .then(data => setEmployees(Array.isArray(data) ? data : []))
                .catch(() => setEmployees([]));

            // Product Usage Fetch (using dates)
            const url = `http://localhost:8080/api/reports/sales?startDay=${startDate}&endDay=${endDate}&startTime=00:00:00&endTime=23:59:59`;
            
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    // Map the backend 'qty' and 'name' to the frontend table names
                    const formattedData = data.map(item => ({
                        inventory_item: item.name, 
                        total_usage: item.qty,
                        unit: 'sold'
                    }));
                    setUsageData(formattedData);
                })
                .catch(err => console.error("Error fetching usage:", err));

            // Also fetch your general stats if you have that route
            fetch("http://localhost:8080/api/reports/sales-summary")
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(() => {});

            // Sales Summary Fetch
            fetch("http://localhost:8080/api/reports/sales-summary")
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(() => setStats({ total_orders: 0, total_revenue: 0 }));

        } finally {
            setLoadingStats(false);
        }
    };

    // --- ACTIONS ---
    const hireEmployee = async () => {
        const name = prompt("Enter employee name:");
        const role = prompt("Enter role (manager/cashier):")?.toLowerCase();
        if (name && (role === 'manager' || role === 'cashier')) {
            const res = await fetch("http://localhost:8080/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, role })
            });
            if (res.ok) refreshData();
        }
    };

    const submitMenuItem = async () => {
        if(!menuForm.name || !menuForm.category || !menuForm.base_price || isNaN(parseFloat(menuForm.base_price))) {
            alert("Please fill out all required fields.");
            return;
        }
        try {
            const res = await fetch("http://localhost:8080/api/menu/menuitems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...menuForm,
                    menu_item_id: Math.floor(Math.random() * 100000),
                    base_price: parseFloat(menuForm.base_price)
                })
            });
            if (res.ok) {
                alert("Menu item added!");
                setMenuForm({ name: '', category: '', base_price: '', description: '', recipe_id: '', temperature: '' });
            }
        } catch (err) { console.error(err); }
    };

    const lowStockData = (inventory || []).slice(0, 10).map(item => ({
        ...item, quantity: parseFloat(item.quantity || 0)
    }));

    return (
        <div style={containerStyle}>
            <header style={headerSection}>
                <div>
                    <h1 style={titleStyle}>Aura <span style={{fontWeight:'300'}}>Manager</span></h1>
                    <p style={subtitleStyle}>Unified supply chain & performance dashboard</p>
                </div>
                <div style={dateBox}>{new Date().toLocaleDateString()}</div>
            </header>

            {/* TOP STATS STRIP */}
            <div style={statStrip}>
                <div style={miniStatCard}>
                    <span style={labelStyle}>Total Revenue</span>
                    <h2 style={statValue}>${Number(stats.total_revenue).toLocaleString()}</h2>
                </div>
                <div style={miniStatCard}>
                    <span style={labelStyle}>Total Orders</span>
                    <h2 style={statValue}>{stats.total_orders.toLocaleString()}</h2>
                </div>
            </div>

            <div style={dashboardGrid}>
                {/* INVENTORY CHART */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Low Stock Alerts</h3>
                        <span style={badgeStyle}>Critical Items</span>
                    </div>
                    <div style={{height: '300px', marginTop: '20px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lowStockData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="quantity">
                                    {lowStockData.map((entry, i) => (
                                        <Cell key={i} fill={entry.quantity < 20 ? '#ef4444' : '#10b981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TEAM DIRECTORY */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Team Directory</h3>
                        <button onClick={hireEmployee} style={addBtnStyle}>+ Hire</button>
                    </div>
                    <div style={listScrollSection}>
                        {employees.map(emp => (
                            <div key={emp.employee_id} style={listItemStyle}>
                                <div>
                                    <div style={{fontWeight: '700'}}>{emp.name}</div>
                                    <div style={{fontSize: '0.8rem', opacity: 0.6}}>ID: #{emp.employee_id}</div>
                                </div>
                                <span style={roleBadge}>{emp.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MENU MANAGEMENT */}
                <div style={cardStyle}>
                    <h3>Add Menu Items</h3>
                    <div style={formGrid}>
                        <input placeholder="Item Name" value={menuForm.name} onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} style={inputStyle} />
                        <input placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({...menuForm, category: e.target.value})} style={inputStyle} />
                        <input placeholder="Price" value={menuForm.base_price} onChange={(e) => setMenuForm({...menuForm, base_price: e.target.value})} style={inputStyle} />
                        <select value={menuForm.temperature} onChange={(e) => setMenuForm({...menuForm, temperature: e.target.value})} style={inputStyle}>
                            <option value="">Temp</option>
                            <option value="C">Cold</option>
                            <option value="H">Hot</option>
                        </select>
                        <button onClick={submitMenuItem} style={{...addBtnStyle, gridColumn: 'span 2'}}>Add Item</button>
                    </div>
                </div>

                {/* FULL WIDTH USAGE REPORT */}
                <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
                    <div style={cardHeader}>
                        <h3>Product Usage Report</h3>
                        <div style={datePickerGroup}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={dateInput} />
                            <span>to</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={dateInput} />
                            <button onClick={refreshData} style={updateBtn}>Update</button>
                        </div>
                    </div>
                    <div style={tableWrapper}>
                        <table style={auraTable}>
                            <thead>
                                <tr style={tableHeaderRow}>
                                    <th style={thStyle}>Inventory Item</th>
                                    <th style={thStyle}>Total Used</th>
                                    <th style={thStyle}>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usageData.length > 0 ? (
                                    usageData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{item.inventory_item}</td>
                                            <td style={tdStyle}><strong>{item.total_usage}</strong> {item.unit}</td>
                                            <td style={tdStyle}>
                                                <div style={progressBarBg}>
                                                    <div style={{ height: "100%", background: "#52b788", width: `${Math.min(item.total_usage, 100)}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" style={emptyCell}>No usage data found for this period.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- STYLES ---
const containerStyle = { padding: '40px', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const titleStyle = { fontSize: '2rem', fontWeight: '800', color: '#1e293b' };
const subtitleStyle = { color: '#64748b', marginTop: '-5px' };
const dateBox = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px', height: 'fit-content', fontWeight: '700', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };

const statStrip = { display: 'flex', gap: '20px', marginBottom: '30px' };
const miniStatCard = { background: '#1b4332', color: 'white', padding: '20px', borderRadius: '20px', flex: 1 };
const labelStyle = { fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' };
const statValue = { margin: 0, fontSize: '1.8rem' };

const dashboardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '25px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };

const listScrollSection = { maxHeight: '250px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const roleBadge = { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700' };

const badgeStyle = { backgroundColor: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' };
const addBtnStyle = { backgroundColor: '#1b4332', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', border: 'none', fontWeight: '600' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };

const datePickerGroup = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' };
const dateInput = { border: '1px solid #cbd5e1', borderRadius: '5px', padding: '5px' };
const updateBtn = { background: '#1b4332', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' };

const tableWrapper = { marginTop: '20px', border: '1px solid #f1f5f9', borderRadius: '15px', overflow: 'hidden' };
const auraTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeaderRow = { background: '#f8fafc' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };
const progressBarBg = { background: '#f1f5f9', height: '8px', borderRadius: '10px', width: '100%', overflow: 'hidden' };
const emptyCell = { padding: '40px', textAlign: 'center', color: '#94a3b8' };