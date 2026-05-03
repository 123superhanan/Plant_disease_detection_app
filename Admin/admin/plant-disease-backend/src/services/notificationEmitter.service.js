const EventEmitter = require('events');
const logger = require('../config/logger');

class NotificationEmitter extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  setupListeners() {
    this.on('notification.created', (notification) => {
      logger.debug(`Notification created event: ${notification._id}`);
    });

    this.on('notification.dispatch', async ({ notification, recipients }) => {
      logger.info(`Dispatching notification ${notification._id} to ${recipients.length} recipients`);
    });
  }
}

module.exports = new NotificationEmitter();