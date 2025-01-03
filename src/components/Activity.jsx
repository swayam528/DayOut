import React, { useEffect, useState } from "react";
import { FaRedo } from "react-icons/fa";

const Activity = ({ activity, regenerateActivity }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [placeImage, setPlaceImage] = useState("/api/placeholder/400/200");

  useEffect(() => {
    if (activity.name) {
      searchPlace(activity.name);
    }
  }, [activity.name]);

  const searchPlace = async (query) => {
    try {
      // Initialize Places service
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      // Search for a specific place
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
          // Get additional details for the place
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
                    place.photos[0].getUrl({ maxWidth: 400, maxHeight: 200 })
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

  if (!activity) return null;

  return (
    <div className="activity-card">
      <div className="activity-image">
        <img
          src={placeImage}
          alt={activity.name}
          className="activity-thumbnail"
        />
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <div>
            <h3 style={{ color: "#3471b2" }}>
              {placeDetails?.name || activity.name}
            </h3>
            {placeDetails?.rating && (
              <div className="rating">
                ⭐ {placeDetails.rating} ({placeDetails.user_ratings_total}{" "}
                reviews)
              </div>
            )}
          </div>
          <button
            className="reset-button"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            <FaRedo className={isLoading ? "spinning" : ""} />
          </button>
        </div>

        {placeDetails?.formatted_address && (
          <p className="address">📍 {placeDetails.formatted_address}</p>
        )}
        <p className="description">{activity.description}</p>
        <p className="duration">⏱ Duration: {activity.length}</p>
        {activity.highlight && (
          <p className="highlight">✨ {activity.highlight}</p>
        )}
      </div>

      <style jsx>{`
        .activity-card {
          background-color: white;
          border: 1px solid #d0e4fa;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .activity-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .activity-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .activity-content {
          padding: 1.5rem;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .rating {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .address {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .description {
          color: #333;
          line-height: 1.5;
        }

        .duration {
          color: #5a95f2;
          font-weight: 500;
          margin-top: 1rem;
        }

        .highlight {
          color: #5a95f2;
          font-weight: 500;
          background-color: #edf5ff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-top: 1rem;
        }

        .reset-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #5a95f2;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background-color: #edf5ff;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Activity;
