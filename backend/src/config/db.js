import mongoose from "mongoose";

let cachedConnection = null;
let connectingPromise = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/food-delivery";
  
  connectingPromise = mongoose
    .connect(mongoUri)
    .then((conn) => {
      cachedConnection = conn;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    })
    .finally(() => {
      connectingPromise = null;
    });

  return connectingPromise;
};

export default connectDB;
