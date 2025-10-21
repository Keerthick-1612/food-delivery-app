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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", price: "", quantityAvailable: "", category: "", description: "" });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    const token = user.token;
    getFoodItems(token)
      .then(({ data }) => setItems(data))
      .catch(() => {});
  }, [user, navigate]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !price || !quantityAvailable) {
      setError("All required fields must be filled");
      return;
    }
    const payload = {
      name,
      price: Number(price),
      quantityAvailable: Number(quantityAvailable),
      description,
      category,
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
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditValues({ name: "", price: "", quantityAvailable: "", category: "", description: "" });
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
      
      // Update the specific item
      setItems((prev) => prev.map((it) => (it._id === id ? data : it)));
      
      // If setting as menu of the day, deselect all other items
      if (data.isMenuOfTheDay) {
        setItems((prev) => prev.map((it) => 
          it._id !== id ? { ...it, isMenuOfTheDay: false } : it
        ));
      }
      
      // Show success message
      if (data.message) {
        setError(""); // Clear any previous errors
        // You could add a success message state here if needed
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle menu status");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Admin Dashboard - Menu Management</h2>
        <a 
          href="/admin/orders" 
          style={{ 
            padding: "8px 16px", 
            backgroundColor: "#E67E22", 
            color: "white", 
            textDecoration: "none", 
            borderRadius: "4px",
            fontSize: "14px"
          }}
        >
          View Orders
        </a>
      </div>
      <h3>Add Food Item</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleCreate} style={{ display: "grid", gap: 8 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input placeholder="Quantity Available" type="number" value={quantityAvailable} onChange={(e) => setQuantityAvailable(e.target.value)} required />
        <input placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Add Item"}</button>
      </form>

      <h3 style={{ marginTop: 24 }}>Existing Items</h3>
      <div>
        {items.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Item ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Name</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Price</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Qty</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Category</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Description</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Menu of Day</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td style={{ padding: 6 }}>{it.itemId}</td>
                  <td style={{ padding: 6 }}>
                    {editId === it._id ? (
                      <input value={editValues.name} onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))} />
                    ) : (
                      it.name
                    )}
                  </td>
                  <td style={{ padding: 6, textAlign: "right" }}>
                    {editId === it._id ? (
                      <input type="number" step="0.01" value={editValues.price} onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))} style={{ textAlign: "right" }} />
                    ) : (
                      it.price
                    )}
                  </td>
                  <td style={{ padding: 6, textAlign: "right" }}>
                    {editId === it._id ? (
                      <input type="number" value={editValues.quantityAvailable} onChange={(e) => setEditValues((v) => ({ ...v, quantityAvailable: e.target.value }))} style={{ textAlign: "right" }} />
                    ) : (
                      it.quantityAvailable
                    )}
                  </td>
                  <td style={{ padding: 6 }}>
                    {editId === it._id ? (
                      <input value={editValues.category} onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))} />
                    ) : (
                      it.category || "-"
                    )}
                  </td>
                  <td style={{ padding: 6 }}>
                    {editId === it._id ? (
                      <input value={editValues.description} onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))} />
                    ) : (
                      (it.description && it.description.trim()) ? it.description : "-"
                    )}
                  </td>
                  <td style={{ padding: 6 }}>
                    <button 
                      onClick={() => handleToggleMenu(it._id)} 
                      disabled={loading}
                      style={{ 
                        backgroundColor: it.isMenuOfTheDay ? "#4CAF50" : "#f44336",
                        color: "white",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: "4px"
                      }}
                    >
                      {it.isMenuOfTheDay ? "Yes" : "No"}
                    </button>
                  </td>
                  <td style={{ padding: 6 }}>
                    {editId === it._id ? (
                      <>
                        <button onClick={() => saveEdit(it._id)} disabled={loading} style={{ marginRight: 6 }}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(it)} style={{ marginRight: 6 }}>Edit</button>
                        <button onClick={() => removeItem(it._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;


