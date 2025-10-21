import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFoodItems } from "../api/foodApi";
import { addToCart, getCart, updateCartItem, confirmOrder } from "../api/cartApi";

function CustomerMenu({ user }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [quantities, setQuantities] = useState({});
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getFoodItems(user.token)
      .then(({ data }) => setItems(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load menu"));
    
    getCart(user.token)
      .then(({ data }) => setCart(data))
      .catch(() => {});
  }, [user, navigate]);

  const handleQuantityChange = (itemId, quantity) => {
    setQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleAddToCart = async (itemId, quantity) => {
    if (!quantity || quantity <= 0) {
      setError("Please select a valid quantity");
      return;
    }
    
    try {
      setError("");
      const { data } = await addToCart({ itemId, quantity }, user.token);
      setCart(data);
      setQuantities(prev => ({ ...prev, [itemId]: 0 }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleSubtractFromCart = async (itemId, quantity) => {
    if (!quantity || quantity <= 0) {
      setError("Please select a valid quantity to subtract");
      return;
    }
    
    const currentCartQuantity = getCurrentCartQuantity(itemId);
    if (quantity >= currentCartQuantity) {
      // Remove item completely if subtracting all or more
      await handleUpdateCartItem(itemId, 0);
    } else {
      // Subtract the specified amount
      await handleUpdateCartItem(itemId, currentCartQuantity - quantity);
    }
    setQuantities(prev => ({ ...prev, [itemId]: 0 }));
  };

  const getCurrentCartQuantity = (itemId) => {
    const cartItem = cart.items.find(item => item.foodItem._id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getAvailableQuantity = (itemId, currentStock) => {
    const cartItem = cart.items.find(item => item.foodItem._id === itemId);
    return currentStock - (cartItem ? cartItem.quantity : 0);
  };

  const handleUpdateCartItem = async (itemId, quantity) => {
    try {
      setError("");
      const { data } = await updateCartItem(itemId, { quantity }, user.token);
      setCart(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update cart");
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setError("");
      await confirmOrder(user.token);
      setCart({ items: [], totalAmount: 0 });
      setShowCart(false);
      // Refresh menu to show updated quantities
      getFoodItems(user.token)
        .then(({ data }) => setItems(data))
        .catch(() => {});
      alert("Order confirmed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm order");
    }
  };

  const menuOfTheDay = items.filter(item => item.isMenuOfTheDay && item.quantityAvailable > 0);
  const regularItems = items.filter(item => !item.isMenuOfTheDay && item.quantityAvailable > 0);

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Menu</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span>Cart: {cart.items.length} items (${cart.totalAmount.toFixed(2)})</span>
          <button 
            onClick={() => setShowCart(!showCart)}
            style={{ padding: "8px 16px", backgroundColor: "#2C3E50", color: "white", border: "none", borderRadius: "4px" }}
          >
            {showCart ? "Hide Cart" : "View Cart"}
          </button>
        </div>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {menuOfTheDay.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ color: "#2C3E50", borderBottom: "2px solid #34495E", paddingBottom: "8px" }}>
            🌟 Menu of the Day
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", backgroundColor: "#34495E", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ backgroundColor: "#2C3E50" }}>
                <th style={{ textAlign: "left", borderBottom: "1px solid #4A5F7A", padding: "12px", color: "white" }}>Name</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #4A5F7A", padding: "12px", color: "white" }}>Price</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #4A5F7A", padding: "12px", color: "white" }}>Description</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid #4A5F7A", padding: "12px", color: "white" }}>Quantity</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid #4A5F7A", padding: "12px", color: "white" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {menuOfTheDay.map((it) => (
                <tr key={it._id} style={{ backgroundColor: "#34495E" }}>
                  <td style={{ padding: "12px", fontWeight: "bold", color: "white" }}>{it.name}</td>
                  <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#E8F4FD" }}>${it.price}</td>
                  <td style={{ padding: "12px", color: "#BDC3C7" }}>{(it.description && it.description.trim()) ? it.description : "-"}</td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", color: "#BDC3C7" }}>
                        In Cart: {getCurrentCartQuantity(it._id)}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={getAvailableQuantity(it._id, it.quantityAvailable)}
                        value={quantities[it._id] || ""}
                        onChange={(e) => handleQuantityChange(it._id, parseInt(e.target.value) || 0)}
                        style={{ width: "60px", padding: "4px", textAlign: "center" }}
                        placeholder="Qty"
                      />
                    </div>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleAddToCart(it._id, quantities[it._id] || 1)}
                        disabled={!quantities[it._id] || quantities[it._id] <= 0 || getAvailableQuantity(it._id, it.quantityAvailable) <= 0}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: getCurrentCartQuantity(it._id) > 0 ? "#3498DB" : "#27AE60",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        {getCurrentCartQuantity(it._id) > 0 ? "Add More" : "Add"}
                      </button>
                      {getCurrentCartQuantity(it._id) > 0 && (
                        <button
                          onClick={() => handleSubtractFromCart(it._id, quantities[it._id] || 1)}
                          disabled={!quantities[it._id] || quantities[it._id] <= 0}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Subtract
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {regularItems.length > 0 && (
        <div>
          <h3>All Items</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Item ID</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Name</th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ddd" }}>Price</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Category</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Description</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>Quantity</th>
                <th style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {regularItems.map((it) => (
                <tr key={it._id}>
                  <td style={{ padding: 6 }}>{it.itemId}</td>
                  <td style={{ padding: 6 }}>{it.name}</td>
                  <td style={{ padding: 6, textAlign: "right" }}>{it.price}</td>
                  <td style={{ padding: 6 }}>{it.category || "-"}</td>
                  <td style={{ padding: 6 }}>{(it.description && it.description.trim()) ? it.description : "-"}</td>
                  <td style={{ padding: 6, textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        In Cart: {getCurrentCartQuantity(it._id)}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={getAvailableQuantity(it._id, it.quantityAvailable)}
                        value={quantities[it._id] || ""}
                        onChange={(e) => handleQuantityChange(it._id, parseInt(e.target.value) || 0)}
                        style={{ width: "60px", padding: "4px", textAlign: "center" }}
                        placeholder="Qty"
                      />
                    </div>
                  </td>
                  <td style={{ padding: 6, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleAddToCart(it._id, quantities[it._id] || 1)}
                        disabled={!quantities[it._id] || quantities[it._id] <= 0 || getAvailableQuantity(it._id, it.quantityAvailable) <= 0}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: getCurrentCartQuantity(it._id) > 0 ? "#3498DB" : "#27AE60",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        {getCurrentCartQuantity(it._id) > 0 ? "Add More" : "Add"}
                      </button>
                      {getCurrentCartQuantity(it._id) > 0 && (
                        <button
                          onClick={() => handleSubtractFromCart(it._id, quantities[it._id] || 1)}
                          disabled={!quantities[it._id] || quantities[it._id] <= 0}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Subtract
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length === 0 && (
        <p>No items available.</p>
      )}

      {showCart && (
        <div style={{ marginTop: "32px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
          <h3>Shopping Cart</h3>
          {cart.items.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Item</th>
                    <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>Price</th>
                    <th style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #ddd" }}>Quantity</th>
                    <th style={{ textAlign: "right", padding: "8px", borderBottom: "1px solid #ddd" }}>Total</th>
                    <th style={{ textAlign: "center", padding: "8px", borderBottom: "1px solid #ddd" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.foodItem._id}>
                      <td style={{ padding: "8px" }}>{item.name}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>${item.price}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <input
                          type="number"
                          min="1"
                          max={item.foodItem.quantityAvailable}
                          value={item.quantity}
                          onChange={(e) => handleUpdateCartItem(item.foodItem._id, parseInt(e.target.value) || 0)}
                          style={{ width: "60px", padding: "4px", textAlign: "center" }}
                        />
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>${(item.price * item.quantity).toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <button
                          onClick={() => handleUpdateCartItem(item.foodItem._id, 0)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "right", marginBottom: "16px" }}>
                <strong>Total: ${cart.totalAmount.toFixed(2)}</strong>
              </div>
              <button
                onClick={handleConfirmOrder}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#27AE60",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Confirm Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerMenu;


