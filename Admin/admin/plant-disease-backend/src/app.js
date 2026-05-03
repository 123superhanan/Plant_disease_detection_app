const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { limiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const logger = require('./config/logger');

const adminRoutes = require('./modules/admin/admin.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', limiter);

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;