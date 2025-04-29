package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "strings"
    "time"

    "gatorswamp/config"
    "gatorswamp/routes"
    "github.com/gorilla/handlers"
    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
    // Load .env
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: no .env file found")
    }

    // MongoDB setup
    log.Println("Connecting to MongoDB…")
    client, err := mongo.NewClient(options.Client().ApplyURI(config.EnvMongoURI()))
    if err != nil {
        log.Fatal("Error creating client:", err)
    }
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := client.Connect(ctx); err != nil {
        log.Fatal("Error connecting to MongoDB:", err)
    }
    defer client.Disconnect(ctx)
    dbName := os.Getenv("DB_NAME")
    if dbName == "" {
        dbName = "Gator-Homes"
    }
    db := client.Database(dbName)
    log.Printf("Using database %q", dbName)

    // Build router
    r := mux.NewRouter()
    r.Use(loggingMiddleware)

    // Register API subrouters
    api := r.PathPrefix("/api").Subrouter()
    routes.SetupUserRoutes(api.PathPrefix("/users").Subrouter(), db)
    routes.SetupHousingRoutes(api.PathPrefix("/housing").Subrouter(), db)
    routes.SetupRequestRoutes(api.PathPrefix("/requests").Subrouter(), db)

    // Static file serving for the React app
    staticRoot := "../frontend/dist"

    // 1. Serve static assets directly
    r.PathPrefix("/assets/").Handler(http.StripPrefix("/assets/", http.FileServer(http.Dir(staticRoot+"/assets"))))
    
    // 2. Serve vite.svg from root
    r.HandleFunc("/vite.svg", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, staticRoot+"/vite.svg")
    })

    // 3. For all other non-API routes, serve the React index.html
    r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
        // Skip API routes as they should be handled by the API handlers
        if strings.HasPrefix(req.URL.Path, "/api/") {
            return
        }
        
        // Set proper content type
        w.Header().Set("Content-Type", "text/html; charset=utf-8")
        
        // Log and serve the index.html file
        log.Printf("Serving React app for path: %s", req.URL.Path)
        
        // Important: We need to explicitly check if the file exists
        indexPath := staticRoot + "/index.html"
        if _, err := os.Stat(indexPath); os.IsNotExist(err) {
            log.Printf("ERROR: index.html not found at %s", indexPath)
            http.Error(w, "File not found", http.StatusNotFound)
            return
        }
        
        http.ServeFile(w, req, indexPath)
    }))

    // CORS wrapper
    allowed := []string{
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5500",
        "https://gatorswamp.onrender.com",
        "https://www.gator-homes.com",
    }
    corsHandler := handlers.CORS(
        handlers.AllowedOrigins(allowed),
        handlers.AllowCredentials(),
        handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
        handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
    )

    port := os.Getenv("PORT")
    if port == "" {
        port = "5500"  // Default to 5500
    }

    log.Printf("Server running on port %s", port)
    log.Fatal(http.ListenAndServe(":"+port, corsHandler(r)))
}

// loggingMiddleware logs all incoming requests
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s %s", r.RemoteAddr, r.Method, r.URL)
        next.ServeHTTP(w, r)
    })
}