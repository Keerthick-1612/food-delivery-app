import { getOrderNotifier } from "./OrderNotifier.js";
import { EmailNotifier } from "./EmailNotifier.js";

/**
 * Initialize and register all notification observers
 * This should be called when the server starts
 */
export const initializeNotifiers = () => {
  const notifier = getOrderNotifier();

  // Register Email Notifier
  const emailNotifier = new EmailNotifier();
  notifier.attach(emailNotifier);

  console.log("✅ Notification observers initialized");
  console.log(`📋 Registered observers: ${notifier.getObservers().join(", ")}`);

  return notifier;
};

