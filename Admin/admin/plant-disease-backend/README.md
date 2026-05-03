# Plant Disease Detection System - Backend API

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create .env file from .env.example:
```bash
cp .env.example .env
```

3. Start MongoDB locally or use MongoDB Atlas

4. Run the application:
```bash
npm run dev
```

## API Endpoints

### Admin Module
- POST /api/v1/admin - Create admin
- GET /api/v1/admin - Get all admins
- GET /api/v1/admin/:id - Get admin by ID
- PUT /api/v1/admin/:id - Update admin
- DELETE /api/v1/admin/:id - Delete admin
- PATCH /api/v1/admin/:id/status - Update status
- PATCH /api/v1/admin/:id/permissions - Update permissions

### Notification Module
- POST /api/v1/notifications - Create notification
- GET /api/v1/notifications - Get notifications
- POST /api/v1/notifications/:id/send - Send notification
- PATCH /api/v1/notifications/:id/read - Mark as read
- GET /api/v1/notifications/unread-count - Get unread count

### Auth Module
- POST /api/v1/auth/login - Admin login
- GET /api/v1/auth/me - Get current admin
- POST /api/v1/auth/change-password - Change password

## Default Admin Credentials
Email: admin@plantdisease.com
Password: Admin@123456