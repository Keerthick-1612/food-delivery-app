export class UserFactory {
  static createPayload(input) {
    if (!input) throw new Error("No input provided");
    const { name, email, password, role } = input;
    if (!name || !email || !password) {
      throw new Error("name, email, password are required");
    }
    const normalizedRole = role === "admin" ? "admin" : "customer";
    return {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),
      role: normalizedRole,
    };
  }
}












