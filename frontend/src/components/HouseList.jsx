import { useContext } from "react";
import { HouseContext } from "../contexts/HouseContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Map, Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { ImSpinner2 } from "react-icons/im";
import PropertyCard from "./PropertyCard";
import { Home, MapPin, X } from "lucide-react";

const calculateCenter = (properties) => {
  if (!properties || properties.length === 0) return [0, 0]; // Default fallback

  const sum = properties.reduce(
    (acc, prop) => {
      return {
        lat: acc.lat + prop.latitude,
        lng: acc.lng + prop.longitude,
      };
    },
    { lat: 0, lng: 0 }
  );

  return [sum.lng / properties.length, sum.lat / properties.length];
};

const HouseList = () => {
  const { houses, loading } = useContext(HouseContext);

  const propertiesCenter = calculateCenter(houses);

  const [mapError, setMapError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Add console debugging
  useEffect(() => {
    console.log("Map component initialized");
    console.log("Properties center:", propertiesCenter);

    // Check for any null coordinates
    houses.forEach((prop) => {
      if (
        prop.latitude === null ||
        prop.longitude === null ||
        prop.latitude === undefined ||
        prop.longitude === undefined
      ) {
        console.error(`Property ${prop.id} has invalid coordinates:`, {
          lat: prop.latitude,
          lng: prop.longitude,
        });
      }
    });

    return () => {
      console.log("Map component unmounted");
    };
  }, []);

  // if loading is true
  if (loading) {
    return (
      <ImSpinner2 className="mx-auto animate-spin text-violet-700 text-4xl mt-[200px]" />
    );
  }

  if (houses.length < 1) {
    return (
      <div className="text-center text-3xl text-gray-400 mt-48">
        Sorry, nothing found!
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Fixed Map Container - Left Side */}
        <div className="md:w-1/2 lg:w-7/12 sticky top-20 self-start">
          {mapError && (
            <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
              Map error: {mapError}
            </div>
          )}
          <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
            {/* Loading overlay */}
            {!mapLoaded && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <Home className="h-8 w-8 animate-pulse text-green-600" />
                  <p>Loading map...</p>
                </div>
              </div>
            )}

            <Map
              initialViewState={{
                longitude: propertiesCenter[0],
                latitude: propertiesCenter[1],
                zoom: 12,
              }}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              onError={(e) => {
                console.error("Map error:", e);
                setMapError(e.message || "Unknown map error");
              }}
              onLoad={() => setMapLoaded(true)}
              className="w-full h-full"
            >
              {mapLoaded &&
                houses.map((property) => (
                  <Marker
                    key={property.id}
                    longitude={property.longitude}
                    latitude={property.latitude}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
                      setSelectedProperty(property);
                    }}
                  >
                    <div className="cursor-pointer hover:scale-110 transition-transform">
                      <MapPin className="h-8 w-8 text-green-600" />
                      <span className="absolute text-xs font-bold text-black">
                        ${(property.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </Marker>
                ))}

              {/* Popup for selected property */}
              {mapLoaded && selectedProperty && (
                <Popup
                  longitude={selectedProperty.longitude}
                  latitude={selectedProperty.latitude}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="top"
                  onClose={() => setSelectedProperty(null)}
                >
                  {selectedProperty && (
                    <div className="w-64">
                      <Link to={`/property/${selectedProperty.id}`}>
                        <PropertyCard
                          house={selectedProperty}
                          className={"scale-90"}
                        />
                      </Link>
                    </div>
                  )}
                </Popup>
              )}
            </Map>
          </div>
        </div>

        {/* Scrollable Properties List - Right Side */}
        <div className="md:w-1/2 lg:w-5/12 max-h-screen overflow-y-auto pb-8 pr-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Available Properties ({houses.length})
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {houses.map((house, index) => (
              <Link
                to={`/property/${house.id}`}
                key={index}
                className="block transition hover:shadow-md"
                onMouseEnter={() => setSelectedProperty(house)}
                onMouseLeave={() => setSelectedProperty(null)}
              >
                <PropertyCard house={house} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseList;
