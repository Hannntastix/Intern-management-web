// import { MongoClient } from 'mongodb';

// if (!process.env.MONGODB_URI) {
//   throw new Error('Please define MONGODB_URI environment variable');
// }

// const uri = process.env.MONGODB_URI;
// const options = {
//   useUnifiedTopology: true,
//   useNewUrlParser: true,
// };

// let client;
// let clientPromise;

// if (process.env.NODE_ENV === 'development') {
//   if (!global._mongoClientPromise) {
//     client = new MongoClient(uri, options);
//     global._mongoClientPromise = client.connect();
//   }
//   clientPromise = global._mongoClientPromise;
// } else {
//   client = new MongoClient(uri, options);
//   clientPromise = client.connect();
// }

// export default clientPromise;

import mongoose from "mongoose"

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("MongoDB Connection Error:", error)
    }
}

export default connectMongoDB;