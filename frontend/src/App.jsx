import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import CustomerPage from "./pages/CustomerPage";
import ManagerStats from "./components/ManagerStats";
import KitchenPage from "./pages/KitchenPage";
import MenuBoardPage from "./pages/MenuBoardPage";
<<<<<<< HEAD
import CashierPage from "./pages/CashierPage";
=======
>>>>>>> christian

function HomePage() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Drink Shop System</h1>
      <p>Select a page:</p>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/customer">
          <button>Customer Kiosk</button>
        </Link>

        <Link to="/admin">
          <button>Admin Dashboard</button>
        </Link>

        <Link to="/kitchen">
          <button>Kitchen View</button>
        </Link>
<<<<<<< HEAD
      
	<Link to = "/menuboard">
	  <button>Menu Board</button>
	</Link>
	</div>
	
	<Link to = "/cashierpage">
	  <button>Cashier Page</button>
	</Link>
=======

        <Link to="/menu-board">
          <button>Menu Board</button>
        </Link>
      </div>
>>>>>>> christian
    </div>
  );
}

function AdminPlaceholder() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Dashboard</h1>

      <ManagerStats />

      <div
        style={{
          marginTop: "2rem",
          borderTop: "1px solid #ccc",
          paddingTop: "1rem",
        }}
      >
        <p>Advanced Inventory and Employee tools coming soon.</p>
        <Link to="/">
          <button style={{ marginTop: "1rem" }}>Back to Portal</button>
        </Link>
      </div>
    </div>
  );
}

function KitchenPlaceholder() {
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Kitchen View</h1>
      <p>Kitchen page coming next.</p>
      <Link to="/">
        <button>Back Home</button>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/admin" element={<AdminPlaceholder />} />
        <Route path="/kitchen" element={<KitchenPage />} />
<<<<<<< HEAD
	<Route path = "/menuboard" element = {<MenuBoardPage />} />
	<Route path = "/cashierpage" element = {<CashierPage />} />	
=======
        <Route path="/menu-board" element={<MenuBoardPage />} />
>>>>>>> christian
      </Routes>
    </BrowserRouter>
  );
}
