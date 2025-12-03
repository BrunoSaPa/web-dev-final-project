import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://brunosanchezpadilla_db_user:p591UQoT4VAtlLHF@cluster0.p69lvah.mongodb.net/especies?appName=Cluster0';

// DEBUG: Log which URI is being used
console.log('Express: Using MONGODB_URI:', MONGODB_URI.substring(0, 50) + '...');

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env file');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}