import mongoose from "mongoose";

// const uri = process.env.MONGO_URI;
const uri = process.env.MONGO_CLUSTER_URL;

if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable inside .env.local");
}

const globalWithMongoose = globalThis;
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

const connectDb = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDb;