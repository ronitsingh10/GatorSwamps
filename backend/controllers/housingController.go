package controllers

import (
	"encoding/json"
	"net/http"

	"gatorswamp/middlewares"
	"gatorswamp/models"
	"gatorswamp/services"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// HousingController handles HTTP requests related to housing properties
type HousingController struct {
	housingService *services.HousingService
}

// NewHousingController creates a new housing controller
func NewHousingController(collection *mongo.Collection) *HousingController {
	housingService := services.NewHousingService(collection)
	return &HousingController{
		housingService: housingService,
	}
}

// CreateHousingRequest represents the request body for creating a housing property
type CreateHousingRequest struct {
	Type      string       `json:"type"`
	Name      string       `json:"name"`
	Image     string       `json:"image"`
	County    string       `json:"county"`
	Address   string       `json:"address"`
	Bedrooms  string       `json:"bedrooms"`
	Bathrooms string       `json:"bathrooms"`
	Surface   string       `json:"surface"`
	Year      string       `json:"year"`
	Price     string       `json:"price"`
	Latitude  float64      `json:"latitude"`
	Longitude float64      `json:"longitude"`
	Agent     models.Agent `json:"agent"`
}

// CreateHousing handles the creation of a new housing property
func (h *HousingController) CreateHousing(w http.ResponseWriter, r *http.Request) {
	// Verify admin role
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok || user.Role != "admin" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Admin access required"})
		return
	}

	var req CreateHousingRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Create a new housing model
	housing := models.Housing{
		Type:      req.Type,
		Name:      req.Name,
		Image:     req.Image,
		County:    req.County,
		Address:   req.Address,
		Bedrooms:  req.Bedrooms,
		Bathrooms: req.Bathrooms,
		Surface:   req.Surface,
		Year:      req.Year,
		Price:     req.Price,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		Agent:     req.Agent,
	}

	// Use the service to create the housing
	createdHousing, err := h.housingService.CreateProperty(housing)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdHousing)
}

// GetAllHousing handles retrieving all housing properties
func (h *HousingController) GetAllHousing(w http.ResponseWriter, r *http.Request) {
	// Use the service to get all properties
	properties, err := h.housingService.GetAllProperties(bson.M{})
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(properties)
}

// GetHousingByID handles retrieving a housing property by its ID
func (h *HousingController) GetHousingByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id := params["id"]

	// Use the service to get the property by ID
	property, err := h.housingService.GetPropertyByID(id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(property)
}

// UpdateHousing handles updating an existing housing property
func (h *HousingController) UpdateHousing(w http.ResponseWriter, r *http.Request) {
	// Verify admin role
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok || user.Role != "admin" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Admin access required"})
		return
	}

	params := mux.Vars(r)
	id := params["id"]

	var req CreateHousingRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Convert to bson.M for update operation
	updates := bson.M{
		"$set": bson.M{
			"type":      req.Type,
			"name":      req.Name,
			"image":     req.Image,
			"county":    req.County,
			"address":   req.Address,
			"bedrooms":  req.Bedrooms,
			"bathrooms": req.Bathrooms,
			"surface":   req.Surface,
			"year":      req.Year,
			"price":     req.Price,
			"latitude":  req.Latitude,
			"longitude": req.Longitude,
			"agent":     req.Agent,
		},
	}

	// Use the service to update the property
	updatedHousing, err := h.housingService.UpdateProperty(id, updates)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	// Return updated housing
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedHousing)
}

// DeleteHousing handles deleting a housing property
func (h *HousingController) DeleteHousing(w http.ResponseWriter, r *http.Request) {
	// Verify admin role
	user, ok := middlewares.GetUserFromContext(r.Context())
	if !ok || user.Role != "admin" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{"error": "Admin access required"})
		return
	}

	params := mux.Vars(r)
	id := params["id"]

	// Use the service to delete the property
	err := h.housingService.DeleteProperty(id)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		if err.Error() == "property not found" {
			w.WriteHeader(http.StatusNotFound)
		} else {
			w.WriteHeader(http.StatusInternalServerError)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Housing deleted successfully"})
}

// SearchHousing handles searching for housing properties
func (h *HousingController) SearchHousing(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()

	// Extract search parameters
	searchParams := make(map[string]interface{})

	if county := queryParams.Get("county"); county != "" {
		searchParams["county"] = county
	}

	if minBedroomsStr := queryParams.Get("minBedrooms"); minBedroomsStr != "" {
		// Parse to int and add to search params (error handling omitted for brevity)
		searchParams["minBedrooms"] = minBedroomsStr
	}

	// Add more parameters as needed

	// Use the service to search for properties
	properties, err := h.housingService.SearchProperties(searchParams)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(properties)
}
