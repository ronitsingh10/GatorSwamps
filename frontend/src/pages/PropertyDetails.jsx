import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BiBed, BiBath, BiArea } from "react-icons/bi";
import { MdOutlinePool, MdCountertops } from "react-icons/md";
import { IoIosFitness, IoIosBasketball } from "react-icons/io";
import { AiFillLock } from "react-icons/ai";
import { MdElevator, MdPets, MdOutdoorGrill, MdSpeed } from "react-icons/md";
import { BsFillTrash3Fill, BsSnow } from "react-icons/bs";
import { GiHanger, GiWashingMachine, GiBathtub } from "react-icons/gi";
import { CgSmartHomeRefrigerator } from "react-icons/cg";
import { TbMicrowave } from "react-icons/tb";
import Carousel from "../components/Carousel";
import { CgProfile } from "react-icons/cg";
import Skeleton from "../components/Skeleton";
import AuthModal from "../components/authModal";
import { useAuth } from "../hooks/useAuth";

const PropertyDetails = () => {
  // get the house id
  const { id } = useParams();

  const { currentUser, register, login, isAuthenticated } = useAuth();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const fetchMyRequests = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/requests/my-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Important for cookies/session auth!
      });

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = (await response.json()) || [];
      console.log("My Requests:", data);

      // Check if user already has a request for this property
      const propertyRequest = data.find((request) => request.propertyId === id);
      if (propertyRequest) {
        setExistingRequest(propertyRequest);
        setRequestStatus(propertyRequest.status);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = async (e) => {
    e.preventDefault();

    // If already submitted, don't allow resubmission
    if (existingRequest) {
      return;
    }

    if (!isAuthenticated) {
      console.log("User is not logged in, proceed with apply...");
      setShowModal(true);
    } else {
      try {
        setFormSubmitting(true);
        const formData = new FormData(e.target.form);
        const data = Object.fromEntries(formData.entries());

        // Redirect or call apply endpoint
        console.log(
          "User is logged in, proceed with apply...",
          currentUser,
          data,
          formData
        );

        const token = localStorage.getItem("authToken");
        const response = await fetch("/api/requests/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ propertyId: id, message: data.message }),
        });

        if (!response.ok) {
          throw new Error(`Submission failed: ${response.status}`);
        }

        const res = await response.json();
        console.log("Response:", res);

        // Update status
        setExistingRequest(res);
        setRequestStatus("pending");
        setFormSubmitted(true);
      } catch (err) {
        console.error("Application error:", err);
        setError(err.message);
      } finally {
        setFormSubmitting(false);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleLogin = async (loginData) => {
    try {
      await login(loginData.email, loginData.password);

      setTimeout(() => {
        window.location.reload(); // This is a simple approach, could be improved with context
        closeModal();
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleSignup = async (signupData) => {
    try {
      // Validate password match
      if (signupData.password !== signupData.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      console.log(signupData);

      await register({
        firstName: signupData.name,
        email: signupData.email,
        password: signupData.password,
      });
      await login(signupData.email, signupData.password);

      setTimeout(() => {
        window.location.reload();
        closeModal();
      }, 1000);
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  useEffect(() => {
    const fetchHouse = async () => {
      console.log("started");
      try {
        const res = await fetch(`/api/housing/${id}`);
        console.log("Response:", res);
        if (!res.ok) throw new Error("Failed to fetch property");
        const data = await res.json();
        console.log("data:", data);

        setHouse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
    console.log("House data fetched:", house);
  }, [id]);

  useEffect(() => {
    // Fetch user's requests to check if they've already applied
    if (isAuthenticated) {
      fetchMyRequests();
    }
  }, [isAuthenticated, id]);

  const getStatusDisplay = () => {
    if (!existingRequest) return null;

    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      approved: "bg-green-100 text-green-700 border-green-300",
      rejected: "bg-red-100 text-red-700 border-red-300",
    };

    const statusMessages = {
      pending: "Your application is pending review",
      approved: "Your application has been approved!",
      rejected: "Your application was not approved",
    };

    return (
      <div
        className={`border rounded-md p-4 mb-4 ${statusColors[requestStatus]}`}
      >
        <h3 className="font-medium text-lg">
          Application Status:{" "}
          {requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)}
        </h3>
        <p>{statusMessages[requestStatus]}</p>
        <p className="text-sm mt-2">
          Submitted on:{" "}
          {new Date(existingRequest.createdAt).toLocaleDateString()}
        </p>
      </div>
    );
  };

  if (loading) {
    return <Skeleton />;
  }

  if (error) {
    return <div className="text-center mt-24 text-red-500">Error: {error}</div>;
  }

  if (!house) {
    return null; // Or a fallback UI
  }

  const Images = [
    house.image,
    "https://images.unsplash.com/photo-1616137466211-f939a420be84?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
    "https://images.unsplash.com/photo-1604709177225-055f99402ea3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
    "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
    "https://images.unsplash.com/photo-1612965607446-25e1332775ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80",
    "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    "https://images.unsplash.com/photo-1503174971373-b1f69850bded?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1513&q=80",
    "https://images.unsplash.com/photo-1616137507072-f7276b168614?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80",
    "https://images.unsplash.com/photo-1432303492674-642e9d0944b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1774&q=80",
    "https://images.unsplash.com/photo-1596178067639-5c6e68aea6dc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
  ];

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl mb-14">
        {/* Property Header - Responsive layout */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="antialiased text-gray-700 font-semibold text-2xl sm:text-3xl md:text-4xl">
                {house.name}
              </h2>
              <h3 className="antialiased font-light text-gray-900 text-base sm:text-lg mb-2 leading-relaxed tracking-wide">
                {house.address}
              </h3>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-neutral-600">
              ${Number(house.price).toLocaleString()}
              <span className="text-gray-600 font-medium text-sm">/ month</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-sky-100 text-sky-400 px-3 py-1 rounded-full uppercase font-light tracking-wide text-sm">
              {house.type}
            </div>
            <div className="bg-sky-100 text-sky-400 px-3 py-1 rounded-full font-light tracking-wide text-sm">
              {house.county}
            </div>
          </div>
        </div>

        {/* Main Content - Responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Property Images and Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Carousel>
                {Images.map((x, index) => (
                  <img
                    key={index}
                    src={x || "/placeholder.svg"}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                ))}
              </Carousel>
            </div>

            <div className="flex gap-x-6 text-neutral-600 mb-6">
              <div className="flex gap-x-2 items-center">
                <BiBed className="text-xl sm:text-2xl" />
                <div>{house.bedrooms}</div>
              </div>
              <div className="flex gap-x-2 items-center">
                <BiBath className="text-xl sm:text-2xl" />
                <div>{house.bathrooms}</div>
              </div>
              <div className="flex gap-x-2 items-center">
                <BiArea className="text-xl sm:text-2xl" />
                <div>{house.surface}</div>
              </div>
            </div>

            <h1 className="antialiased text-gray-700 font-semibold text-2xl sm:text-3xl mb-4">
              About {house.name}
            </h1>
            <div className="antialiased font-light leading-snug tracking-wide text-stone-900">
              <div>
                {`Welcome to a charming and cozy ${house.bedrooms}-bedroom, ${
                  house.bathrooms
                }-bathroom ${house.type.toLowerCase()}
              situated in a quiet and peaceful neighborhood. From the moment you
              step inside, you will be greeted by a warm and inviting living
              room, complete with hardwood floors and plenty of natural light.
             `}
              </div>
              <div className="mt-3">
                The kitchen is compact yet functional, with modern appliances,
                ample cabinet space, and a cozy breakfast nook perfect for
                enjoying your morning coffee. The two bedrooms are comfortable
                and provide a peaceful retreat at the end of a long day. The
                bathroom is stylishly designed and features a modern sink and a
                walk-in shower.
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white w-full mb-8 border border-gray-300 rounded-lg px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex items-center gap-x-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 p-1 border border-gray-300 rounded-full flex-shrink-0">
                  <CgProfile className="w-full h-full text-gray-500" />
                </div>
                <div>
                  <div className="font-semibold text-neutral-800 text-base sm:text-lg">{`${house.name} Management`}</div>
                  <h2 className="text-neutral-600 text-sm font-light">
                    Get in touch
                  </h2>
                </div>
              </div>

              {/* Status Display */}
              {getStatusDisplay()}

              {/* Success Message */}
              {formSubmitted && !existingRequest && (
                <div className="bg-green-100 text-green-700 border border-green-300 rounded-md p-4 mb-4">
                  <h3 className="font-medium">Application Submitted!</h3>
                  <p>
                    Thank you for your application. We'll review it shortly.
                  </p>
                </div>
              )}

              {/* form */}
              <form className="flex flex-col gap-y-4">
                <input
                  name="name"
                  className="border border-gray-300 focus:border-violet-700 outline-none rounded w-full px-4 h-12 text-sm"
                  type="text"
                  placeholder="Name*"
                  disabled={!!existingRequest || formSubmitting}
                />
                <input
                  name="email"
                  className="border border-gray-300 focus:border-violet-700 outline-none rounded w-full px-4 h-12 text-sm"
                  type="text"
                  placeholder="Email*"
                  disabled={!!existingRequest || formSubmitting}
                />
                <input
                  name="phone"
                  className="border border-gray-300 focus:border-violet-700 outline-none rounded w-full px-4 h-12 text-sm"
                  type="text"
                  placeholder="Phone*"
                  disabled={!!existingRequest || formSubmitting}
                />
                <textarea
                  name="message"
                  className="border border-gray-300 focus:border-violet-700 outline-none resize-none rounded w-full p-4 h-36 text-sm text-gray-400"
                  placeholder="Message*"
                  disabled={!!existingRequest || formSubmitting}
                ></textarea>
                <div className="flex flex-col sm:flex-row gap-3">
                  {!existingRequest ? (
                    <button
                      onClick={handleApplyClick}
                      className={`
                        ${
                          formSubmitting
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-sky-200 hover:bg-sky-300 text-sky-600"
                        } 
                        rounded p-3 text-sm w-full transition
                      `}
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? "Submitting..." : "Apply"}
                    </button>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 rounded p-3 text-sm w-full text-center">
                      Application Submitted
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Community Amenities - Responsive grid */}
        <div className="mt-10">
          <h1 className="antialiased text-gray-700 font-semibold text-xl sm:text-2xl mb-4">
            Community Amenities
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdOutlinePool className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Swimming Pool
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <IoIosFitness className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Fitness Center
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <IoIosBasketball className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Basketball Court
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <AiFillLock className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Controlled Access
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdElevator className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Elevator
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdPets className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Pet Play Area
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdOutdoorGrill className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Outdoor Grill
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <BsFillTrash3Fill className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Trash Pickup
              </h1>
            </div>
          </div>
        </div>

        {/* Property Services - Responsive layout */}
        <div className="mt-8">
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Property Services
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Package Service</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Maintenance on site</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Pet Play Area</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Community-Wide WiFi</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Trash Pickup - Door to Door</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Pet Washing Station</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Key Fob Entry</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Controlled Access</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Recycling</span>
            </div>
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Shared Community - Responsive layout */}
        <div>
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Shared Community
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Elevator</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Lounge</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Conference Room</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Storage Space</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Clubhouse</span>
            </div>
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Fitness & Recreation - Responsive layout */}
        <div>
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Fitness & Recreation
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Fitness Center</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Playground</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Gameroom</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Pool</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Bike Storage</span>
            </div>
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Outdoor Features - Responsive layout */}
        <div>
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Outdoor Features
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Sundeck</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Courtyard</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Cabanda</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Grill</span>
            </div>
          </div>
        </div>

        {/* Apartment Amenities - Responsive grid */}
        <div className="mt-10">
          <h1 className="antialiased text-gray-700 font-semibold text-xl sm:text-2xl mb-4">
            Apartment Amenities
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <BsSnow className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Air Conditioning
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdSpeed className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                High Speed Internet
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <GiHanger className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Walk-In Closets
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <CgSmartHomeRefrigerator className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Refrigerator
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <TbMicrowave className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Microwave
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <GiWashingMachine className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Washer/Dryer
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <GiBathtub className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Tub/Shower
              </h1>
            </div>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center text-center">
              <MdCountertops className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h1 className="mt-2 text-sm sm:text-base text-neutral-600">
                Granite Countertops
              </h1>
            </div>
          </div>
        </div>

        {/* Highlights - Responsive layout */}
        <div className="mt-8">
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Highlights
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>High Speed Internet</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Smoke Free</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Fireplace</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Washer/Dryer</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Storage Units</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Sprinkler Systems</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Air Conditioning</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Double Vanities</span>
            </div>
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Kitchen Features - Responsive layout */}
        <div>
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Kitchen Features & Appliances
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Dishwasher</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Stainless Steel Appliances</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Range</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Disposal</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Kitchen</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Refrigerator</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Ice Maker</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Microwave</span>
            </div>
          </div>
        </div>

        <hr className="h-px w-full my-8 bg-gray-200 border-0" />

        {/* Floor Plan Details - Responsive layout */}
        <div>
          <div className="antialiased text-gray-600 font-medium text-lg sm:text-xl mb-3">
            Floor Plan Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-500">
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Hardwood Floors</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Walk-In Closets</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Patio</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Carpet</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Linen Closet</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Office</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">&bull;</span>
              <span>Balcony</span>
            </div>
          </div>
        </div>

        {/* Lease Details & Fees - Responsive layout */}
        <div className="mt-8">
          <h1 className="antialiased text-gray-700 font-semibold text-xl sm:text-2xl mb-3">
            Lease Details & Fees
          </h1>
          <h2 className="antialiased text-gray-600 font-medium text-lg mb-1">
            Pet Policies
          </h2>
          <div className="mt-3 border rounded w-full lg:w-10/12 xl:w-8/12">
            <div className="bg-gray-50 rounded-t">
              <h2 className="mb-0 px-4 py-2 font-semibold text-gray-500">
                Dogs Allowed
              </h2>
            </div>
            <hr className="h-px w-full bg-gray-200 border-0" />
            <h2 className="antialiased my-3 mx-4 font-semibold text-gray-900">
              Restrictions:{" "}
              <span className="font-normal">Breed Restrictions</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-4 font-medium text-gray-600">
              <div>
                <span>Monthly pet rent</span>
                <span className="ml-2 sm:ml-4">$25</span>
              </div>
              <div>
                <span>One time fees</span>
                <span className="ml-2 sm:ml-4">$400</span>
              </div>
            </div>
          </div>
          <div className="border rounded w-full lg:w-10/12 xl:w-8/12 mt-3">
            <div className="bg-gray-50 rounded-t">
              <h2 className="mb-0 px-4 py-2 font-semibold text-gray-500">
                Cats Allowed
              </h2>
            </div>
            <hr className="h-px w-full bg-gray-200 border-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 py-4 font-medium text-gray-600">
              <div>
                <span>Monthly pet rent</span>
                <span className="ml-2 sm:ml-4">$25</span>
              </div>
              <div>
                <span>One time fees</span>
                <span className="ml-2 sm:ml-4">$400</span>
              </div>
            </div>
          </div>

          <h2 className="mt-7 antialiased text-gray-600 font-medium text-lg mb-1">
            Fees
          </h2>
          <div className="mt-3 border rounded w-full lg:w-10/12 xl:w-8/12">
            <div className="bg-gray-50 rounded-t">
              <h2 className="mb-0 px-4 py-2 font-semibold text-gray-500">
                Parking
              </h2>
            </div>
            <hr className="h-px w-full bg-gray-200 border-0" />
            <div className="antialiased p-4 font-light">
              <h2 className="font-medium text-gray-600 flex justify-between">
                <span>Surface Lot</span>
                <span>$50</span>
              </h2>
              <h2 className="mt-1 text-gray-500 text-sm">Unassigned Parking</h2>
              <h2 className="mt-1 text-gray-500 text-sm">
                Rentable parking spot available.
              </h2>
            </div>
          </div>
          <div className="border rounded w-full lg:w-10/12 xl:w-8/12 mt-3">
            <div className="bg-gray-50 rounded-t">
              <h2 className="mb-0 px-4 py-2 font-semibold text-gray-500">
                Other Fees
              </h2>
            </div>
            <hr className="h-px w-full bg-gray-200 border-0" />
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Admin Fee</span>
                  <span>$250</span>
                </div>
                <div className="flex justify-between">
                  <span>Application Fee</span>
                  <span>$75</span>
                </div>
              </div>
              <hr className="h-px w-full my-4 bg-gray-200 border-0" />
              <h2 className="font-medium text-gray-600 flex justify-between">
                <span>Surface Lot</span>
                <span>$50</span>
              </h2>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showModal}
          onClose={closeModal}
          onLogin={handleLogin}
          onSignup={handleSignup}
        />
      </div>
    </section>
  );
};

export default PropertyDetails;
