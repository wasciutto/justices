import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

function DateSlider() {
  const [date, setDate] = useState('October 5, 1789');

  const handleSliderChange = (event) => {
    const { value } = event.target;
    const startDate = new Date('1789-10-05').getTime();
    const endDate = new Date('2024-05-05').getTime();
    const range = endDate - startDate;
    const newDate = new Date(startDate + (range * value) / 100);
    const formattedDate = new Date(newDate);
    const dateString = `${formattedDate.toLocaleString('default', { month: 'long' })} ${formattedDate.getDate()}, ${formattedDate.getFullYear()}`;
    setDate(dateString);
  };

  return (
    <div className='slider-panel'>
      <h1> Slider </h1>
      <p className='date-label'> {date} </p>
      <input type="range" min="0" max="100" onChange={handleSliderChange} />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className='justice-panel'>
          <h1> Justices </h1>
          <ul className='justice-list'>
            <li>Chief Justice</li>
            <li>Associate Justice 1</li>
            <li>Associate Justice 2</li>
            <li>Associate Justice 3</li>
          </ul>
        </div>
        <DateSlider />
      </header>
    </div>
  );
}

export default App;
