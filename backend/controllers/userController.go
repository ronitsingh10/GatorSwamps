package controllers

import (
	// "context"
	"encoding/json"
	// "log"
	"net/http"
	"os"

	// "time"

	"gatorswamp/middlewares"
	"gatorswamp/models"
	"gatorswamp/services"

	// "github.com/gorilla/mux"
	// "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// UserController handles HTTP requests related to users
type UserController struct {
	userService *services.UserService
}

// LoginRequest for user login data
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// RegisterRequest for user registration data
type RegisterRequest struct {
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
	Email     string `json:"email" validate:"required,email"`
	Phone     string `json:"phone"`
	Password  string `json:"password" validate:"required,min=6"`
}

// NewUserController creates a new user controller
func NewUserController(collection *mongo.Collection) *UserController {
	return &UserController{
		userService: services.NewUserService(collection),
	}
}

// setCookie sets a secure HTTP-only auth cookie
func setCookie(w http.ResponseWriter, name, value string, maxAge int) {
	isProduction := os.Getenv("GO_ENV") == "production"

	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    value,
		HttpOnly: true,
		Secure:   isProduction,
		SameSite: http.SameSiteNoneMode, // Adjust based on your CORS needs
		MaxAge:   maxAge,
		Path:     "/",
	})
}

// GetAuthStatus checks if user is authenticated
func (c *UserController) GetAuthStatus(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by auth middleware)
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Prepare response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"isAuthenticated": true,
		"user": map[string]interface{}{
			"id":        user.ID.Hex(),
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"email":     user.Email,
			"role":      user.Role,
		},
	})
}

// LoginUser handles user login
func (c *UserController) LoginUser(w http.ResponseWriter, r *http.Request) {
	var loginRequest LoginRequest

	// Parse request body
	err := json.NewDecoder(r.Body).Decode(&loginRequest)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Authenticate user
	authResponse, err := c.userService.AuthenticateUser(loginRequest.Email, loginRequest.Password)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Set auth cookie with the token
	setCookie(w, "authToken", authResponse.Token, 24*60*60) // 24 hours

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User logged in successfully",
		"user": map[string]interface{}{
			"id":        authResponse.User.ID,
			"firstName": authResponse.User.FirstName,
			"lastName":  authResponse.User.LastName,
			"email":     authResponse.User.Email,
			"role":      authResponse.User.Role,
			"token":     authResponse.Token,
		},
	})
}

// LogoutUser handles user logout
func (c *UserController) LogoutUser(w http.ResponseWriter, r *http.Request) {
	// Clear the cookie by setting an expired cookie
	setCookie(w, "authToken", "", -1)

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "User logged out successfully"})
}

// RegisterUser handles user registration
func (c *UserController) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var registerRequest RegisterRequest

	// Parse request body
	err := json.NewDecoder(r.Body).Decode(&registerRequest)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Create user model from request
	user := models.Users{
		FirstName: registerRequest.FirstName,
		LastName:  registerRequest.LastName,
		Email:     registerRequest.Email,
		Phone:     registerRequest.Phone,
		Password:  registerRequest.Password,
		Role:      "user", // Default role is user
	}

	// Create user
	authResponse, err := c.userService.CreateUser(user)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Set auth cookie with the token
	setCookie(w, "authToken", authResponse.Token, 24*60*60) // 24 hours

	// Return response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered successfully",
		"user": map[string]interface{}{
			"id":        authResponse.User.ID,
			"firstName": authResponse.User.FirstName,
			"lastName":  authResponse.User.LastName,
			"email":     authResponse.User.Email,
			"role":      authResponse.User.Role,
		},
	})
}

// GetMyProfile gets the authenticated user's profile
func (c *UserController) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user": map[string]interface{}{
			"id":        user.ID.Hex(),
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			"email":     user.Email,
			"phone":     user.Phone,
			"role":      user.Role,
		},
	})
}