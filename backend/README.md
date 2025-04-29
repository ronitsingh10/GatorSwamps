# GatorSwamp Backend

A Go-based backend service providing RESTful APIs for the GatorSwamp housing management application.

## Tech Stack

- **Language**: Go 1.24.2
- **Framework**: Gorilla Mux
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
backend/
├── config/         # Configuration and environment variables
├── controllers/    # Request handlers
├── middlewares/    # Custom middleware functions
├── models/         # Data models
├── routes/         # API route definitions
├── services/      # Business logic
└── utils/         # Utility functions
```

## Dependencies

- `github.com/gorilla/mux` - HTTP router and URL matcher
- `github.com/dgrijalva/jwt-go` - JWT authentication
- `go.mongodb.org/mongo-driver` - MongoDB driver
- `github.com/joho/godotenv` - Environment variable management
- `github.com/gorilla/handlers` - CORS and logging middleware
- `golang.org/x/crypto` - Cryptographic functions

## Setup

1. Install Go 1.24.2
2. Clone the repository
3. Install dependencies:
   ```bash
   go mod download
   ```

4. Create a `.env` file in the root directory:
   ```
   PORT=5500
   MONGO_URI=your_mongodb_uri
   DB_NAME=Gator-Homes
   JWT_SECRET=your_jwt_secret
   ```

## Development

Run the server:
```bash
go run main.go
```

The server will start on port 5500 (configurable via PORT environment variable).

## API Routes

All routes are prefixed with `/api`:

### User Management
- `/api/users/*` - User-related endpoints

### Housing
- `/api/housing/*` - Housing listing endpoints

### Requests
- `/api/requests/*` - Request management endpoints

## Features

- RESTful API architecture
- JWT authentication
- MongoDB integration
- CORS support
- Environment configuration
- Static file serving for frontend build

## Building for Production

```bash
go build -o gatorswamp
```

Run the binary:
```bash
./gatorswamp
```