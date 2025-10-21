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
    if (!window.confirm("Are you sure you want to mark this order as served?")) {
      return;
    }
    try {
      setError("");
      await markOrderAsServed(orderId, user.token);
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
      case 'confirmed': return 'var(--info-color)';
      case 'preparing': return 'var(--warning-color)';
      case 'ready': return 'var(--success-color)';
      case 'delivered': return 'var(--success-color)';
      case 'cancelled': return 'var(--danger-color)';
      default: return 'var(--gray-500)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🍽️';
      case 'delivered': return '🚚';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const stats = {
    totalOrders: orders.length,
    confirmedOrders: orders.filter(order => order.status === 'confirmed').length,
    preparingOrders: orders.filter(order => order.status === 'preparing').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0)
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container">
        <div className="page-container">
          <div className="empty-state">
            <div className="loading-spinner" style={{ width: "40px", height: "40px", margin: "0 auto var(--spacing-4)" }}></div>
            <div className="empty-state-title">Loading Orders...</div>
            <div className="empty-state-description">Please wait while we fetch the latest orders</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📋 Order Management</h1>
        <p className="page-subtitle">Monitor and manage all incoming orders at Grand Palace Hotel</p>
      </div>

      <div style={{ maxWidth: "1400px", width: "100%" }}>
        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.confirmedOrders}</div>
            <div className="stat-label">Confirmed Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.preparingOrders}</div>
            <div className="stat-label">Preparing Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${stats.totalRevenue.toFixed(0)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 style={{ margin: 0, color: "var(--hotel-burgundy)", fontSize: "var(--font-size-2xl)" }}>Active Orders</h2>
          <div className="flex gap-4">
            <a 
              href="/admin" 
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, var(--hotel-burgundy) 0%, var(--primary-color) 100%)" }}
            >
              ⚙️ Hotel Management
            </a>
            <a 
              href="/admin/orders/history" 
              className="btn btn-outline"
            >
              📊 Order History
            </a>
            <button 
              onClick={loadOrders}
              disabled={loading}
              className="btn btn-secondary"
              style={{ background: "linear-gradient(135deg, var(--hotel-gold) 0%, var(--accent-color) 100%)" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Loading...
                </>
              ) : (
                "🔄 Refresh"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="form-error" style={{ 
            background: "var(--danger-color)", 
            color: "white", 
            padding: "var(--spacing-4)", 
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--spacing-6)",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No Active Orders</div>
            <div className="empty-state-description">
              All orders have been processed. New orders will appear here when guests place them.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-6)" }}>
            {orders.map((order) => (
              <div key={order._id} className="order-card animate-fade-in">
                <div className="order-header">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="order-id">Order #{order._id.slice(-6)}</h3>
                      <p className="order-customer">
                        👤 {order.user.name} ({order.user.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <div 
                        className="order-status"
                        style={{ 
                          backgroundColor: getStatusColor(order.status),
                          color: "white"
                        }}
                      >
                        {getStatusIcon(order.status)} {order.status.toUpperCase()}
                      </div>
                      <p style={{ 
                        margin: "var(--spacing-2) 0 0 0", 
                        fontSize: "var(--font-size-sm)", 
                        color: "rgba(255, 255, 255, 0.8)" 
                      }}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="order-body">
                  <div className="order-items">
                    <h4 style={{ 
                      margin: "0 0 var(--spacing-4) 0", 
                      color: "var(--text-primary)",
                      fontSize: "var(--font-size-lg)"
                    }}>
                      📦 Order Items
                    </h4>
                    <div style={{ display: "grid", gap: "var(--spacing-3)" }}>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div>
                            <div className="order-item-name">{item.name}</div>
                            <div className="order-item-details">
                              ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => handleMarkAsServed(order._id)}
                      className="btn btn-success"
                      style={{ background: "linear-gradient(135deg, var(--hotel-gold) 0%, var(--accent-color) 100%)" }}
                    >
                      ✅ Mark as Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDashboard;
