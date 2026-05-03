const dotenv = require('dotenv');
const app = require('./app');
const database = require('./config/database');
const logger = require('./config/logger');

dotenv.config();

const PORT = process.env.PORT || 5000;
let server;

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(error.name, error.message, error.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    await database.connect();
    
    // Create default admin if not exists
    const Admin = require('./models/Admin.model');
    const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists && process.env.ADMIN_EMAIL) {
      await Admin.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'super_admin',
        permissions: ['manage_users', 'manage_diseases', 'manage_predictions', 'manage_notifications', 'view_reports'],
        isActive: true
      });
      logger.info('Default admin created successfully');
      logger.info(`Admin Email: ${process.env.ADMIN_EMAIL}`);
      logger.info(`Admin Password: ${process.env.ADMIN_PASSWORD}`);
    }
    
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(error.name, error.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully');
  server.close(async () => {
    await database.disconnect();
    logger.info('💥 Process terminated!');
  });
});