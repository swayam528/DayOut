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

    // Define category keywords with broader matches
    const categories = {
      restaurant: [
        "restaurant",
        "cafe",
        "bar",
        "food",
        "dining",
        "bistro",
        "eatery",
        "pizzeria",
        "diner",
        "grill",
        "tavern",
        "pub",
      ],
      museum: [
        "museum",
        "gallery",
        "exhibit",
        "art",
        "cultural center",
        "historical",
        "heritage",
      ],
      outdoor: [
        "park",
        "garden",
        "nature",
        "trail",
        "botanical",
        "outdoor",
        "walking",
        "hiking",
        "beach",
      ],
      shopping: [
        "shop",
        "store",
        "mall",
        "boutique",
        "market",
        "retail",
        "shopping center",
      ],
      entertainment: [
        "theater",
        "cinema",
        "show",
        "movie",
        "concert",
        "performance",
        "venue",
        "entertainment",
        "arcade",
        "bowling",
        "fun",
        "activity",
      ],
      sports: [
        "sport",
        "fitness",
        "gym",
        "athletic",
        "recreation",
        "game",
        "arena",
        "stadium",
      ],
      attraction: [
        "attraction",
        "landmark",
        "monument",
        "point of interest",
        "tourist",
        "sightseeing",
      ],
    };

    // Check each category's keywords against both name and description
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => combined.includes(keyword))) {
        console.log(`Activity "${name}" matched category: ${category}`);
        return category;
      }
    }

    console.log(
      `No specific category match for "${name}", defaulting to "general"`
    );
    return "general";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPrompt = `
You are an AI travel planner. Create a ${tripLength}-hour ${timeOfDay} itinerary.

Important Requirements:
- Create exactly ${tripLength} different activities
- Each activity must be exactly 1 hour
- Total time must add up to ${tripLength} hours
- Activities must be suitable for ${numPeople} people aged ${ageRange[0]}-${
      ageRange[1]
    }
- Location: ${location || "any location"}
${additionalInfo ? `- Additional preferences: ${additionalInfo}` : ""}

IMPORTANT: For each activity, you MUST recommend a specific place (restaurant name, museum name, park name, etc.) in ${location}. Do not give generic suggestions.

For each activity, provide EXACTLY this format:
Activity Title: [specific place name]
Description: [brief description including why this specific place is recommended]
Duration: 1 hour
Highlight: [unique feature of this specific place]

Number each activity 1 through ${tripLength}. Do not add any extra text or explanations.
`;

    setLoading(true);

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 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",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: formattedPrompt }],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        }
      );

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content:", generatedContent);
      const parsedActivities = parseActivities(generatedContent);
      console.log("Parsed activities:", parsedActivities);
      setActivities(parsedActivities);
      setIsFormHidden(true);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }

    setLoading(false);
  };

  const handleRefresh = async (index) => {
    setLoading(true);
    const currentActivity = activities[index];
    const activityType = getActivityType(currentActivity);
    console.log(`Refreshing activity ${index}:`, currentActivity);
    console.log(`Detected activity type:`, activityType);

    const formattedPrompt = `
Generate ONE NEW 1-hour activity in ${
      location || "any location"
    } that is specifically a ${activityType.toUpperCase()} activity. 

IMPORTANT REQUIREMENTS:
1. Must be a REAL, SPECIFIC venue/place (not a generic suggestion)
2. Must be different from: ${Array.from(usedActivities).join(", ")}
3. Must be suitable for ${numPeople} people aged ${ageRange[0]}-${ageRange[1]}
4. Must be appropriate for ${timeOfDay} time
${additionalInfo ? `5. Must consider these preferences: ${additionalInfo}` : ""}

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
Activity Title: [specific ${activityType} name]
Description: [brief description explaining why this specific place is recommended]
Duration: 1 hour
Highlight: [unique feature or special aspect of this specific place]

Return ONLY this format with no additional text.`;

    try {
      console.log("Sending refresh prompt:", formattedPrompt);
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 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",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: formattedPrompt }],
            temperature: 0.9,
          }),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content:", generatedContent);
      const parsedActivities = parseActivities(generatedContent);
      console.log("Parsed new activity:", parsedActivities);

      if (
        parsedActivities &&
        parsedActivities.length > 0 &&
        parsedActivities[0].name !== "Error Parsing Activities"
      ) {
        const newActivity = parsedActivities[0];
        const newActivityType = getActivityType(newActivity);
        console.log(
          `New activity type: ${newActivityType}, Expected: ${activityType}`
        );

        setActivities((prevActivities) => {
          const newActivities = [...prevActivities];
          newActivities[index] = newActivity;
          return newActivities;
        });
      }
    } catch (error) {
      console.error("Error refreshing activity:", error);
    }
    setLoading(false);
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
                    className="range-value"
                    style={{
                      position: "absolute",
                      top: "28px",
                      color: "#000",
                    }}
                  >
                    {ageRange[index]}
                  </div>
                </div>
              )}
            />
            <div className="flex justify-between mt-2">
              <span className="range-value">{ageRange[0]}</span>
              <span className="range-value">{ageRange[1]}</span>
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
              apiKey="AIzaSyCCVRIu7ocfLNX6v1zkTCnDNN366J8Mj_k"
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
