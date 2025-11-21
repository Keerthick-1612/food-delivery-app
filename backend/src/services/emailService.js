import nodemailer from "nodemailer";

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // App Password from Gmail
    },
  });
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, userEmail, userName) => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn("Email configuration not found. Skipping email send.");
    return;
  }

  try {
    const transporter = createTransporter();

    // Build order items list
    const itemsList = order.items
      .map(
        (item, index) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    // Format order date
    const orderDate = new Date(order.createdAt || order.orderDate).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate estimated cooking time
    const estimatedTime = order.items.reduce((total, item) => {
      const cookingTime = item.foodItem?.cookingTime || 5;
      return Math.max(total, cookingTime);
    }, 0);

    // HTML email template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; }
        .total { font-size: 18px; font-weight: bold; color: #4CAF50; text-align: right; padding: 10px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍽️ Order Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello ${userName || "Customer"},</p>
          <p>Thank you for your order! We've received your order and it's being prepared.</p>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${order.status.toUpperCase()}</span></p>
          </div>

          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="total">Total Amount:</td>
                <td class="total">$${order.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="order-info">
            <p><strong>Estimated Cooking Time:</strong> ${estimatedTime} minutes</p>
            <p>We'll notify you when your order is ready!</p>
          </div>

          <p>If you have any questions, please contact us.</p>
          <p>Thank you for choosing our food delivery service!</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Food Delivery App</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
Order Confirmation

Hello ${userName || "Customer"},

Thank you for your order! We've received your order and it's being prepared.

Order Details:
- Order ID: ${order._id}
- Order Date: ${orderDate}
- Status: ${order.status.toUpperCase()}

Order Items:
${order.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.name} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)} - Subtotal: $${(item.price * item.quantity).toFixed(2)}`
  )
  .join("\n")}

Total Amount: $${order.totalAmount.toFixed(2)}
Estimated Cooking Time: ${estimatedTime} minutes

We'll notify you when your order is ready!

Thank you for choosing our food delivery service!
    `;

    // Email options
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Food Delivery App"}" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - Order #${order._id.toString().slice(-6)}`,
      text: textContent,
      html: htmlContent,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${userEmail}:`, info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
    throw error;
  }
};

