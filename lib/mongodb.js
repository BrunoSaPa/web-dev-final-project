import mongoose from 'mongoose';

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunosanchezpadilla_db_user:p591UQoT4VAtlLHF@cluster0.p69lvah.mongodb.net/especies?appName=Cluster0';

// DEBUG: Log which URI is being used
console.log('Using MONGODB_URI:', MONGODB_URI.substring(0, 50) + '...');

// Validate that MongoDB URI is configured
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize global cache for MongoDB connection (prevents multiple connections)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// Function to connect to MongoDB with caching
export async function connectToDatabase() {
    // If connection already exists, return it
    if (cached.conn) {
        return cached.conn;
    }

    // If no connection promise exists, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        // Create connection promise
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    // Wait for connection to complete
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
