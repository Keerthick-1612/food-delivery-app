# Food Delivery Application

A full-stack food delivery application built with React frontend and Node.js backend.

## Project Structure

```
food_delivery/
├── backend/          # Node.js backend API
│   ├── src/
│   │   ├── config/   # Database configuration
│   │   ├── controllers/ # API controllers
│   │   ├── models/   # Database models
│   │   ├── routes/   # API routes
│   │   └── services/ # Business logic services
│   └── server.js     # Main server file
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   └── api/       # API integration
│   └── public/        # Static assets
└── README.md
```

## Features

- User authentication and registration
- Food menu management
- Order placement and tracking
- Admin dashboard
- Customer interface
- Order history

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

3. Start the server:
   ```bash
   npm start
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
- Node.js
- Express.js
- MongoDB
- Mongoose

### Frontend
- React
- Vite
- CSS3

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
