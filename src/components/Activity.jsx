import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Clock } from "lucide-react";

const Activity = ({ activity, regenerateActivity }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [placeImage, setPlaceImage] = useState("/api/placeholder/800/400");

  useEffect(() => {
    if (activity.name) {
      searchPlace(activity.name);
    }
  }, [activity.name]);

  const searchPlace = async (query) => {
    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = {
        query: query,
        fields: [
          "name",
          "formatted_address",
          "photos",
          "place_id",
          "rating",
          "user_ratings_total",
        ],
      };

      service.findPlaceFromQuery(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results[0]
        ) {
          service.getDetails(
            {
              placeId: results[0].place_id,
              fields: [
                "name",
                "formatted_address",
                "photos",
                "rating",
                "user_ratings_total",
              ],
            },
            (place, detailStatus) => {
              if (
                detailStatus ===
                window.google.maps.places.PlacesServiceStatus.OK
              ) {
                setPlaceDetails(place);
                if (place.photos && place.photos[0]) {
                  setPlaceImage(
                    place.photos[0].getUrl({ maxWidth: 800, maxHeight: 400 })
                  );
                }
              }
            }
          );
        }
      });
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    await regenerateActivity();
    setIsLoading(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="aspect-video bg-gray-100">
        <img
          src={placeImage}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {placeDetails?.name || activity.name}
            </h3>
            {placeDetails?.rating && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="text-yellow-400">★</span>
                <span className="ml-1">{placeDetails.rating}</span>
                <span className="ml-1">
                  ({placeDetails.user_ratings_total} reviews)
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {placeDetails?.formatted_address && (
          <p className="text-gray-500 text-sm mb-4">
            📍 {placeDetails.formatted_address}
          </p>
        )}

        <p className="text-gray-600 mb-4">{activity.description}</p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span>{activity.length}</span>
        </div>

        {activity.highlight && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Highlight:</span>{" "}
              {activity.highlight}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Activity;
