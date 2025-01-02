import React, { useState } from "react";
import { Range, getTrackBackground } from "react-range";
import GooglePlacesAutocomplete from "react-google-autocomplete";
import "./DayOutForm.css"; // Custom CSS for styling

const DayOutForm = () => {
  const [ageRange, setAgeRange] = useState([18, 30]);
  const [numPeople, setNumPeople] = useState(1);
  const [location, setLocation] = useState("");
  const [tripLength, setTripLength] = useState(4);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleTimeOfDayChange = (value) => {
    setTimeOfDay(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ageRange,
      numPeople,
      location,
      tripLength,
      timeOfDay,
      additionalInfo,
    };
    console.log("Submitted Data:", formData);
    alert("Form Submitted! Check the console for details.");
  };

  return (
    <div className="form-container">
      <h2>Create Your Perfect Day Out</h2>
      <form onSubmit={handleSubmit} className="day-out-form">
        {/* Age Range */}
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
            renderThumb={({ props, isDragged }) => (
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
              </div>
            )}
          />
          <div className="flex justify-between mt-2">
            <span className="under-numbers">{ageRange[0]}</span>
            <span className="under-numbers">{ageRange[1]}</span>
          </div>
        </div>

        {/* Number of People */}
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

        {/* Location */}
        <div className="form-group">
          <label>Location</label>
          <GooglePlacesAutocomplete
            apiKey="AIzaSyBUS2OUq9oGdalL3OeF-H_oDXK0Q5kOUio"
            onPlaceSelected={(place) => setLocation(place.formatted_address)}
            placeholder="Enter your town or city"
            options={{
              types: ["(cities)"],
              componentRestrictions: { country: "us" },
            }}
            className="google-autocomplete"
          />
        </div>

        {/* Trip Length */}
        <div className="form-group">
          <label>Length of Trip (hours)</label>
          <input
            type="range"
            min="1"
            max="12"
            value={tripLength}
            onChange={(e) => setTripLength(e.target.value)}
          />
          <span style={{ paddingTop: 10 }} className="under-numbers">
            {tripLength} hours
          </span>
        </div>

        {/* Time of Day */}
        <div className="form-group">
          <label>Time of Day</label>
          <div className="time-of-day-group">
            <button
              type="button"
              className={timeOfDay === "day" ? "active" : ""}
              onClick={() => handleTimeOfDayChange("day")}
            >
              🌞 Morning
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

        {/* Additional Info */}
        <div className="form-group">
          <label>Any Additional Information</label>
          <textarea
            className="under-numbers"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Add any specific details or preferences here..."
          ></textarea>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-button">
          Generate Day Out
        </button>
      </form>
    </div>
  );
};

export default DayOutForm;
