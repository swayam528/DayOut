import React from "react";
import { FaRedo } from "react-icons/fa";

const Activity = ({ activity, regenerateActivity }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const getActivityImage = (activityName) => {
    // Simple mapping of keywords to placeholder images
    const activityTypes = {
      default: "/api/placeholder/400/200",
      restaurant: "/api/placeholder/400/200",
      park: "/api/placeholder/400/200",
      museum: "/api/placeholder/400/200",
      shopping: "/api/placeholder/400/200",
      entertainment: "/api/placeholder/400/200",
      sports: "/api/placeholder/400/200",
    };

    const name = activityName.toLowerCase();
    let imageUrl = activityTypes.default;

    // Check for keywords in the activity name
    if (
      name.includes("restaurant") ||
      name.includes("food") ||
      name.includes("cafe") ||
      name.includes("dining")
    ) {
      imageUrl = activityTypes.restaurant;
    } else if (
      name.includes("park") ||
      name.includes("garden") ||
      name.includes("nature")
    ) {
      imageUrl = activityTypes.park;
    } else if (
      name.includes("museum") ||
      name.includes("gallery") ||
      name.includes("exhibition")
    ) {
      imageUrl = activityTypes.museum;
    } else if (
      name.includes("mall") ||
      name.includes("shop") ||
      name.includes("store")
    ) {
      imageUrl = activityTypes.shopping;
    } else if (
      name.includes("movie") ||
      name.includes("theater") ||
      name.includes("concert")
    ) {
      imageUrl = activityTypes.entertainment;
    } else if (
      name.includes("sports") ||
      name.includes("game") ||
      name.includes("fitness")
    ) {
      imageUrl = activityTypes.sports;
    }

    return imageUrl;
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    await regenerateActivity();
    setIsLoading(false);
  };

  if (!activity) {
    return null;
  }

  return (
    <div className="activity-card">
      <div className="activity-image">
        <img
          src={getActivityImage(activity.name)}
          alt={activity.name}
          className="activity-thumbnail"
        />
      </div>
      <div className="activity-content">
        <div className="activity-header">
          <h3>{activity.name || "Unnamed Activity"}</h3>
          <button
            className="reset-button"
            onClick={handleRegenerate}
            disabled={isLoading}
          >
            <FaRedo className={isLoading ? "spinning" : ""} />
          </button>
        </div>
        <p>{activity.description || "No description available"}</p>
        <p className="duration">⏱ Duration: {activity.length || "Unknown"}</p>
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

        .activity-card:hover {
          transform: translateY(-2px);
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
          transition: transform 0.3s ease;
        }

        .activity-card:hover .activity-thumbnail {
          transform: scale(1.05);
        }

        .activity-content {
          padding: 1.5rem;
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.25rem;
          font-weight: 600;
        }

        p {
          color: #3a506b;
          margin: 0.5rem 0;
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
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reset-button:hover {
          background-color: #edf5ff;
        }

        .reset-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
