import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function ManagerDashboard() {
    const [inventory, setInventory] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([
        { id: 1, text: "Restock Oolong Tea Pearls", completed: true },
        { id: 2, text: "Update Employee Whitelist", completed: true },
        { id: 3, text: "Verify weekend inventory shipment", completed: false },
        { id: 4, text: "Prepare quarterly revenue report", completed: false }
    ]);
    const [menuForm, setMenuForm] = useState({
	name: '',
	category: '',
	base_price: '',
	description: '',
	recipe_id: '',
	temperature: ''
    });

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        fetch("http://localhost:8080/api/inventory")
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setInventory(data) : setInventory([]))
            .catch(() => setInventory([]));

        fetch("http://localhost:8080/api/employees")
            .then(res => res.json())
            .then(data => Array.isArray(data) ? setEmployees(data) : setEmployees([]))
            .catch(() => setEmployees([]));
    };

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
        } else {
            alert("Invalid input.");
        }
    };

    //Add menu item feature
    const submitMenuItem = async () => {
        if(
            !menuForm.name ||
            !menuForm.category ||
            !menuForm.base_price ||
	    isNaN(parseFloat(menuForm.base_price)) ||
            !(menuForm.temperature === 'H' || menuForm.temperature === 'C')
        ){
            alert("Fill all required fields before proceeding.");
            return;
	} 

        try{
	    const res = await fetch("http://localhost:8080/api/menu/menuitems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                menu_item_id: Math.floor(Math.random() * 100000), //temp fix, but will change to incremental
                name: menuForm.name,
                category: menuForm.category,
                base_price: parseFloat(menuForm.base_price),
                description: menuForm.description,
                recipe_id: menuForm.recipe_id ? parseInt(menuForm.recipe_id) : null,
                temperature: menuForm.temperature
            })
        });

        const errno = await res.text();

        if(res.ok){
            alert("Menu item added!");

            //reset field after successufl addition
            setMenuForm({
                name: '',
                category: '',
                base_price: '',
                description: '',
                recipe_id: '',
                temperature: ''
            });

        } else{
            alert("Error: " + errno);
        }

    }catch(err){
        console.error(err);
        alert("Network error.");
    }
};
          

    const lowStockData = (inventory || []).slice(0, 10).map(item => ({
        ...item,
        quantity: item.quantity ? parseFloat(item.quantity) : 0
    }));

    return (
        <div style={containerStyle}>
            <header style={headerSection}>
                <div>
                    <h1 style={titleStyle}>Aura <span style={{fontWeight:'300'}}>Manager</span></h1>
                    <p style={subtitleStyle}>Real-time supply chain & team overview</p>
                </div>
                <div style={dateBox}>
                    {new Date().toLocaleDateString()}
                </div>
            </header>

            <div style={dashboardGrid}>

                {/* INVENTORY */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Low Stock Alerts</h3>
                        <span style={badgeStyle}>Top 10 Critical</span>
                    </div>
                    <div style={{height: '300px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={lowStockData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} />
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

                {/* TEAM */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Team Directory</h3>
                        <button onClick={hireEmployee} style={addBtnStyle}>+ Hire Staff</button>
                    </div>
                    <div style={listScrollSection}>
                        {employees.map(emp => (
                            <div key={emp.employee_id} style={listItemStyle}>
                                <div>
                                    <div>{emp.name}</div>
                                    <div>ID: #{emp.employee_id}</div>
                                </div>
                                <span>{emp.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TASKS */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Daily Agenda</h3>
                    </div>
                    {tasks.map(task => (
                        <div key={task.id}>{task.text}</div>
                    ))}
                </div>

                {/* NEW ITEM MANAGEMENT CARD */}
                <div style={cardStyle}>
                    <div style={cardHeader}>
                        <h3>Add Menu Items</h3>
                    </div>

                    <div style={{ dispaly: 'flex', flexDirection: 'column', marginTop: '20px', gap: '12px' }}>
			<input 
			    placeholder = "Item Name"
			    value = {menuForm.name}
			    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
			    style={inputStyle}
			/>

			<input
			    placeholder="Category"
                            value={menuForm.category}
                            onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                            style={inputStyle}
                        />

			<input
                            placeholder="Base Price (e.g. 5.00)"
                            value={menuForm.base_price}
                            onChange={(e) => setMenuForm({ ...menuForm, base_price: e.target.value })}
                            style={inputStyle}
                        />

                        <input
                            placeholder="Description"
                            value={menuForm.description}
                            onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                            style={inputStyle}
                        />

                        <input
                            placeholder="Recipe ID (optional)"
                            value={menuForm.recipe_id}
                            onChange={(e) => setMenuForm({ ...menuForm, recipe_id: e.target.value })}
                            style={inputStyle}
                        />

                        <select
                            value={menuForm.temperature}
                            onChange={(e) => setMenuForm({ ...menuForm, temperature: e.target.value })}
                            style={inputStyle}
                        >
                            <option value="">Select Temperature</option>
                            <option value="C">Cold</option>
                            <option value="H">Hot</option>
                        </select>

                        <button onClick={submitMenuItem} style={addBtnStyle}>
                            + Add New Menu Item
                        </button>                        



                    </div>
                </div>

            </div>
        </div>
    );
}

/* STYLES */
const containerStyle = { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerSection = { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' };
const titleStyle = { fontSize: '2.5rem', fontWeight: '800' };
const subtitleStyle = { color: '#64748b' };
const dateBox = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '12px' };

const dashboardGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: 'white', borderRadius: '30px', padding: '30px' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const listScrollSection = { maxHeight: '300px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0' };

const badgeStyle = { backgroundColor: '#fee2e2', padding: '4px 12px', borderRadius: '20px' };
const addBtnStyle = { backgroundColor: '#1b4332', color: 'white', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' };
const inputStyle = {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px'
};
