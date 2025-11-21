import { Observer } from "./Observer.js";
import { sendOrderConfirmationEmail } from "../emailService.js";

/**
 * Email Notifier - Concrete Observer implementation
 * Sends email notifications when order events occur
 */
export class EmailNotifier extends Observer {
  constructor() {
    super();
    this.name = "EmailNotifier";
  }

  /**
   * Get the name of this observer
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Notify via email
   * @param {Object} eventData - The event data
   * @param {Object} eventData.order - The order object
   * @param {string} eventData.userEmail - User's email address
   * @param {string} eventData.userName - User's name
   * @param {string} eventData.eventType - Type of event
   */
  async notify(eventData) {
    const { order, userEmail, userName, eventType } = eventData;

    // Only handle order_confirmed events for now
    // Can be extended for other event types (order_ready, order_delivered, etc.)
    if (eventType === "order_confirmed") {
      try {
        await sendOrderConfirmationEmail(order, userEmail, userName);
        console.log(`✅ Email notification sent to ${userEmail} for order ${order._id}`);
      } catch (error) {
        console.error(`❌ EmailNotifier failed to send email:`, error.message);
        throw error; // Re-throw to be caught by OrderNotifier
      }
    } else {
      console.log(`ℹ️ EmailNotifier ignoring event type: ${eventType}`);
    }
  }
}

