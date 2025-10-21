import React from "react";

function Footer() {
  return (
    <footer className="hotel-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="footer-name">AIT Grand Palace Hotel</h2>
          <p className="footer-tagline">Where Culinary Excellence Meets Luxury</p>
        </div>
        
        <div className="footer-info">
          <div className="footer-section">
            <h4>📍 Location</h4>
            <p>123 Luxury Avenue</p>
            <p>Downtown District</p>
            <p>City, State 12345</p>
          </div>
          
          <div className="footer-section">
            <h4>📞 Contact</h4>
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@grandpalace.com</p>
            <p>Reservations: (555) 123-4568</p>
          </div>
          
          <div className="footer-section">
            <h4>🕒 Hours</h4>
            <p>Breakfast: 7:00 AM - 11:00 AM</p>
            <p>Lunch: 11:30 AM - 3:00 PM</p>
            <p>Dinner: 5:00 PM - 10:00 PM</p>
          </div>
          
          <div className="footer-section">
            <h4>🌟 Services</h4>
            <p>Fine Dining</p>
            <p>Room Service</p>
            <p>Catering Events</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Grand Palace Hotel. All rights reserved. | Crafted with ❤️ for exceptional dining experiences.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
