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

  const handleTimeOfDayChange = (value) => {
    setTimeOfDay(value);
  };

  const parseActivities = (content) => {
    try {
      const activitiesArray = [];
      // Split by numbered activities (1., 2., etc.)
      const activityBlocks = content.split(/\d+\./);

      // Remove empty first element if it exists
      if (activityBlocks[0].trim() === "") {
        activityBlocks.shift();
      }

      activityBlocks.forEach((block) => {
        if (block.trim()) {
          const titleMatch = block.match(/Activity Title:\s*([^\n]+)/i);
          const descriptionMatch = block.match(/Description:\s*([^\n]+)/i);
          const durationMatch = block.match(/Duration:\s*(\d+)\s*hour/i);
          const highlightMatch = block.match(/Highlight:\s*([^\n]+)/i);

          if (titleMatch) {
            activitiesArray.push({
              name: titleMatch[1].trim(),
              description: descriptionMatch ? descriptionMatch[1].trim() : "",
              length: durationMatch ? `${durationMatch[1]} hour` : "1 hour",
              highlight: highlightMatch ? highlightMatch[1].trim() : "",
              image: "",
            });
          }
        }
      });

      console.log("Number of activities parsed:", activitiesArray.length);

      // Ensure we have the correct number of activities
      if (activitiesArray.length === 0) {
        return [
          {
            name: "Error Parsing Activities",
            description: "Please try regenerating the itinerary",
            length: "1 hour",
            highlight: "Please try again",
            image: "",
          },
        ];
      }

      return activitiesArray;
    } catch (error) {
      console.error("Error parsing activities:", error);
      return [
        {
          name: "Error Parsing Activities",
          description: "Please try regenerating the itinerary",
          length: "1 hour",
          highlight: "Please try again",
          image: "",
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
  
  For each activity, provide EXACTLY this format:
  Activity Title: [name]
  Description: [brief description]
  Duration: 1 hour
  Highlight: [unique feature]
  
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
            temperature: 0.7, // Add this to ensure some variety
            max_tokens: 1000, // Add this to ensure we get full responses
          }),
        }
      );

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      console.log("Generated content:", generatedContent); // Add this for debugging
      const parsedActivities = parseActivities(generatedContent);
      console.log("Parsed activities:", parsedActivities); // Add this for debugging
      setActivities(parsedActivities);
      setIsFormHidden(true);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }

    setLoading(false);
  };

  const handleRefresh = async (index) => {
    setLoading(true);
    const formattedPrompt = `
Create a ${tripLength}-hour ${timeOfDay} itinerary for ${numPeople} people aged ${
      ageRange[0]
    }-${ageRange[1]} in ${location || "any location"}. ${
      additionalInfo ? "Additional preferences: " + additionalInfo : ""
    }

Format each activity exactly like this (provide ${tripLength} activities total, each 1 hour long):
Activity Title: [name]
Description: [brief description]
Duration: 1 hour
Highlight: [unique feature]
`;
    // const formattedPrompt = `
    //   You are a travel planner assistant. Plan a single activity based on these criteria:
    //   1. Age Range: ${ageRange[0]}-${ageRange[1]}
    //   2. Number of People: ${numPeople}
    //   3. Location: ${location || "unspecified"}
    //   4. Time of Day: ${timeOfDay}
    //   5. Additional Preferences: ${additionalInfo || "None"}

    //   Provide exactly one activity with this format:
    //   Activity Title: [name of activity]
    //   Description: [detailed description]
    //   Duration: [X] hour
    //   Highlight: [unique feature or selling point]

    //   The activity should:
    //   - Be realistic based on the time and location
    //   - Cost less than $30 per person
    //   - Be appropriate for the specified age range and group size
    // `;

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
          }),
        }
      );

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      // Parse the single activity
      const activities = parseActivities(generatedContent);
      if (activities && activities.length > 0) {
        setActivities((prevActivities) => {
          const newActivities = [...prevActivities];
          newActivities[index] = activities[0];
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
