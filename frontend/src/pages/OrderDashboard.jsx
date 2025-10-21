import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders, markOrderAsServed } from "../api/cartApi";

function OrderDashboard({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await getAllOrders(user.token);
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsServed = async (orderId) => {
    try {
      setError("");
      await markOrderAsServed(orderId, user.token);
      // Remove the served order from the list
      setOrders(prev => prev.filter(order => order._id !== orderId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark order as served");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#3498DB';
      case 'preparing': return '#F39C12';
      case 'ready': return '#27AE60';
      case 'delivered': return '#2ECC71';
      case 'cancelled': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Order Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <a 
            href="/admin" 
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#27AE60", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            Back to Menu
          </a>
          <a 
            href="/admin/orders/history" 
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#8E44AD", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            View History
          </a>
          <button 
            onClick={loadOrders}
            disabled={loading}
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#3498DB", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <div 
              key={order._id} 
              style={{ 
                border: "1px solid #4A5F7A", 
                borderRadius: "8px", 
                padding: "20px",
                backgroundColor: "#34495E"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: 0, color: "white" }}>Order #{order._id.slice(-6)}</h3>
                  <p style={{ margin: "4px 0", color: "#BDC3C7" }}>
                    Customer: {order.user.name} ({order.user.email})
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div 
                    style={{ 
                      padding: "6px 12px", 
                      backgroundColor: getStatusColor(order.status), 
                      color: "white", 
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}
                  >
                    {order.status}
                  </div>
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#BDC3C7" }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", color: "white" }}>Items:</h4>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#2C3E50" }}>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #4A5F7A", color: "white" }}>Item</th>
                      <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #4A5F7A", color: "white" }}>Price</th>
                      <th style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #4A5F7A", color: "white" }}>Qty</th>
                      <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #4A5F7A", color: "white" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td style={{ padding: "8px", borderBottom: "1px solid #4A5F7A", color: "white" }}>{item.name}</td>
                        <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #4A5F7A", color: "white" }}>${item.price}</td>
                        <td style={{ padding: "8px", textAlign: "center", borderBottom: "1px solid #4A5F7A", color: "white" }}>{item.quantity}</td>
                        <td style={{ padding: "8px", textAlign: "right", borderBottom: "1px solid #4A5F7A", color: "white" }}>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #3498DB", paddingTop: "12px" }}>
                <strong style={{ fontSize: "18px", color: "white" }}>
                  Total: ${order.totalAmount.toFixed(2)}
                </strong>
                {order.status === "confirmed" && (
                  <button
                    onClick={() => handleMarkAsServed(order._id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#27AE60",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Mark as Served
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderDashboard;
