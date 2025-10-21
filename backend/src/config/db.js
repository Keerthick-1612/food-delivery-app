import mongoose from "mongoose";

let cachedConnection = null;
let connectingPromise = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  if (connectingPromise) return connectingPromise;

  connectingPromise = mongoose
    .connect(process.env.MONGO_URI)
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
