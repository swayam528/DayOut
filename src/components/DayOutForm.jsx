import React, { useState } from "react";
import "./DayOutForm.css"; // Custom CSS for styling

const DayOutForm = () => {
  const [ageRange, setAgeRange] = useState({ min: 18, max: 30 });
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

  // Handle changes for the age range sliders
  const handleMinAgeChange = (e) => {
    const newMin = Math.min(Number(e.target.value), ageRange.max - 1);
    setAgeRange({ ...ageRange, min: newMin });
  };

  const handleMaxAgeChange = (e) => {
    const newMax = Math.max(Number(e.target.value), ageRange.min + 1);
    setAgeRange({ ...ageRange, max: newMax });
  };

  return (
    <div className="form-container">
      <h2>Create Your Perfect Day Out</h2>
      <form onSubmit={handleSubmit} className="day-out-form">
        {/* Age Range Selection */}
        <div className="form-group">
          <label>Age Range</label>
          <div className="range-group">
            <input
              type="range"
              min="1"
              max="100"
              value={ageRange.min}
              onChange={handleMinAgeChange}
              className="age-range-slider"
            />
            <span>{ageRange.min}</span>
            <span> to </span>
            <input
              type="range"
              min="1"
              max="100"
              value={ageRange.max}
              onChange={handleMaxAgeChange}
              className="age-range-slider"
            />
            <span>{ageRange.max}</span>
          </div>
        </div>

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

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your town"
          />
        </div>

        <div className="form-group">
          <label>Length of Trip (hours)</label>
          <input
            type="range"
            min="1"
            max="12"
            value={tripLength}
            onChange={(e) => setTripLength(e.target.value)}
          />
          <span>{tripLength} hours</span>
        </div>

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

        <div className="form-group">
          <label>Any Additional Information</label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Add any specific details or preferences here..."
          ></textarea>
        </div>

        <button type="submit" className="submit-button">
          Generate Day Out
        </button>
      </form>
    </div>
  );
};

export default DayOutForm;
