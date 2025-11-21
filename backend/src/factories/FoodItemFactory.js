export class FoodItemFactory {
  static createPayload(input) {
    if (!input) throw new Error("No input provided");
    const { name, price, quantityAvailable, description, category, cookingTime, isAvailable } = input;
    if (!name || price == null || quantityAvailable == null) {
      throw new Error("name, price, quantityAvailable are required");
    }

    // Convert to numbers
    const numPrice = Number(price);
    const numQuantityAvailable = Number(quantityAvailable);
    const numCookingTime = cookingTime != null ? Number(cookingTime) : 5;

    // Validate for negative values, NaN, and provide specific error messages
    const negativeFields = [];
    if (isNaN(numPrice) || numPrice < 0) negativeFields.push("price");
    if (isNaN(numQuantityAvailable) || numQuantityAvailable < 0) negativeFields.push("quantityAvailable");
    if (cookingTime != null && (isNaN(numCookingTime) || numCookingTime < 1)) {
      negativeFields.push("cookingTime (must be at least 1)");
    }

    if (negativeFields.length > 0) {
      const fieldList = negativeFields.join(", ");
      throw new Error(`Negative or invalid values not allowed for: ${fieldList}`);
    }

    return {
      name: String(name).trim(),
      price: numPrice,
      quantityAvailable: numQuantityAvailable,
      description: description ? String(description).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      cookingTime: numCookingTime,
      isAvailable: isAvailable == null ? true : Boolean(isAvailable),
    };
  }
}







