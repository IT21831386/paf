import { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';
import './Booking.css';

const CustomDatePicker = ({ selectedDate, onChange, label, minDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const year = currentMonth.getFullYear();
    const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${d}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty spaces for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysCount; i++) {
      const dateObj = new Date(year, month, i);
      const yearStr = dateObj.getFullYear();
      const monthStr = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = dateObj.getDate().toString().padStart(2, '0');
      const dateString = `${yearStr}-${monthStr}-${dayStr}`;

      const isSelected = selectedDate === dateString;
      const isToday = today.getFullYear() === yearStr && 
                      today.getMonth() === month && 
                      today.getDate() === i;
      
      let isDisabled = dateObj < today;
      if (minDate) {
        const minDateObj = new Date(minDate);
        minDateObj.setHours(0, 0, 0, 0);
        isDisabled = dateObj < minDateObj;
      }

      days.push(
        <div
          key={i}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isDisabled ? 'disabled' : ''}`}
          onClick={() => !isDisabled && handleDateClick(i)}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="custom-picker-container" ref={containerRef}>
      <label className="bk-form-label">{label}</label>
      <div className="custom-picker-input" onClick={() => setIsOpen(!isOpen)}>
        <FaCalendarAlt className="picker-icon" />
        <span>{selectedDate || 'Select Date'}</span>
      </div>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" onClick={handlePrevMonth}><FaChevronLeft /></button>
            <div className="current-month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth}><FaChevronRight /></button>
          </div>
          <div className="calendar-weekdays">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="calendar-grid">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
