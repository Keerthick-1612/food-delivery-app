/**
 * Base Observer interface
 * All notification observers must implement this interface
 */
export class Observer {
  /**
   * Called when an order event occurs
   * @param {Object} eventData - The event data containing order, user, and event type
   * @param {Object} eventData.order - The order object
   * @param {string} eventData.userEmail - User's email address
   * @param {string} eventData.userName - User's name
   * @param {string} eventData.eventType - Type of event (e.g., 'order_confirmed', 'order_ready', etc.)
   */
  async notify(eventData) {
    throw new Error("notify() method must be implemented by subclass");
  }

  /**
   * Get the name/identifier of this observer
   * @returns {string}
   */
  getName() {
    throw new Error("getName() method must be implemented by subclass");
  }
}

