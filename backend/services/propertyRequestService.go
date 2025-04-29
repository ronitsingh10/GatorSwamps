package services

import (
	"context"
	"errors"
	"time"

	"gatorswamp/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// PropertyRequestService handles business logic for property requests
type PropertyRequestService struct {
	collection     *mongo.Collection
	userService    *UserService
	housingService *HousingService
}

// NewPropertyRequestService creates a new property request service
func NewPropertyRequestService(collection *mongo.Collection, userService *UserService, housingService *HousingService) *PropertyRequestService {
	return &PropertyRequestService{
		collection:     collection,
		userService:    userService,
		housingService: housingService,
	}
}

// CreateRequest creates a new property request
func (s *PropertyRequestService) CreateRequest(request models.PropertyRequest) (*models.PropertyRequest, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Validate property exists
	_, err := s.housingService.GetPropertyByID(request.PropertyID.Hex())
	if err != nil {
		return nil, errors.New("property not found")
	}

	// Set metadata
	request.ID = primitive.NewObjectID()
	request.Status = models.StatusPending
	request.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	request.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	// Insert into database
	_, err = s.collection.InsertOne(ctx, request)
	if err != nil {
		return nil, err
	}

	return &request, nil
}

// GetRequestByID retrieves a request by ID
func (s *PropertyRequestService) GetRequestByID(id string) (*models.PropertyRequest, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	var request models.PropertyRequest
	err = s.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&request)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("request not found")
		}
		return nil, err
	}

	return &request, nil
}

// GetRequestsByUser retrieves all requests for a specific user
func (s *PropertyRequestService) GetRequestsByUser(userID string) ([]models.PropertyRequest, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := s.collection.Find(ctx, bson.M{"userId": objID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var requests []models.PropertyRequest
	if err = cursor.All(ctx, &requests); err != nil {
		return nil, err
	}

	return requests, nil
}

// GetAllRequests retrieves all requests (admin function)
func (s *PropertyRequestService) GetAllRequests(filter bson.M) ([]models.PropertyRequest, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := s.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var requests []models.PropertyRequest
	if err = cursor.All(ctx, &requests); err != nil {
		return nil, err
	}

	return requests, nil
}

// UpdateRequestStatus updates the status of a request
func (s *PropertyRequestService) UpdateRequestStatus(id string, status string, adminID string) (*models.PropertyRequest, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Validate status
	validStatuses := map[string]bool{
		models.StatusPending:  true,
		models.StatusApproved: true,
		models.StatusRejected: true,
	}

	if !validStatuses[status] {
		return nil, errors.New("invalid status value")
	}

	// Validate IDs
	requestID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid request ID format")
	}

	adminObjID, err := primitive.ObjectIDFromHex(adminID)
	if err != nil {
		return nil, errors.New("invalid admin ID format")
	}

	// Update request
	now := primitive.NewDateTimeFromTime(time.Now())
	update := bson.M{
		"$set": bson.M{
			"status":      status,
			"updatedAt":   now,
			"processedBy": adminObjID,
		},
	}

	result, err := s.collection.UpdateOne(ctx, bson.M{"_id": requestID}, update)
	if err != nil {
		return nil, err
	}

	if result.ModifiedCount == 0 {
		return nil, errors.New("request not found")
	}

	// Get updated request
	var request models.PropertyRequest
	err = s.collection.FindOne(ctx, bson.M{"_id": requestID}).Decode(&request)
	if err != nil {
		return nil, err
	}

	return &request, nil
}

// DeleteRequest removes a request
func (s *PropertyRequestService) DeleteRequest(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	requestID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid request ID format")
	}

	result, err := s.collection.DeleteOne(ctx, bson.M{"_id": requestID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("request not found")
	}

	return nil
}
