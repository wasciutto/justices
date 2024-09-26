import './App.css';
import React, { useState, useEffect } from 'react';

function DateSlider({ displayDate, sliderMin, sliderMax, sliderValue, handleSliderChange, handleSliderRelease }) {
  return (
    <div className='slider-panel'>
      <p className='date-label'> {displayDate} </p>
      <input 
        type="range" 
        min={sliderMin} 
        max={sliderMax}
        value={sliderValue} // Set the slider's initial value
        onChange={handleSliderChange}
        onMouseUp={handleSliderRelease}
      />
    </div>
  );
}

function App() {
  const DEFAULT_DATE_STR = "March 15, 1850";
  const START_TIMESTAMP = new Date("February 15, 1790").getTime();
  const END_TIMESTAMP = new Date().getTime();
  const SLIDER_MIN_VALUE = 0;
  const SLIDER_MAX_VALUE = 100;

  // Convenience functions for converting dates to slider values and reverse
  function dateToSliderValue(date) {
    const dateTimestamp = new Date(date).getTime();
  
    // Ensure the date is within the start and end range
    if (dateTimestamp < START_TIMESTAMP) {
      return SLIDER_MIN_VALUE; // If before start date, return minimum value
    }
    if (dateTimestamp > END_TIMESTAMP) {
      return SLIDER_MAX_VALUE; // If after end date, return maximum value
    }
  
    // Calculate the percentage of the date within the range
    const range = END_TIMESTAMP - START_TIMESTAMP;
    const adjustedValue = (dateTimestamp - START_TIMESTAMP) / range;
  
    // Convert to slider value (0-100)
    return adjustedValue * SLIDER_MAX_VALUE;
  }

  function sliderValueToDate(sliderValue) {
    // Ensure the slider value is within the defined range
    const clampedValue = Math.max(SLIDER_MIN_VALUE, Math.min(sliderValue, SLIDER_MAX_VALUE));
  
    let date;
  
    if (clampedValue === SLIDER_MIN_VALUE) {
      date = new Date(START_TIMESTAMP);
    } else if (clampedValue === SLIDER_MAX_VALUE) {
      date = new Date(END_TIMESTAMP);
    } else {
      // Calculate the date based on the slider value
      const range = END_TIMESTAMP - START_TIMESTAMP;
      date = new Date(START_TIMESTAMP + (clampedValue / SLIDER_MAX_VALUE) * range);
    }
  
    return date;
  }

  // Formats like "January 1, 1800"
  function dateToString(date) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  // Set the default slider value based on default date
  const SLIDER_DEFAULT_VALUE = dateToSliderValue(DEFAULT_DATE_STR);

  const fetchJustices = async (date) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get_justices_at_date?date=${date}`);
      const data = await response.json();
      return data
    } catch (error) {
      console.error('Error fetching justices:', error);
      return []; // Return an empty array on error to avoid breaking the component
    }
  };
  

  // App State
  const [sliderDisplayDate, setSliderDisplayDate] = useState(DEFAULT_DATE_STR);
  const [sliderValue, setSliderValue] = useState(SLIDER_DEFAULT_VALUE); // Set initial slider value
  const [justices, setJustices] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const fetchInitialJustices = async () => {
      setLoading(true); // Start loading
      const justicesData = await fetchJustices(DEFAULT_DATE_STR);
      setJustices(justicesData || []); // Update justices state
      setLoading(false); // Finished loading
    };

    fetchInitialJustices();
  }, []);

  // For updating the slider display date while sliding
  const handleSliderChange = async (event) => {
    const newSliderValue = event.target.value;
    setSliderValue(newSliderValue);

    const newSliderDate = sliderValueToDate(newSliderValue);
    const formattedDateStr = dateToString(newSliderDate);
    setSliderDisplayDate(formattedDateStr);
  };

  // For querying the API on slider mouse release
  const handleSliderRelease = async (event) => {
    const newSliderValue = event.target.value;
    
    const newSliderDate = sliderValueToDate(newSliderValue);
    const formattedDateStr = dateToString(newSliderDate);

    // Update the justices data with a query to API
    setLoading(true); // Start loading
    const justices_data = await fetchJustices(formattedDateStr);
    setJustices(justices_data || []); // Update justices state
    setLoading(false); // Finished loading
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className='justice-panel'>
          <h1> Justices </h1>
          {loading ? (
            <p>Loading justices...</p> // Show loading message
          ) : (
            <ul className='justice-list'>
              {justices.length > 0 ? (
                justices.map(justice => (
                  <li className='justice-list-item' key={justice.date_service_start}>
                    {justice.name}
                  </li>
                ))
              ) : (
                <li>No justices found for this date.</li>
              )}
            </ul>
          )}
        </div>
        <DateSlider 
          displayDate={sliderDisplayDate} 
          sliderMin={SLIDER_MIN_VALUE} 
          sliderMax={SLIDER_MAX_VALUE} 
          sliderValue={sliderValue} 
          handleSliderChange={handleSliderChange}
          handleSliderRelease={handleSliderRelease}
        />
      </header>
    </div>
  );
}

export default App;
