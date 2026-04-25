import { useState, useEffect, useRef } from 'react';
import { FaClock } from 'react-icons/fa';
import './Booking.css';

const CustomTimePicker = ({ selectedTime, onChange, label, startTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours12 = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];
  const periods = ['AM', 'PM'];

  const formatDisplayTime = (time24) => {
    if (!time24) return 'Select Time';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${period}`;
  };

  const getSuggestions = () => {
    if (!startTime) return [];
    const [h, m] = startTime.split(':').map(n => parseInt(n, 10));
    const startTotalMin = h * 60 + m;
    
    const suggestions = [];
    const durations = [0.5, 1, 1.5, 2, 2.5, 3];
    
    durations.forEach(d => {
      const totalMin = startTotalMin + d * 60;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      const time24 = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      suggestions.push({
        value: time24,
        label: `${formatDisplayTime(time24)} (${d} ${d === 1 ? 'hour' : 'hours'})`
      });
    });
    
    return suggestions;
  };

  const handleTimeSelect = (h, m, p) => {
    let hour24 = parseInt(h, 10);
    if (p === 'PM' && hour24 < 12) hour24 += 12;
    if (p === 'AM' && hour24 === 12) hour24 = 0;
    
    const formattedHour = hour24.toString().padStart(2, '0');
    onChange(`${formattedHour}:${m}`);
  };

  const currentHour24 = selectedTime ? parseInt(selectedTime.split(':')[0], 10) : 9;
  const currentDisplayHour = (currentHour24 % 12 || 12).toString().padStart(2, '0');
  const currentMin = selectedTime ? selectedTime.split(':')[1] : '00';
  const currentPeriod = currentHour24 >= 12 ? 'PM' : 'AM';

  const suggestions = getSuggestions();

  return (
    <div className="custom-picker-container" ref={containerRef}>
      <label className="bk-form-label">{label}</label>
      <div className="custom-picker-input" onClick={() => setIsOpen(!isOpen)}>
        <FaClock className="picker-icon" />
        <span>{formatDisplayTime(selectedTime)}</span>
      </div>

      {isOpen && (
        <div className="time-dropdown">
          {startTime && !showCustom ? (
            <div className="suggestions-list">
              {suggestions.map((s, idx) => (
                <div 
                  key={idx} 
                  className={`suggestion-item ${selectedTime === s.value ? 'selected' : ''}`}
                  onClick={() => { onChange(s.value); setIsOpen(false); }}
                >
                  {s.label}
                </div>
              ))}
              <div className="suggestion-item custom-link" onClick={() => setShowCustom(true)}>
                Custom...
              </div>
            </div>
          ) : (
            <>
              <div className="time-grid-3">
                <div className="time-column">
                  <div className="column-label">Hr</div>
                  {hours12.map(h => (
                    <div 
                      key={h} 
                      className={`time-option ${currentDisplayHour === h ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(h, currentMin, currentPeriod)}
                    >
                      {h}
                    </div>
                  ))}
                </div>
                <div className="time-column">
                  <div className="column-label">Min</div>
                  {minutes.map(m => (
                    <div 
                      key={m} 
                      className={`time-option ${currentMin === m ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(currentDisplayHour, m, currentPeriod)}
                    >
                      {m}
                    </div>
                  ))}
                </div>
                <div className="time-column">
                  <div className="column-label">AM/PM</div>
                  {periods.map(p => (
                    <div 
                      key={p} 
                      className={`time-option ${currentPeriod === p ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(currentDisplayHour, currentMin, p)}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" className="time-done-btn" onClick={() => setIsOpen(false)}>Done</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
