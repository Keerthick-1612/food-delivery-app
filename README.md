# Food Delivery Application

A full-stack food delivery application built with React frontend and Node.js backend.

## Project Structure

```
food_delivery/
├── backend/                    # Node.js backend API
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── controllers/       # API controllers
│   │   │   ├── foodController.js
│   │   │   ├── orderController.js
│   │   │   └── userController.js
│   │   ├── factories/         # Data validation factories
│   │   │   ├── FoodItemFactory.js
│   │   │   └── UserFactory.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── decorators.js
│   │   ├── models/            # MongoDB models
│   │   │   ├── Counter.js
│   │   │   ├── FoodItem.js
│   │   │   ├── Order.js
│   │   │   └── User.js
│   │   ├── routes/            # API routes
│   │   │   └── api.js
│   │   └── services/         # Business logic services
│   │       ├── emailService.js
│   │       ├── MenuOfTheDayManager.js
│   │       └── notifiers/    # Observer pattern for notifications
│   │           ├── Observer.js
│   │           ├── OrderNotifier.js
│   │           ├── EmailNotifier.js
│   │           └── initializeNotifiers.js
│   ├── migrations/           # Database migrations
│   ├── server.js             # Main server file
│   └── package.json
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── api/              # API integration
│   │   │   ├── authApi.js
│   │   │   ├── cartApi.js
│   │   │   └── foodApi.js
│   │   ├── components/       # React components
│   │   │   ├── BackButton.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Profile.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CustomerMenu.jsx
│   │   │   ├── CustomerOrderHistory.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OrderDashboard.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Features

### User Management
- User authentication and registration (JWT-based)
- Role-based access control (Admin/Customer)
- User profile management

### Food Menu Management
- CRUD operations for food items (Admin only)
- Menu of the Day feature (single featured item)
- Stock management with quantity tracking
- Cooking time tracking for each item
- Category and description support
- Duplicate name prevention (case-insensitive)

### Order Management
- Shopping cart functionality
- Order placement and confirmation
- Order queue with priority rules
- Order status tracking (pending, confirmed, preparing, ready, delivered)
- Stock validation and automatic deduction
- Order history for customers and admins

### Notifications (Observer Pattern)
- Email notifications on order confirmation
- Extensible notification system
- Gmail SMTP integration
- HTML email templates with order details

### Admin Features
- Food item management
- Order queue management
- Order history view
- Mark orders as served
- Priority-based order processing

### Customer Features
- Browse menu items
- Add/remove items from cart
- View cart and update quantities
- Place orders
- View order history

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in `backend/` directory:
   ```env
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/food-delivery

   # JWT Secret
   JWT_SECRET=your-secret-key-change-this

   # Server Port
   PORT=5000

   # Gmail SMTP Configuration (for email notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   EMAIL_FROM=your-email@gmail.com
   EMAIL_FROM_NAME=Food Delivery App
   ```

4. **Gmail App Password Setup** (for email notifications):
   - Enable 2-Step Verification on your Gmail account
   - Go to https://myaccount.google.com/apppasswords
   - Generate App Password for "Mail"
   - Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

5. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication (jsonwebtoken)
- **bcryptjs** - Password hashing
- **nodemailer** - Email notifications
- **dotenv** - Environment variables

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **CSS3** - Styling

### Design Patterns
- **Observer Pattern** - Notification system (extensible for SMS, Push, etc.)
- **Singleton Pattern** - MenuOfTheDayManager, OrderNotifier
- **Factory Pattern** - Data validation factories

## Architecture Highlights

### Observer Pattern for Notifications
The application uses the Observer pattern for notifications, making it easy to add new notification types without modifying existing code:

- **OrderNotifier** (Subject) - Manages and notifies observers
- **EmailNotifier** (Observer) - Handles email notifications
- Easily extensible for SMS, Push notifications, Slack, etc.

See `OBSERVER_PATTERN_IMPLEMENTATION.md` for detailed documentation.

### Order Queue System
- Priority-based ordering with intelligent queue management
- Orders can move ahead based on cooking time differences
- Automatic sorting and status management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
