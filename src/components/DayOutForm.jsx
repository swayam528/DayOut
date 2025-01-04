  import React, { useState } from "react";
  import { Range, getTrackBackground } from "react-range";
  import GooglePlacesAutocomplete from "react-google-autocomplete";
  import Activity from "./Activity";
  import "./DayOutForm.css";
  import { FiArrowLeft, FiRefreshCcw } from "react-icons/fi";

  const DayOutForm = () => {
    const [ageRange, setAgeRange] = useState([18, 30]);
    const [numPeople, setNumPeople] = useState(1);
    const [location, setLocation] = useState("");
    const [tripLength, setTripLength] = useState(4);
    const [timeOfDay, setTimeOfDay] = useState("day");
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormHidden, setIsFormHidden] = useState(false);
    const [usedActivities, setUsedActivities] = useState(new Set());

    const getActivityType = (activity) => {
      const name = activity.name.toLowerCase();
      const description = activity.description.toLowerCase();
      const combined = `${name} ${description}`;

      const categoryScores = {
        restaurant: 0,
        museum: 0,
        outdoor: 0,
        shopping: 0,
        entertainment: 0,
        sports: 0,
        attraction: 0,
      };

      const categoryKeywords = {
        restaurant: {
          primary: ["restaurant", "cafe", "bistro", "eatery", "dining"],
          secondary: [
            "food",
            "bar",
            "grill",
            "tavern",
            "pub",
            "pizzeria",
            "diner",
          ],
        },
        museum: {
          primary: ["museum", "gallery", "exhibition"],
          secondary: ["art", "cultural", "historical", "heritage", "exhibit"],
        },
        outdoor: {
          primary: ["park", "garden", "trail", "beach"],
          secondary: ["nature", "botanical", "outdoor", "walking", "hiking"],
        },
        shopping: {
          primary: ["mall", "shop", "store", "market"],
          secondary: ["boutique", "retail", "shopping center", "plaza"],
        },
        entertainment: {
          primary: ["theater", "cinema", "concert", "venue"],
          secondary: [
            "show",
            "movie",
            "performance",
            "arcade",
            "bowling",
            "entertainment",
          ],
        },
        sports: {
          primary: ["stadium", "arena", "gym", "court"],
          secondary: ["sport", "fitness", "athletic", "recreation", "game"],
        },
        attraction: {
          primary: ["monument", "landmark", "tourist", "attraction"],
          secondary: ["point of interest", "sightseeing", "historic site"],
        },
      };

      // Calculate scores for each category
      Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        // Primary keywords get 2 points
        keywords.primary.forEach((keyword) => {
          if (combined.includes(keyword)) categoryScores[category] += 2;
        });
        // Secondary keywords get 1 point
        keywords.secondary.forEach((keyword) => {
          if (combined.includes(keyword)) categoryScores[category] += 1;
        });
      });

      // Get category with highest score
      const topCategory = Object.entries(categoryScores).reduce(
        (max, [category, score]) =>
          score > max.score ? { category, score } : max,
        { category: "general", score: 0 }
      );

      return topCategory.score > 0 ? topCategory.category : "general";
    };

    const handleTimeOfDayChange = (value) => {
      setTimeOfDay(value);
    };

    const parseActivities = (content) => {
      try {
        const activitiesArray = [];
        const activityBlocks = content.split(/\d+\./);

        if (activityBlocks[0].trim() === "") {
          activityBlocks.shift();
        }

        activityBlocks.forEach((block) => {
          if (block.trim()) {
            const titleMatch = block.match(/Activity Title:\s*([^\n]+)/i);
            const descriptionMatch = block.match(/Description:\s*([^\n]+)/i);
            const durationMatch = block.match(/Duration:\s*(\d+)\s*hour/i);
            const highlightMatch = block.match(/Highlight:\s*([^\n]+)/i);

            if (titleMatch && !usedActivities.has(titleMatch[1].trim())) {
              const activity = {
                name: titleMatch[1].trim(),
                description: descriptionMatch ? descriptionMatch[1].trim() : "",
                length: durationMatch ? `${durationMatch[1]} hour` : "1 hour",
                highlight: highlightMatch ? highlightMatch[1].trim() : "",
              };
              activitiesArray.push(activity);
              setUsedActivities((prev) => new Set([...prev, activity.name]));
            }
          }
        });

        return activitiesArray.length > 0
          ? activitiesArray
          : [
              {
                name: "Error Parsing Activities",
                description: "Please try regenerating the itinerary",
                length: "1 hour",
                highlight: "Please try again",
              },
            ];
      } catch (error) {
        console.error("Error parsing activities:", error);
        return [
          {
            name: "Error Parsing Activities",
            description: "Please try regenerating the itinerary",
            length: "1 hour",
            highlight: "Please try again",
          },
        ];
      }
    };

    const createPrompt = (
      isRefresh = false,
      activityType = null,
      excludeActivities = []
    ) => {
      const basePrompt = `You are a local expert travel planner for ${
        location || "this area"
      }. ${
        isRefresh
          ? "Generate ONE new activity"
          : `Create a ${tripLength}-hour ${timeOfDay} itinerary`
      }.

  Requirements:
  - Each activity MUST be a REAL, SPECIFIC venue/location in ${
        location || "the area"
      }
  - Activities must be suitable for ${numPeople} people aged ${ageRange[0]}-${
        ageRange[1]
      }
  - Activities must be appropriate for ${timeOfDay} time
  ${additionalInfo ? `- Consider these preferences: ${additionalInfo}` : ""}
  ${
    excludeActivities.length > 0
      ? `- Must be different from these places: ${excludeActivities.join(", ")}`
      : ""
  }
  ${activityType ? `- Must be a ${activityType.toUpperCase()} activity` : ""}

  REQUIRED FORMAT:
  Activity Title: [Exact name of specific venue/place]
  Description: [2-3 sentences about why this specific place is perfect for the group]
  Duration: 1 hour
  Highlight: [One unique or special feature of this specific place]

  ${
    !isRefresh
      ? `Generate exactly ${tripLength} different activities, numbered 1 through ${tripLength}.`
      : ""
  }
  Focus on highly-rated, popular places that are currently open and operational.`;

      return basePrompt;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "user",
                  content: createPrompt(),
                },
              ],
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const parsedActivities = parseActivities(data.choices[0].message.content);
        setActivities(parsedActivities);
        setIsFormHidden(true);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleRefresh = async (index) => {
      setLoading(true);
      const currentActivity = activities[index];
      const activityType = getActivityType(currentActivity);

      // Get all activity names except the current one being refreshed
      const excludeActivities = Array.from(usedActivities).filter(
        (name) => name !== currentActivity.name
      );

      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "user",
                  content: createPrompt(true, activityType, excludeActivities),
                },
              ],
              temperature: 0.8,
            }),
          }
        );

        const data = await response.json();
        const parsedActivities = parseActivities(data.choices[0].message.content);

        if (
          parsedActivities &&
          parsedActivities[0] &&
          parsedActivities[0].name !== "Error Parsing Activities"
        ) {
          setActivities((prevActivities) => {
            const newActivities = [...prevActivities];
            newActivities[index] = parsedActivities[0];
            return newActivities;
          });
        }
      } catch (error) {
        console.error("Error refreshing activity:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleBackToForm = () => {
      setIsFormHidden(false);
      setActivities([]);
    };

    const handleReset = () => {
      setLocation("");
      setActivities([]);
      setAgeRange([18, 30]);
      setNumPeople(1);
      setTripLength(4);
      setTimeOfDay("day");
      setAdditionalInfo("");
      setIsFormHidden(false);
      setUsedActivities(new Set());
    };

    return (
      <div className="form-container">
        {isFormHidden ? (
          <div className="activities-container">
            <div className="top-nav">
              <button
                className="back-button"
                style={{ color: "black" }}
                onClick={handleBackToForm}
              >
                <FiArrowLeft size={24} />
              </button>
              {/* <button className="reset-button" onClick={handleReset}>
                <FiRefreshCcw size={24} />
              </button> */}
            </div>

            {activities.map((activity, index) => (
              <Activity
                key={index}
                activity={activity}
                regenerateActivity={() => handleRefresh(index)}
              />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="day-out-form">
            {/* Age Range Selection */}
            <div className="form-group">
              <label>Age Range</label>
              <div style={{ marginBottom: "26px" }}>
                {" "}
                {/* Added margin container */}
                <Range
                  values={ageRange}
                  step={1}
                  min={0}
                  max={100}
                  onChange={(values) => setAgeRange(values)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: "6px",
                        width: "100%",
                        background: getTrackBackground({
                          values: ageRange,
                          colors: ["#ccc", "#007bff", "#ccc"],
                          min: 0,
                          max: 100,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, isDragged, index }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: "24px",
                        width: "24px",
                        borderRadius: "12px",
                        backgroundColor: "#007bff",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0px 2px 6px #AAA",
                      }}
                    >
                      <div
                        style={{
                          height: "16px",
                          width: "5px",
                          backgroundColor: isDragged ? "#007bff" : "#CCC",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "24px",
                          color: "#000",
                          fontSize: "14px",
                          fontWeight: "500",
                          padding: "4px",
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          whiteSpace: "nowrap",
                          transform: "translateX(-50%)",
                          left: "50%",
                        }}
                      >
                        {ageRange[index]}
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Number of People Input */}
            <div className="form-group">
              <label>Number of People</label>
              <input
                type="number"
                value={numPeople}
                onChange={(e) => setNumPeople(e.target.value)}
                min="1"
                placeholder="Enter number of people"
              />
            </div>

            {/* Location Input */}
            <div className="form-group">
              <label>Location</label>
              <GooglePlacesAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place) => setLocation(place.formatted_address)}
                placeholder="Enter your town or city"
                options={{
                  types: ["(cities)"],
                  componentRestrictions: { country: "us" },
                }}
                className="google-autocomplete"
                style={{ backgroundColor: "#d0e4fa", color: "#000" }}
              />
            </div>

            {/* Trip Length Range */}
            <div className="form-group">
              <label>Length of Trip (hours)</label>
              <input
                type="range"
                min="1"
                max="12"
                value={tripLength}
                onChange={(e) => setTripLength(e.target.value)}
              />
              <span
                className="range-value"
                style={{ color: "black", paddingTop: 10 }}
              >
                {tripLength} hours
              </span>
            </div>

            {/* Time of Day Button Group */}
            <div className="form-group">
              <label>Time of Day</label>
              <div className="time-of-day-group">
                <button
                  type="button"
                  className={timeOfDay === "day" ? "active" : ""}
                  onClick={() => handleTimeOfDayChange("day")}
                >
                  🌞 Day
                </button>
                <button
                  type="button"
                  className={timeOfDay === "afternoon" ? "active" : ""}
                  onClick={() => handleTimeOfDayChange("afternoon")}
                >
                  🌅 Afternoon
                </button>
                <button
                  type="button"
                  className={timeOfDay === "night" ? "active" : ""}
                  onClick={() => handleTimeOfDayChange("night")}
                >
                  🌙 Night
                </button>
              </div>
            </div>

            {/* Additional Information Input */}
            <div className="form-group">
              <label>Any Additional Information</label>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Add any specific details or preferences here..."
                style={{ color: "#000" }}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              {loading ? "Generating..." : "Generate Day Out"}
            </button>
          </form>
        )}
      </div>
    );
  };

  export default DayOutForm;
