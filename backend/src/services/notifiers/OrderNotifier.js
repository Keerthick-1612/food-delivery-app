import { Observer } from "./Observer.js";

/**
 * Order Notifier - Subject in Observer Pattern
 * Manages observers and notifies them when order events occur
 */
class OrderNotifier {
  constructor() {
    this.observers = [];
  }

  /**
   * Attach an observer to the notifier
   * @param {Observer} observer - The observer to attach
   */
  attach(observer) {
    if (!(observer instanceof Observer)) {
      throw new Error("Observer must be an instance of Observer class");
    }
    
    const exists = this.observers.some(obs => obs.getName() === observer.getName());
    if (!exists) {
      this.observers.push(observer);
      console.log(`✅ Observer attached: ${observer.getName()}`);
    } else {
      console.log(`⚠️ Observer already exists: ${observer.getName()}`);
    }
  }

  /**
   * Detach an observer from the notifier
   * @param {Observer} observer - The observer to detach
   */
  detach(observer) {
    const index = this.observers.findIndex(obs => obs.getName() === observer.getName());
    if (index !== -1) {
      this.observers.splice(index, 1);
      console.log(`✅ Observer detached: ${observer.getName()}`);
    }
  }

  /**
   * Notify all observers about an order event
   * @param {Object} eventData - The event data
   * @param {Object} eventData.order - The order object
   * @param {string} eventData.userEmail - User's email address
   * @param {string} eventData.userName - User's name
   * @param {string} eventData.eventType - Type of event
   */
  async notifyObservers(eventData) {
    if (!eventData.order || !eventData.userEmail) {
      console.warn("⚠️ Invalid event data provided to notifyObservers");
      return;
    }

    console.log(`📢 Notifying ${this.observers.length} observer(s) about event: ${eventData.eventType}`);

    // Notify all observers asynchronously (don't block if one fails)
    const notifications = this.observers.map(async (observer) => {
      try {
        await observer.notify(eventData);
      } catch (error) {
        console.error(`❌ Observer ${observer.getName()} failed:`, error.message);
        // Don't throw - allow other observers to be notified
      }
    });

    // Wait for all notifications to complete (but don't fail if some fail)
    await Promise.allSettled(notifications);
  }

  /**
   * Get list of attached observers
   * @returns {Array<string>} Array of observer names
   */
  getObservers() {
    return this.observers.map(obs => obs.getName());
  }

  /**
   * Clear all observers
   */
  clear() {
    this.observers = [];
    console.log("✅ All observers cleared");
  }
}

// Singleton instance
let instance = null;

/**
 * Get singleton instance of OrderNotifier
 * @returns {OrderNotifier}
 */
export const getOrderNotifier = () => {
  if (!instance) {
    instance = new OrderNotifier();
  }
  return instance;
};

export default OrderNotifier;

