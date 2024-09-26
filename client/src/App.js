import './App.css';
import React, { useState, useEffect } from 'react';

function DateSlider({displayDate, sliderMin, sliderMax, sliderValue, handleSliderChange}) {
  return (
    <div className='slider-panel'>
      <p className='date-label'> {displayDate} </p>
      <input 
        type="range" 
        min={sliderMin} 
        max={sliderMax}
        value={sliderValue} // Set the slider's initial value
        onChange={handleSliderChange} 
      />
    </div>
  );
}

function App() {
  const DEFAULT_DATE_STR = "March 15, 1850"
  const START_TIMESTAMP = new Date("February 15, 1790").getTime()
  const END_TIMESTAMP = new Date().getTime()
  const SLIDER_MIN_VALUE = 0
  const SLIDER_MAX_VALUE = 100

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
  const SLIDER_DEFAULT_VALUE = dateToSliderValue(DEFAULT_DATE_STR)

  const fetchJustices = async (date) => {
    // Fetch justices for the selected date
    try {
      const response = await fetch(`http://localhost:5000/get_justices_at_date?date=${date}`);
      const data = await response.json();
      return data.justices;
      
    } catch (error) {
      console.error('Error fetching justices:', error);
    }
  };

  // App State
  const [sliderDisplayDate, setSliderDisplayDate] = useState(DEFAULT_DATE_STR);
  const [sliderValue, setSliderValue] = useState(SLIDER_DEFAULT_VALUE); // Set initial slider value
  const [justices, setJustices] = useState([])

  // useEffect(() => {
  //   const fetchInitialJustices = async () => {
  //     const justicesData = await fetchJustices(date);
  //     setJustices(justicesData);
  //   };
  
  //   fetchInitialJustices();
  // }, []);

  const handleSliderChange = async (event) => {
    const newSliderValue = event.target.value
    setSliderValue(newSliderValue)

    const newSliderDate = sliderValueToDate(newSliderValue)
    const formattedDateStr = dateToString(newSliderDate)
    
    //const dateString = `${formattedDate.toLocaleString('default', { month: 'long' })} ${formattedDate.getDate()}, ${formattedDate.getFullYear()}`;
    setSliderDisplayDate(formattedDateStr);

    // Update the justices data with a query to API
    //const justices_data = await fetchJustices(newDate)
    //setJustices(justices_data); // Update the justices state with the response
  };

  const justiceList = justices.map(justice =>
    <li key={justice.date_service_start}>
      {justice.name}
    </li>
  );

  return (
    <div className="App">
      <header className="App-header">
        <div className='justice-panel'>
          <h1> Justices </h1>
          <ul className='justice-list'>
            {justiceList}
          </ul>
        </div>
        <DateSlider displayDate={sliderDisplayDate} sliderMin={SLIDER_MIN_VALUE} sliderMax={SLIDER_MAX_VALUE} sliderValue={sliderValue} handleSliderChange={handleSliderChange} />
      </header>
    </div>
  );
}

export default App;
