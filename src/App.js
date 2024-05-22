import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './App.css'; // Import the CSS file

const App = () => {
  const [formData, setFormData] = useState({
    day: '',
    client: '',
    location: '',
    type: '',
    name: '',
    times: [{ startTime: '', endTime: '' }],
    rate: '',
    driveTime: false,
  });

  const [output, setOutput] = useState('');

  useEffect(() => {
    const savedData = Cookies.get('formData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (name === 'startTime' || name === 'endTime') {
      const newTimes = formData.times.map((time, idx) => {
        if (idx === index) {
          return { ...time, [name]: value };
        }
        return time;
      });
      setFormData({
        ...formData,
        times: newTimes,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, { startTime: '', endTime: '' }],
    });
  };

  const removeTimeSlot = (index) => {
    const newTimes = formData.times.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      times: newTimes,
    });
  };

  const handleSave = () => {
    Cookies.set('formData', JSON.stringify(formData), { expires: 7 });
    alert('Data saved. Note: This site uses cookies.');
  };

  const calculateHours = (times) => {
    return times.reduce((total, { startTime, endTime }) => {
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startDate = new Date(0, 0, 0, startHours, startMinutes, 0);
      const endDate = new Date(0, 0, 0, endHours, endMinutes, 0);
      const diff = endDate - startDate;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      return total + hours + minutes / 60;
    }, 0);
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute < 10 ? '0' : ''}${minute}${ampm}`;
  };

  const formatDate = (date) => {
    const [year, month, day] = date.split('-').map(Number);
    return `${month}/${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hoursWorked = calculateHours(formData.times);
    const earnings = hoursWorked * formData.rate;
    let result = `${formatDate(formData.day)} ${formData.client} (${formData.location}) ${formData.type.toUpperCase()}\n`;
    result += `${formData.name}: `;
    result += formData.times.map(({ startTime, endTime }) => `${formatTime(startTime)} - ${formatTime(endTime)}`).join(' ; ');
    result += `\nTotal: ${hoursWorked.toFixed(2)} Hrs x $${formData.rate} = $${earnings.toFixed(2)}\n`;
    if (formData.driveTime) {
      result += `\nDrive Time: $20`;
    }
    setOutput(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Output copied to clipboard!');
  };

  return (
    <div className="container">
      <h1 className="title">Contractor Calculator</h1>
      <form onSubmit={handleSubmit} className="form">
  <input type="date" name="day" value={formData.day} onChange={handleChange} className="input" placeholder="Date" required />
  <input type="text" name="client" placeholder="Client" value={formData.client} onChange={handleChange} className="input" required />
  <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="input" required />
  <input type="text" name="type" placeholder="Type" value={formData.type} onChange={handleChange} className="input" required />
  <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="input" required />
  {formData.times.map((time, index) => (
    <div key={index} className="time-slot">
      <input type="time" name="startTime" value={time.startTime} onChange={(e) => handleChange(e, index)} className="input" placeholder="Start Time" required />
      <input type="time" name="endTime" value={time.endTime} onChange={(e) => handleChange(e, index)} className="input" placeholder="End Time" required />
      {index > 0 && <button type="button" onClick={() => removeTimeSlot(index)} className="remove-button">Remove</button>}
    </div>
  ))}
  <button type="button" onClick={addTimeSlot} className="add-button">Add Break Time</button>
  <input type="number" name="rate" placeholder="Rate" value={formData.rate} onChange={handleChange} className="input" required />
  <label className="checkbox">
    <input type="checkbox" name="driveTime" checked={formData.driveTime} onChange={handleChange} />
    Drive Time
  </label>
  <div className="button-group">
    <button type="submit" className="button">Calculate</button>
    <button type="button" onClick={handleSave} className="button">Save</button>
  </div>
</form>

      <div className="output-container">
        <pre className="output">{output}</pre>
        <button onClick={copyToClipboard} className="copy-button">Copy</button>
      </div>
    </div>
  );
};

export default App;
