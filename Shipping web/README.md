# Shipping Tracking System

A comprehensive shipping tracking system with admin dashboard and public tracking functionality.

## Features

### User Roles
- **Super Admin**: Full system access, manage other admins, view analytics
- **Admin**: Create/manage shipments, update tracking history, manage statuses
- **Public User**: Track shipment using Cargo ID, view shipment details and timeline

### Authentication & Security
- JWT authentication
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Protected admin routes
- Rate limiting on tracking endpoint
- Input validation & sanitization
- CORS protection

### Shipment Management
- Create shipments with auto-generated unique Cargo IDs
- Manual override of Cargo ID (ensures uniqueness)
- Comprehensive shipment details (sender, receiver, route, weight, type, etc.)
- Real-time tracking history with timestamps
- Status management and updates
- Delete shipments functionality

### Tracking History
- Each update creates a new tracking entry
- Timeline view with chronological order
- Visual progress indicators
- Delivery stage indicators

### Public Tracking Page
- Cargo ID lookup
- Shipment details display
- Estimated delivery date
- Current location and status
- Full tracking timeline
- "Cargo ID Not Found" error handling
- Loading animations
- Mobile-responsive design

### Admin Dashboard
- Total shipments counter
- In Transit, Delivered, On Hold counts
- Recent shipments table
- Shipment search & filter
- Analytics charts
- Export to CSV functionality

### Notification System
- Email notifications for shipment creation
- Status change notifications
- Delivery confirmation emails
- SMS-ready structure (Twilio integration)

### Technical Implementation
- **Frontend**: React with TypeScript, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js, MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Architecture**: REST API with clean separation of concerns

## Installation

Due to system execution policy restrictions, npm commands may be blocked. You may need to adjust your execution policy or run the following commands in an elevated Command Prompt or PowerShell with administrative privileges.

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with environment variables:
   ```
   # Database
   MONGODB_URI=mongodb://localhost:27017/shipping_tracking

   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # Server
   PORT=5000

   # Email (for notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Rate limiting
   TRACKING_RATE_LIMIT_WINDOW_MS=900000
   TRACKING_RATE_LIMIT_MAX=100
   ```
4. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Install additional required packages:
   ```
   npm install react-router-dom axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   npm install @types/node @types/react @types/react-dom @types/react-router-dom
   ```
4. Create `.env` file with environment variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
5. Start the development server: `npm start`

### Troubleshooting

If you encounter execution policy errors on Windows:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Confirm with `Y` when prompted

If npm is still blocked, you can also run the setup.bat file provided in the frontend directory.

## Usage

### Admin Login
- Super Admin: Can create other admins and manage the system
- Admin: Can create and manage shipments

### Public Tracking
- Visit the home page
- Enter a valid Cargo ID to track a shipment
- View detailed shipment information and tracking history

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Admin registration (requires super admin token)

### Shipments
- `GET /api/shipments` - Get all shipments (admin only)
- `POST /api/shipments` - Create new shipment (admin only)
- `GET /api/shipments/:cargoId` - Get specific shipment (admin only)
- `PUT /api/shipments/:cargoId` - Update shipment (admin only)
- `DELETE /api/shipments/:cargoId` - Delete shipment (admin only)
- `PATCH /api/shipments/:cargoId/deliver` - Mark as delivered (admin only)
- `GET /api/shipments/stats/dashboard` - Get dashboard stats (admin only)

### Tracking
- `GET /api/tracking/:cargoId` - Public tracking by Cargo ID
- `GET /api/tracking/export/csv` - Export shipments to CSV (admin only)

## Project Structure

```
shipping-tracking/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Shipment.js
│   ├── controllers/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── shipments.js
│   │   └── tracking.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── rateLimiter.js
│   ├── config/
│   │   └── db.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── notifications.js
│   ├── .env
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── contexts/
    │   ├── App.js
    │   └── index.js
    ├── .env
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.