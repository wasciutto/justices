import './App.css';
import React, { useState } from 'react';

function DateSlider({date, sliderValue, handleSliderChange}) {
  return (
    <div className='slider-panel'>
      <p className='date-label'> {date} </p>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderValue} // Set the slider's initial value
        onChange={handleSliderChange} 
      />
    </div>
  );
}

function App() {
  const startDate = new Date('1789-10-05').getTime();
  const endDate = new Date('2024-05-05').getTime();
  const range = endDate - startDate;

  // Calculate the initial slider value to match the default date
  const initialDate = new Date('1789-10-05').getTime();
  const initialValue = ((initialDate - startDate) / range) * 100;

  const fetchJustices = async (date) => {
    // Fetch justices for the selected date
    try {
      const response = await fetch(`http://localhost:5000/get_justices_at_date?date=${date.toISOString().split('T')[0]}`);
      const data = await response.json();
      return data.justices;
      
    } catch (error) {
      console.error('Error fetching justices:', error);
    }
  };

  const [date, setDate] = useState('October 5, 1789');
  const [sliderValue, setSliderValue] = useState(initialValue); // Set initial slider value
  const [justices, setJustices] = useState(fetchJustices(initialDate))

  

  const handleSliderChange = async (event) => {
    const { value } = event.target;
    setSliderValue(value);  // Update slider value

    const newDate = new Date(startDate + (range * value) / 100);
    const formattedDate = new Date(newDate);
    const dateString = `${formattedDate.toLocaleString('default', { month: 'long' })} ${formattedDate.getDate()}, ${formattedDate.getFullYear()}`;
    setDate(dateString);

    // Update the justices data with a query to API
    const justices_data = await fetchJustices(newDate)
    setJustices(justices_data); // Update the justices state with the response
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
        <DateSlider date={date} sliderValue={sliderValue} handleSliderChange={handleSliderChange} />
      </header>
    </div>
  );
}

export default App;
