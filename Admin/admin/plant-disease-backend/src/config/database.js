const mongoose = require('mongoose');
const logger = require('./logger');

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Using existing database connection');
      return;
    }

    try {
      const mongoURI = process.env.MONGODB_URI;
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4
      };

      await mongoose.connect(mongoURI, options);
      
      this.isConnected = true;
      logger.info('MongoDB connected successfully');
      
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting MongoDB:', error);
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

module.exports = new Database();