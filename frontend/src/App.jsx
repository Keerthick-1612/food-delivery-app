import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import OrderDashboard from "./pages/OrderDashboard";
import OrderHistory from "./pages/OrderHistory";
import CustomerMenu from "./pages/CustomerMenu";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage setUser={setUser} />}
        />
        <Route
          path="/register"
          element={<RegisterPage setUser={setUser} />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/menu"
          element={user ? <CustomerMenu user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && user.role === "admin" ? <AdminDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/orders"
          element={user && user.role === "admin" ? <OrderDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/orders/history"
          element={user && user.role === "admin" ? <OrderHistory user={user} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
