export class FoodItemFactory {
  static createPayload(input) {
    if (!input) throw new Error("No input provided");
    const { name, price, quantityAvailable, description, category, isAvailable } = input;
    if (!name || price == null || quantityAvailable == null) {
      throw new Error("name, price, quantityAvailable are required");
    }
    return {
      name: String(name).trim(),
      price: Number(price),
      quantityAvailable: Number(quantityAvailable),
      description: description ? String(description).trim() : undefined,
      category: category ? String(category).trim() : undefined,
      isAvailable: isAvailable == null ? true : Boolean(isAvailable),
    };
  }
}



