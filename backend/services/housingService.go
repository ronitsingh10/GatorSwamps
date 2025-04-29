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

// HousingService handles business logic for housing properties
type HousingService struct {
	collection *mongo.Collection
}

// NewHousingService creates a new housing service
func NewHousingService(collection *mongo.Collection) *HousingService {
	return &HousingService{
		collection: collection,
	}
}

// GetAllProperties retrieves all properties with optional filtering
func (s *HousingService) GetAllProperties(filter bson.M) ([]models.Housing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "createdAt", Value: -1}}) // Sort by creation date (newest first)

	cursor, err := s.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var properties []models.Housing
	if err = cursor.All(ctx, &properties); err != nil {
		return nil, err
	}

	return properties, nil
}

// GetPropertyByID retrieves a single property by ID
func (s *HousingService) GetPropertyByID(id string) (*models.Housing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	var property models.Housing
	err = s.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&property)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("property not found")
		}
		return nil, err
	}

	return &property, nil
}

// CreateProperty creates a new property listing
func (s *HousingService) CreateProperty(property models.Housing) (*models.Housing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Set metadata
	property.ID = primitive.NewObjectID()
	property.CreatedAt = primitive.NewDateTimeFromTime(time.Now())
	property.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	_, err := s.collection.InsertOne(ctx, property)
	if err != nil {
		return nil, err
	}

	return &property, nil
}

// UpdateProperty updates an existing property
func (s *HousingService) UpdateProperty(id string, updates bson.M) (*models.Housing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid ID format")
	}

	// Add updated timestamp
	if updates["$set"] != nil {
		updates["$set"].(bson.M)["updatedAt"] = primitive.NewDateTimeFromTime(time.Now())
	}

	_, err = s.collection.UpdateOne(
		ctx,
		bson.M{"_id": objID},
		updates,
	)
	if err != nil {
		return nil, err
	}

	// Get the updated property
	var property models.Housing
	err = s.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&property)
	if err != nil {
		return nil, err
	}

	return &property, nil
}

// DeleteProperty removes a property listing
func (s *HousingService) DeleteProperty(id string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	result, err := s.collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("property not found")
	}

	return nil
}

// SearchProperties searches for properties based on various criteria
func (s *HousingService) SearchProperties(searchParams bson.M) ([]models.Housing, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Build search filter
	filter := bson.M{}
	for key, value := range searchParams {
		filter[key] = value
	}

	cursor, err := s.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var properties []models.Housing
	if err = cursor.All(ctx, &properties); err != nil {
		return nil, err
	}

	return properties, nil
}
