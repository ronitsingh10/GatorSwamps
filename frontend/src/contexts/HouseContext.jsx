import { useState, useEffect, createContext } from "react";

export const HouseContext = createContext();

const HouseContextProvider = ({ children }) => {
  const [houses, setHouses] = useState([]);
  const [filteredHouses, setFilteredHouses] = useState([]);
  const [county, setCounty] = useState("Location (any)");
  const [counties, setCounties] = useState([]);
  const [property, setProperty] = useState("Property type (any)");
  const [properties, setProperties] = useState([]);
  const [price, setPrice] = useState("Price range (any)");
  const [bath, setBath] = useState("Bathrooms count (any)");
  const [bed, setBed] = useState("Bedrooms count (any)");
  const [loading, setLoading] = useState(false);

  // Fetch houses data
  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/housing/all");
        if (!res.ok) throw new Error("Failed to fetch properties");
        const data = await res.json();
        setHouses(data);
        setFilteredHouses(data); // Initialize filtered houses with all houses
      } catch (error) {
        console.error("Error fetching housing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  // Extract unique counties
  useEffect(() => {
    if (!houses.length) return;

    const uniqueCounties = [
      "Location (any)",
      ...new Set(houses.map((house) => house.county)),
    ];
    uniqueCounties.sort((a, b) => a.localeCompare(b));
    setCounties(uniqueCounties);
  }, [houses]);

  // Extract unique property types
  useEffect(() => {
    if (!houses.length) return;

    const uniqueProperties = [
      "Property type (any)",
      ...new Set(houses.map((house) => house.type)),
    ];
    setProperties(uniqueProperties);
  }, [houses]);

  // Helper function to check if a filter is in default state
  const isDefault = (str) => str.includes("(any)");

  // Apply filters when the search button is clicked
  const handleClick = () => {
    setLoading(true);

    // Parse price range
    const minPrice = price.includes("(any)")
      ? 0
      : parseInt(price.split(" ")[0]);
    const maxPrice = price.includes("(any)")
      ? Number.MAX_SAFE_INTEGER
      : parseInt(price.split(" ")[2]);

    // Apply all filters
    const filtered = houses.filter((house) => {
      const housePrice = parseInt(house.price);

      // Create an array of filter conditions
      const conditions = [
        isDefault(county) || house.county === county,
        isDefault(property) || house.type === property,
        isDefault(price) || (housePrice >= minPrice && housePrice <= maxPrice),
        isDefault(bed) || house.bedrooms == bed,
        isDefault(bath) || house.bathrooms == bath,
      ];

      // All conditions must be true for the house to be included
      return conditions.every((condition) => condition === true);
    });

    // Update filtered houses with a small delay for UX feedback
    setTimeout(() => {
      setFilteredHouses(filtered);
      setLoading(false);
    }, 1000);
  };

  return (
    <HouseContext.Provider
      value={{
        county,
        setCounty,
        counties,
        property,
        setProperty,
        properties,
        price,
        setPrice,
        houses: filteredHouses, // Use filtered houses instead of all houses
        loading,
        handleClick,
        bath,
        setBath,
        bed,
        setBed,
      }}
    >
      {children}
    </HouseContext.Provider>
  );
};

export default HouseContextProvider;
