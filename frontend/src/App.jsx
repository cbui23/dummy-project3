import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import PortalPage from "./pages/PortalPage"; 
import CustomerPage from "./pages/CustomerPage";
import KitchenPage from "./pages/KitchenPage";
import MenuBoardPage from "./pages/MenuBoardPage";
import CashierPage from "./pages/CashierPage";
import ManagerDashboard from "./components/ManagerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * Main Application Component
 * Handles routing for the POS system.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publicly accessible routes */}
        <Route path="/" element={<PortalPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/menuboard" element={<MenuBoardPage />} />

        {/* 2. Protected Manager/Kitchen routes */}
        <Route 
          path="/manager" 
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } 
        /> 
        
        <Route 
          path="/kitchen" 
          element={
            <ProtectedRoute requiredRole="manager">
              <KitchenPage />
            </ProtectedRoute>
          } 
        />

        {/* 3. Protected Cashier route */}
        <Route 
          path="/cashierpage" 
          element={
            <ProtectedRoute requiredRole="cashier">
              <CashierPage />
            </ProtectedRoute>
          } 
        /> 
        
      </Routes>
    </BrowserRouter>
  );
}