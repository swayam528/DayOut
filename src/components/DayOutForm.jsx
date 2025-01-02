import React, { useState } from "react";
import { Range, getTrackBackground } from "react-range";
import GooglePlacesAutocomplete from "react-google-autocomplete";
import Activity from "./Activity"; // Importing the new Activity component
import "./DayOutForm.css"; // Custom CSS for styling. Test generated activites.

const DayOutForm = () => {
  const [ageRange, setAgeRange] = useState([18, 30]);
  const [numPeople, setNumPeople] = useState(1);
  const [location, setLocation] = useState("");
  const [tripLength, setTripLength] = useState(4);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormHidden, setIsFormHidden] = useState(false); // New state to manage form visibility

  const handleTimeOfDayChange = (value) => {
    setTimeOfDay(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the prompt dynamically based on form inputs
    const formattedPrompt = `
      You are a travel planner assistant. Plan a perfect day out based on these criteria:

      1. Age Range: ${ageRange[0]}-${ageRange[1]}
      2. Number of People: ${numPeople}
      3. Location: ${location || "unspecified"}
      4. Trip Length: ${tripLength} hours
      5. Time of Day: ${timeOfDay}
      6. Additional Preferences: ${additionalInfo || "None"}

      Provide activities with:
      - A title (name of the activity)
      - A description (what is the activity)
      - A duration in hours
      - A unique highlight (optional, to make it stand out)

      Limit the total number of activities to match the trip length.
      For instance, if the trip is 2 hours, provide no more than 2 activities (1 hour each). If it's 4 hours, provide 3 or 4 activities.

      The activities should be realistic based on the time and location.

      Avoid activities that cost more than $30 per person.

      Example output (for a 4-hour trip in New York):
      1. Activity Title: Central Park Walk
         - Description: A leisurely stroll through Central Park to enjoy nature and the city’s skyline.
         - Duration: 2 hours
         - Highlight: Visit Bethesda Terrace and Fountain.

      2. Activity Title: Times Square Visit
         - Description: Take in the lights and excitement of Times Square, perfect for people-watching.
         - Duration: 1 hour
         - Highlight: Visit the massive digital billboards.

      3. Activity Title: Broadway Show
         - Description: Watch a famous Broadway show for an evening of entertainment.
         - Duration: 1 hour
         - Highlight: Experience the magic of live theater.
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
          }),
        }
      );

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      const parsedActivities = parseActivities(generatedContent);
      setActivities(parsedActivities);
      setIsFormHidden(true); // Hide the form after generating activities
    } catch (error) {
      console.error("Error fetching activities:", error);
    }

    setLoading(false);
  };

  const parseActivities = (content) => {
    // Parse the activities from the AI's response
    const activitiesArray = [];
    const activityMatches = content.match(
      /(\d+)\.\s*Activity Title: ([^\n]+)[\s\S]+?Duration:\s*(\d+)\s*hour/gi
    );

    if (activityMatches) {
      activityMatches.forEach((match) => {
        const [fullMatch, activityNumber, activityTitle, duration] =
          match.match(
            /(\d+)\.\s*Activity Title: ([^\n]+)[\s\S]+?Duration:\s*(\d+)\s*hour/
          );
        const descriptionMatch = match.match(/- Description:\s*([^\n]+)/);
        const description = descriptionMatch
          ? descriptionMatch[1]
          : "No description available";

        activitiesArray.push({
          name: activityTitle,
          description: description,
          length: `${duration} hour`,
          image: "", // Placeholder for image URL
        });
      });
    }

    // Limit activities to the trip length
    return activitiesArray.slice(0, tripLength);
  };

  return (
    <div className="form-container">
      <h2>Create Your Perfect Day Out</h2>
      {!isFormHidden && (
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

      {/* Display Activities */}
      {activities.length > 0 && (
        <div className="activities-container">
          {activities.map((activity, index) => (
            <Activity key={index} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DayOutForm;
