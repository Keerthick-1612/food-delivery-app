import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFoodItem, getFoodItems, updateFoodItem, deleteFoodItem, toggleMenuOfTheDay } from "../api/foodApi";

function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", price: "", quantityAvailable: "", category: "", description: "", cookingTime: "" });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadItems();
  }, [user, navigate]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data } = await getFoodItems(user.token);
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !price || !quantityAvailable || !cookingTime) {
      setError("All required fields must be filled");
      return;
    }
    const payload = {
      name,
      price: Number(price),
      quantityAvailable: Number(quantityAvailable),
      description,
      category,
      cookingTime: Number(cookingTime),
    };
    try {
      setLoading(true);
      const { data } = await createFoodItem(payload, user.token);
      setItems((prev) => [data, ...prev]);
      setName("");
      setPrice("");
      setQuantityAvailable("");
      setDescription("");
      setCategory("");
      setCookingTime("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditId(item._id);
    setEditValues({
      name: item.name || "",
      price: String(item.price ?? ""),
      quantityAvailable: String(item.quantityAvailable ?? ""),
      category: item.category || "",
      description: item.description || "",
      cookingTime: String(item.cookingTime ?? ""),
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValues({ name: "", price: "", quantityAvailable: "", category: "", description: "", cookingTime: "" });
  };

  const saveEdit = async (id) => {
    try {
      setLoading(true);
      const payload = {
        name: editValues.name,
        price: Number(editValues.price),
        quantityAvailable: Number(editValues.quantityAvailable),
        category: editValues.category,
        description: editValues.description,
        cookingTime: Number(editValues.cookingTime),
      };
      const { data } = await updateFoodItem(id, payload, user.token);
      setItems((prev) => prev.map((it) => (it._id === id ? data : it)));
      cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    try {
      setLoading(true);
      await deleteFoodItem(id, user.token);
      setItems((prev) => prev.filter((it) => it._id !== id));
      if (editId === id) cancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMenu = async (id) => {
    try {
      setLoading(true);
      const { data } = await toggleMenuOfTheDay(id, user.token);
      
      setItems((prev) => prev.map((it) => (it._id === id ? data : it)));
      
      if (data.isMenuOfTheDay) {
        setItems((prev) => prev.map((it) => 
          it._id !== id ? { ...it, isMenuOfTheDay: false } : it
        ));
      }
      
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle menu status");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalItems: items.length,
    menuOfTheDay: items.filter(item => item.isMenuOfTheDay).length,
    lowStock: items.filter(item => item.quantityAvailable < 10).length,
    totalValue: items.reduce((sum, item) => sum + (item.price * item.quantityAvailable), 0)
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ Hotel Management</h1>
        <p className="page-subtitle">Manage Grand Palace Hotel's culinary operations and menu offerings</p>
      </div>

      <div style={{ maxWidth: "1400px", width: "100%" }}>
        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalItems}</div>
            <div className="stat-label">Menu Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.menuOfTheDay}</div>
            <div className="stat-label">Chef's Special</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.lowStock}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{stats.totalValue.toFixed(0)}</div>
            <div className="stat-label">Inventory Value</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 style={{ margin: 0, color: "#7f1d1d", fontSize: "var(--font-size-2xl)" }}>Menu Management</h2>
          <div className="flex gap-4">
            <a 
              href="/admin/orders" 
              className="btn btn-secondary"
              style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
            >
              📋 Order Management
            </a>
            <a 
              href="/admin/orders/history" 
              className="btn btn-outline"
            >
              📊 Order History
            </a>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="card mb-8">
          <div className="card-header">
            <h3 style={{ margin: 0, color: "#7f1d1d", fontSize: "var(--font-size-xl)" }}>➕ Add New Menu Item</h3>
          </div>
          <div className="card-body">
            {error && (
              <div className="form-error" style={{ 
                background: "#dc2626", 
                color: "white", 
                padding: "var(--spacing-3)", 
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--spacing-4)",
                textAlign: "center"
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreate}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-4)", marginBottom: "var(--spacing-6)" }}>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input 
                    className="form-input"
                    placeholder="Enter item name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input 
                    className="form-input"
                    placeholder="0.00" 
                    type="number" 
                    step="0.01" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Quantity Available *</label>
                  <input 
                    className="form-input"
                    placeholder="0" 
                    type="number" 
                    value={quantityAvailable} 
                    onChange={(e) => setQuantityAvailable(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input 
                    className="form-input"
                    placeholder="e.g., Appetizer, Main Course" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Cooking Time (minutes) *</label>
                  <input 
                    className="form-input"
                    placeholder="e.g., 15" 
                    type="number" 
                    min="1"
                    value={cookingTime} 
                    onChange={(e) => setCookingTime(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input form-textarea"
                  placeholder="Describe the food item..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #1e40af 100%)" }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Adding Item...
                  </>
                ) : (
                  "➕ Add Menu Item"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Items Table */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, color: "#7f1d1d", fontSize: "var(--font-size-xl)" }}>📋 Current Menu Items</h3>
          </div>
          <div className="card-body">
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <div className="empty-state-title">No Menu Items Yet</div>
                <div className="empty-state-description">
                  Start by adding your first menu item using the form above to create an exceptional dining experience.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Stock</th>
                      <th>Category</th>
                      <th className="text-center">Cooking Time</th>
                      <th>Description</th>
                      <th className="text-center">Chef's Special</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <span className="badge badge-secondary">
                            {item.itemId}
                          </span>
                        </td>
                        <td>
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              value={editValues.name} 
                              onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))} 
                            />
                          ) : (
                            <strong style={{ color: "#7f1d1d" }}>{item.name}</strong>
                          )}
                        </td>
                        <td className="text-right">
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              type="number" 
                              step="0.01" 
                              value={editValues.price} 
                              onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))} 
                            />
                          ) : (
                            <span style={{ fontWeight: "600", color: "#fbbf24" }}>
                              ₹{item.price}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              type="number" 
                              value={editValues.quantityAvailable} 
                              onChange={(e) => setEditValues((v) => ({ ...v, quantityAvailable: e.target.value }))} 
                            />
                          ) : (
                            <span style={{ 
                              fontWeight: "600", 
                              color: item.quantityAvailable < 10 ? "#dc2626" : "#7f1d1d" 
                            }}>
                              {item.quantityAvailable}
                            </span>
                          )}
                        </td>
                        <td>
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              value={editValues.category} 
                              onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))} 
                            />
                          ) : (
                            item.category || "-"
                          )}
                        </td>
                        <td className="text-center">
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              type="number"
                              min="1"
                              value={editValues.cookingTime} 
                              onChange={(e) => setEditValues((v) => ({ ...v, cookingTime: e.target.value }))} 
                            />
                          ) : (
                            <span style={{ 
                              fontWeight: "600", 
                              color: "var(--hotel-burgundy)",
                              background: "var(--hotel-gold)",
                              padding: "var(--spacing-1) var(--spacing-2)",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "var(--font-size-sm)"
                            }}>
                              {item.cookingTime || 5} min
                            </span>
                          )}
                        </td>
                        <td>
                          {editId === item._id ? (
                            <input 
                              className="form-input" 
                              value={editValues.description} 
                              onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))} 
                            />
                          ) : (
                            <span style={{ 
                              fontSize: "var(--font-size-sm)", 
                              color: "var(--text-secondary)" 
                            }}>
                              {(item.description && item.description.trim()) ? item.description : "-"}
                            </span>
                          )}
                        </td>
                        <td className="text-center">
                          <button 
                            onClick={() => handleToggleMenu(item._id)} 
                            disabled={loading}
                            className={`btn btn-sm ${item.isMenuOfTheDay ? 'btn-success' : 'btn-outline'}`}
                            style={item.isMenuOfTheDay ? { background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" } : {}}
                          >
                            {item.isMenuOfTheDay ? "⭐ Yes" : "No"}
                          </button>
                        </td>
                        <td className="text-center">
                          {editId === item._id ? (
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => saveEdit(item._id)} 
                                disabled={loading} 
                                className="btn btn-sm btn-success"
                              >
                                ✓ Save
                              </button>
                              <button 
                                onClick={cancelEdit} 
                                className="btn btn-sm btn-outline"
                              >
                                ✗ Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => startEdit(item)} 
                                className="btn btn-sm btn-primary"
                                style={{ background: "linear-gradient(135deg, #7f1d1d 0%, #1e40af 100%)" }}
                              >
                                ✏️ Edit
                              </button>
                              <button 
                                onClick={() => removeItem(item._id)} 
                                className="btn btn-sm btn-danger"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


