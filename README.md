# GatorSwamp

A full-stack housing management application built with React and Go.

## 🏗 Project Structure

```
GatorSwamp/
├── frontend/     # React application
│   ├── src/     # Source code
│   └── public/  # Static assets
└── backend/     # Go backend service
    ├── config/      # Configuration
    ├── controllers/ # Request handlers
    ├── models/      # Data models
    ├── routes/      # API routes
    ├── services/    # Business logic
    └── utils/       # Utilities
```

## 💻 Tech Stack

### Frontend
- React 19
- Vite 6
- TailwindCSS 4
- MapLibre GL for interactive maps
- HeadlessUI for accessible components
- React Router for navigation

### Backend
- Go 1.24.2
- Gorilla Mux for routing
- MongoDB for database
- JWT for authentication
- CORS support
- Environment-based configuration

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS version)
- Go 1.24.2
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Create a `.env` file with:
   ```
   PORT=5500
   MONGO_URI=your_mongodb_uri
   DB_NAME=Gator-Homes
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   go run main.go
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5500

## 🔧 Development

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Features
- RESTful API endpoints
- JWT authentication
- MongoDB integration
- CORS configuration
- Environment variable support
- Static file serving for frontend

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The build output will be in the `dist` directory.

### Backend
```bash
cd backend
go build -o gatorswamp
```

## 🔒 Security Features
- JWT-based authentication
- Secure password hashing with bcrypt
- CORS protection
- Environment-based configuration
- Input validation

## 📚 API Routes

The backend provides the following API endpoints:
- `/api/users/*` - User management
- `/api/housing/*` - Housing listings
- `/api/requests/*` - Request handling
