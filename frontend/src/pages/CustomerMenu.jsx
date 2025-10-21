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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, cartResponse] = await Promise.all([
        getFoodItems(user.token),
        getCart(user.token)
      ]);
      setItems(itemsResponse.data);
      setCart(cartResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

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
      await handleUpdateCartItem(itemId, 0);
    } else {
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
      await loadData();
      alert("Order confirmed successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to confirm order");
    }
  };

  const menuOfTheDay = items.filter(item => item.isMenuOfTheDay && item.quantityAvailable > 0);
  const regularItems = items.filter(item => !item.isMenuOfTheDay && item.quantityAvailable > 0);

  if (loading) {
    return (
      <div className="container">
        <div className="page-container">
          <div className="empty-state">
            <div className="loading-spinner" style={{ width: "40px", height: "40px", margin: "0 auto var(--spacing-4)" }}></div>
            <div className="empty-state-title">Loading Menu...</div>
            <div className="empty-state-description">Please wait while we fetch the latest menu items</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🍽️ Grand Palace Menu</h1>
        <p className="page-subtitle">Experience our exquisite culinary offerings crafted by world-class chefs</p>
      </div>

      <div style={{ maxWidth: "1400px", width: "100%" }}>
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

        {/* Enhanced Cart Summary */}
        <div className="cart-summary" style={{ 
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
          border: "2px solid #fbbf24",
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          backdropFilter: "blur(10px)"
        }}>
          <div className="cart-header">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="cart-title" style={{ color: "#7f1d1d" }}>🛒 Your Order</h2>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginTop: "var(--spacing-1)" }}>
                  Ready to place your order?
                </div>
              </div>
              <div className="text-right">
                <div className="cart-total" style={{ fontSize: "var(--font-size-2xl)", fontWeight: "700" }}>
                  ₹{cart.totalAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setShowCart(!showCart)}
                className="btn btn-outline"
                style={{ 
                  borderColor: "#7f1d1d", 
                  color: "#7f1d1d",
                  fontWeight: "600"
                }}
              >
                {showCart ? "📋 Hide Details" : "📋 View Details"}
              </button>
            </div>
            
            {cart.items.length > 0 && (
              <div className="flex gap-3 items-center">
                <div style={{ 
                  fontSize: "var(--font-size-sm)", 
                  color: "var(--text-secondary)",
                  textAlign: "right"
                }}>
                  <div>Ready to order?</div>
                  <div style={{ fontWeight: "600", color: "#7f1d1d" }}>
                    Click to place order
                  </div>
                </div>
                <button
                  onClick={handleConfirmOrder}
                  className="btn btn-success btn-lg"
                  style={{ 
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "700",
                    padding: "var(--spacing-4) var(--spacing-8)",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
                  }}
                >
                  🚀 Place Order
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu Table View */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ margin: 0, color: "var(--hotel-burgundy)", fontSize: "var(--font-size-xl)" }}>🍽️ Complete Menu</h3>
          </div>
          <div className="card-body">
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th className="text-right">Price</th>
                    <th className="text-center">Available</th>
                    <th className="text-center">In Cart</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Menu of the Day Items */}
                  {menuOfTheDay.map((item) => (
                    <tr key={item._id} style={{ backgroundColor: "var(--hotel-cream)" }}>
                      <td>
                        <div>
                          <strong style={{ color: "var(--hotel-burgundy)" }}>{item.name}</strong>
                          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--hotel-gold)", fontWeight: "600" }}>
                            ⭐ Chef's Special
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                          {item.description || "Delicious food item"}
                        </span>
                      </td>
                      <td className="text-right">
                        <span style={{ fontWeight: "600", color: "var(--hotel-gold)", fontSize: "var(--font-size-lg)" }}>
                          ₹{item.price}
                        </span>
                      </td>
                      <td className="text-center">
                        <span style={{ 
                          fontWeight: "600", 
                          color: item.quantityAvailable < 10 ? "var(--danger-color)" : "var(--success-color)" 
                        }}>
                          {item.quantityAvailable}
                        </span>
                      </td>
                      <td className="text-center">
                        <span style={{ fontWeight: "600", color: "var(--primary-color)" }}>
                          {getCurrentCartQuantity(item._id)}
                        </span>
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          min="1"
                          max={getAvailableQuantity(item._id, item.quantityAvailable)}
                          value={quantities[item._id] || ""}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 0)}
                          className="quantity-input"
                          placeholder="Qty"
                          disabled={getAvailableQuantity(item._id, item.quantityAvailable) <= 0}
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td className="text-center">
                        <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "center" }}>
                          <button
                            onClick={() => handleAddToCart(item._id, quantities[item._id] || 1)}
                            disabled={!quantities[item._id] || quantities[item._id] <= 0 || getAvailableQuantity(item._id, item.quantityAvailable) <= 0}
                            className={`btn btn-sm ${getCurrentCartQuantity(item._id) > 0 ? 'btn-secondary' : 'btn-success'}`}
                          >
                            {getCurrentCartQuantity(item._id) > 0 ? "Add More" : "Add"}
                          </button>
                          
                          {getCurrentCartQuantity(item._id) > 0 && (
                            <button
                              onClick={() => handleSubtractFromCart(item._id, quantities[item._id] || 1)}
                              disabled={!quantities[item._id] || quantities[item._id] <= 0}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Regular Menu Items */}
                  {regularItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong style={{ color: "var(--hotel-burgundy)" }}>{item.name}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                          {item.description || "Delicious food item"}
                        </span>
                      </td>
                      <td className="text-right">
                        <span style={{ fontWeight: "600", color: "var(--hotel-gold)", fontSize: "var(--font-size-lg)" }}>
                          ₹{item.price}
                        </span>
                      </td>
                      <td className="text-center">
                        <span style={{ 
                          fontWeight: "600", 
                          color: item.quantityAvailable < 10 ? "var(--danger-color)" : "var(--success-color)" 
                        }}>
                          {item.quantityAvailable}
                        </span>
                      </td>
                      <td className="text-center">
                        <span style={{ fontWeight: "600", color: "var(--primary-color)" }}>
                          {getCurrentCartQuantity(item._id)}
                        </span>
                      </td>
                      <td className="text-center">
                        <input
                          type="number"
                          min="1"
                          max={getAvailableQuantity(item._id, item.quantityAvailable)}
                          value={quantities[item._id] || ""}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 0)}
                          className="quantity-input"
                          placeholder="Qty"
                          disabled={getAvailableQuantity(item._id, item.quantityAvailable) <= 0}
                          style={{ width: "80px" }}
                        />
                      </td>
                      <td className="text-center">
                        <div style={{ display: "flex", gap: "var(--spacing-2)", justifyContent: "center" }}>
                          <button
                            onClick={() => handleAddToCart(item._id, quantities[item._id] || 1)}
                            disabled={!quantities[item._id] || quantities[item._id] <= 0 || getAvailableQuantity(item._id, item.quantityAvailable) <= 0}
                            className={`btn btn-sm ${getCurrentCartQuantity(item._id) > 0 ? 'btn-secondary' : 'btn-success'}`}
                          >
                            {getCurrentCartQuantity(item._id) > 0 ? "Add More" : "Add"}
                          </button>
                          
                          {getCurrentCartQuantity(item._id) > 0 && (
                            <button
                              onClick={() => handleSubtractFromCart(item._id, quantities[item._id] || 1)}
                              disabled={!quantities[item._id] || quantities[item._id] <= 0}
                              className="btn btn-sm btn-danger"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <div className="empty-state-title">Menu Coming Soon</div>
            <div className="empty-state-description">
              Our chefs are preparing an extraordinary culinary experience. Please check back soon for our exquisite menu offerings.
            </div>
          </div>
        )}

        {/* Enhanced Cart Details Modal */}
        {showCart && cart.items.length > 0 && (
          <div className="cart-summary" style={{ 
            marginTop: "var(--spacing-8)",
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
            border: "2px solid #fbbf24",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <div className="cart-header">
              <div className="flex justify-between items-center">
                <h3 className="cart-title" style={{ color: "var(--hotel-burgundy)" }}>📋 Order Summary</h3>
                <div style={{ 
                  fontSize: "var(--font-size-sm)", 
                  color: "var(--text-secondary)",
                  textAlign: "right"
                }}>
                  <div>Review your order before placing</div>
                  <div style={{ fontWeight: "600", color: "var(--hotel-burgundy)" }}>
                    Total: ₹{cart.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: "var(--spacing-6)" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ boxShadow: "var(--shadow-md)" }}>
                  <thead>
                    <tr style={{ background: "var(--hotel-burgundy)", color: "white" }}>
                      <th style={{ color: "white" }}>Item</th>
                      <th className="text-right" style={{ color: "white" }}>Price</th>
                      <th className="text-center" style={{ color: "white" }}>Quantity</th>
                      <th className="text-right" style={{ color: "white" }}>Total</th>
                      <th className="text-center" style={{ color: "white" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.foodItem._id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: "600", color: "var(--hotel-burgundy)", fontSize: "var(--font-size-lg)" }}>
                              {item.name}
                            </div>
                            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                              Available: {item.foodItem.quantityAvailable} units
                            </div>
                          </div>
                        </td>
                        <td className="text-right">
                          <span style={{ fontWeight: "600", color: "var(--hotel-gold)", fontSize: "var(--font-size-lg)" }}>
                            ₹{item.price}
                          </span>
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="1"
                            max={item.foodItem.quantityAvailable}
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartItem(item.foodItem._id, parseInt(e.target.value) || 0)}
                            className="quantity-input"
                            style={{ width: "80px", textAlign: "center" }}
                          />
                        </td>
                        <td className="text-right">
                          <span style={{ fontWeight: "700", color: "var(--hotel-burgundy)", fontSize: "var(--font-size-lg)" }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleUpdateCartItem(item.foodItem._id, 0)}
                            className="btn btn-sm btn-danger"
                            style={{ fontWeight: "600" }}
                          >
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between items-center" style={{ 
              padding: "var(--spacing-6)", 
              background: "var(--bg-secondary)", 
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)"
            }}>
              <div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
                  Order Summary
                </div>
                <div style={{ fontSize: "var(--font-size-xl)", fontWeight: "700", color: "var(--hotel-burgundy)" }}>
                  Total: ${cart.totalAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-secondary)", marginTop: "var(--spacing-1)" }}>
                  {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCart(false)}
                  className="btn btn-outline"
                  style={{ fontWeight: "600" }}
                >
                  📋 Close Details
                </button>
                <button
                  onClick={handleConfirmOrder}
                  className="btn btn-success btn-lg"
                  style={{ 
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "700",
                    padding: "var(--spacing-4) var(--spacing-8)",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
                  }}
                >
                  🚀 Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerMenu;


