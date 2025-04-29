package controllers

import (
	"encoding/json"
	"net/http"

	"gatorswamp/middlewares"
	"gatorswamp/models"
	"gatorswamp/services"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// PropertyRequestController handles HTTP requests related to property requests
type PropertyRequestController struct {
	requestService *services.PropertyRequestService
	userService    *services.UserService
	housingService *services.HousingService
}

// CreateRequestBody represents the request body for creating a property request
type CreateRequestBody struct {
	PropertyID string `json:"propertyId" validate:"required"`
	Message    string `json:"message"`
}

// UpdateRequestBody represents the request body for updating a property request status
type UpdateRequestBody struct {
	Status string `json:"status" validate:"required,oneof=pending approved rejected"`
}

// NewPropertyRequestController creates a new property request controller
func NewPropertyRequestController(collection *mongo.Collection, housingColl *mongo.Collection) *PropertyRequestController {
	userColl := collection.Database().Collection("users")
	userService := services.NewUserService(userColl)
	housingService := services.NewHousingService(housingColl)

	return &PropertyRequestController{
		requestService: services.NewPropertyRequestService(collection, userService, housingService),
		userService:    userService,
		housingService: housingService,
	}
}

// CreateRequest creates a new property request
func (c *PropertyRequestController) CreateRequest(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// Admin cannot create property requests
	if user.Role == "admin" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Admins cannot create property requests"})
		return
	}

	var requestBody CreateRequestBody
	err := json.NewDecoder(r.Body).Decode(&requestBody)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Validate property ID
	propertyID, err := primitive.ObjectIDFromHex(requestBody.PropertyID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid property ID"})
		return
	}

	// Check if user already has a pending request for this property
	existingRequests, err := c.requestService.GetRequestsByUser(user.ID.Hex())
	if err == nil {
		for _, req := range existingRequests {
			if req.PropertyID == propertyID && req.Status == models.StatusPending {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusConflict)
				json.NewEncoder(w).Encode(map[string]string{"error": "You already have a pending request for this property"})
				return
			}
		}
	}

	// Create request object
	propertyRequest := models.PropertyRequest{
		UserID:     user.ID,
		PropertyID: propertyID,
		Message:    requestBody.Message,
	}

	// Use service to create request
	createdRequest, err := c.requestService.CreateRequest(propertyRequest)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdRequest)
}

// GetMyRequests retrieves all requests for the authenticated user
func (c *PropertyRequestController) GetMyRequests(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
		return
	}

	// Regular users can only see their own requests
	if user.Role != "admin" {
		c.getUserRequests(w, r, user.ID)
		return
	}

	// Admin can see all requests
	c.getAllRequests(w, r)
}

// getUserRequests gets requests for a specific user
func (c *PropertyRequestController) getUserRequests(w http.ResponseWriter, r *http.Request, userID primitive.ObjectID) {
	// Use service to get user requests
	requests, err := c.requestService.GetRequestsByUser(userID.Hex())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Enrich requests with property data
	enrichedRequests, err := c.enrichRequests(requests)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedRequests)
}

// getAllRequests gets all requests (admin only)
func (c *PropertyRequestController) getAllRequests(w http.ResponseWriter, r *http.Request) {
	// Use service to get all requests
	requests, err := c.requestService.GetAllRequests(bson.M{})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Enrich requests with property data
	enrichedRequests, err := c.enrichRequests(requests)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enrichedRequests)
}

// EnrichedPropertyRequest includes property details with request
type EnrichedPropertyRequest struct {
	models.PropertyRequest
	Property models.Housing `json:"property"`
}

// enrichRequests adds property data to requests
func (c *PropertyRequestController) enrichRequests(requests []models.PropertyRequest) ([]EnrichedPropertyRequest, error) {
	var enriched []EnrichedPropertyRequest

	for _, req := range requests {
		property, err := c.housingService.GetPropertyByID(req.PropertyID.Hex())
		var housing models.Housing

		if err != nil {
			// If property not found, use an empty housing object
			housing = models.Housing{
				Name: "Property not found",
			}
		} else {
			housing = *property
		}

		enriched = append(enriched, EnrichedPropertyRequest{
			PropertyRequest: req,
			Property:        housing,
		})
	}

	return enriched, nil
}

// UpdateRequestStatus updates the status of a property request (admin only)
func (c *PropertyRequestController) UpdateRequestStatus(w http.ResponseWriter, r *http.Request) {
	// Verify admin role
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok || user.Role != "admin" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Admin access required"})
		return
	}

	// Get request ID from URL
	params := mux.Vars(r)
	requestID := params["id"]

	// Parse request body
	var updateBody UpdateRequestBody
	err := json.NewDecoder(r.Body).Decode(&updateBody)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Use service to update request status
	updatedRequest, err := c.requestService.UpdateRequestStatus(requestID, updateBody.Status, user.ID.Hex())
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err.Error() == "request not found" {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedRequest)
}
