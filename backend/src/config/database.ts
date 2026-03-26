// src/config/database.ts
export const dbConfig = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/manufacturing_management',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 5,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
    retryReads: true
  }
};
