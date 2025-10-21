import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrderHistory } from "../api/cartApi";

function OrderHistory({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    period: "all" // all, today, week, month, custom
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadHistory();
  }, [user, navigate]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data } = await getOrderHistory(user.token);
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = () => {
    let filtered = [...orders];
    
    if (dateFilter.period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < tomorrow;
      });
    } else if (dateFilter.period === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= weekAgo;
      });
    } else if (dateFilter.period === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthAgo;
      });
    } else if (dateFilter.period === "custom") {
      if (dateFilter.startDate && dateFilter.endDate) {
        const startDate = new Date(dateFilter.startDate);
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
    }
    
    setFilteredOrders(filtered);
  };

  const handlePeriodChange = (period) => {
    setDateFilter(prev => ({ ...prev, period }));
  };

  const handleDateChange = (field, value) => {
    setDateFilter(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    applyDateFilter();
  }, [dateFilter, orders]);

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

  const stats = {
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: filteredOrders.length > 0 ? filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length : 0,
    totalItems: filteredOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
  };

  if (loading && orders.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="loading-spinner" style={{ width: "40px", height: "40px", margin: "0 auto var(--spacing-4)" }}></div>
          <div className="empty-state-title">Loading Order History...</div>
          <div className="empty-state-description">Please wait while we fetch the completed orders</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📊 Order History</h1>
        <p className="page-subtitle">View all completed orders and historical data for Grand Palace Hotel</p>
      </div>

      <div style={{ maxWidth: "1400px", width: "100%" }}>
        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{stats.totalRevenue.toFixed(0)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{stats.averageOrderValue.toFixed(2)}</div>
            <div className="stat-label">Average Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalItems}</div>
            <div className="stat-label">Items Sold</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 style={{ margin: 0, color: "var(--hotel-burgundy)", fontSize: "var(--font-size-2xl)" }}>Completed Orders</h2>
          <div className="flex gap-4">
            <a 
              href="/admin/orders" 
              className="btn btn-primary"
              style={{ background: "linear-gradient(135deg, var(--hotel-burgundy) 0%, var(--primary-color) 100%)" }}
            >
              📋 Active Orders
            </a>
            <a 
              href="/admin" 
              className="btn btn-secondary"
              style={{ background: "linear-gradient(135deg, var(--hotel-gold) 0%, var(--accent-color) 100%)" }}
            >
              ⚙️ Hotel Management
            </a>
            <button 
              onClick={loadHistory}
              disabled={loading}
              className="btn btn-outline"
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

        {/* Date Filter Section */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 style={{ margin: 0, color: "var(--hotel-burgundy)", fontSize: "var(--font-size-xl)" }}>📅 Filter Orders by Date</h3>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-4)", marginBottom: "var(--spacing-6)" }}>
              <div className="form-group">
                <label className="form-label">Quick Filter</label>
                <select 
                  className="form-input"
                  value={dateFilter.period}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              {dateFilter.period === "custom" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={dateFilter.startDate}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date"
                      className="form-input"
                      value={dateFilter.endDate}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            
            <div style={{ 
              padding: "var(--spacing-4)", 
              background: "var(--bg-secondary)", 
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>
                    Showing {filteredOrders.length} of {orders.length} orders
                  </strong>
                  {dateFilter.period !== "all" && (
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginTop: "var(--spacing-1)" }}>
                      Filtered by: {dateFilter.period === "custom" ? "Custom Range" : dateFilter.period.charAt(0).toUpperCase() + dateFilter.period.slice(1)}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setDateFilter({ startDate: "", endDate: "", period: "all" })}
                  className="btn btn-sm btn-outline"
                >
                  Clear Filter
                </button>
              </div>
            </div>
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
        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <div className="empty-state-title">No Orders Found</div>
            <div className="empty-state-description">
              {orders.length === 0 
                ? "No orders have been completed yet. Completed orders will appear here for historical tracking."
                : "No orders match the current filter criteria. Try adjusting your date range or clearing the filter."
              }
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--spacing-6)" }}>
            {filteredOrders.map((order) => (
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
                          backgroundColor: "var(--success-color)",
                          color: "white"
                        }}
                      >
                        ✅ DELIVERED
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
                              ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="order-footer">
                  <div className="order-total">
                    Total: ₹{order.totalAmount.toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: "var(--font-size-sm)", 
                    color: "var(--text-secondary)",
                    textAlign: "right"
                  }}>
                    Completed Order
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;

