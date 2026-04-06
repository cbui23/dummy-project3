import { useEffect, useState } from "react"; 
import Weather from '../components/Weather';
import { fetchMenu } from "../services/api"; 

export default function MenuBoardPage() {
    const [menu, setMenu] = useState([]); 

    useEffect(() => { 
        fetchMenu().then((items) => {
            setMenu(items); 
        }).catch(err => {
            console.error("Fetch failed:", err);
        });
    }, []);
    
    return (
        <div style={{ 
            backgroundColor: '#16171d', 
            minHeight: '100vh', 
            color: 'white', 
            padding: '2rem',
            position: 'relative' 
        }}>
            {/* Header Area with Weather */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <a href="/" style={{
                    color: '#9ca3af',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    border: '1px solid #2e303a',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#1f2028'
                }}>
                    ← Back to Portal
                </a>
                <Weather />
            </div>

            <div id="center" style={{ textAlign: 'center' }}> 
                <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '3rem', color: 'white' }}>
                    Reveille Bubble Tea Menu
                </h1>
                
                {/* Grid layout */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '1.5rem', 
                    justifyContent: 'center' 
                }}>
                    {menu.map((menuItem) => ( 
                        <div key={menuItem.menu_item_id} style={{
                            background: '#1f2028',
                            border: '1px solid #2e303a',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            minWidth: '300px',
                            flex: '1 1 300px',
                            textAlign: 'left'
                        }}>
                            <h2 style={{ color: '#aa3bff', margin: '0 0 10px 0' }}>{menuItem.name}</h2>
                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>{menuItem.description}</p>
                        
                            <span style={{ 
                                background: '#16171d',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                color: '#2ecc71'
                            }}>
                                ${parseFloat(menuItem.base_price).toFixed(2)}
                            </span>
                        </div>  
                    ))}
                </div>
            </div>
        </div>
    );
}