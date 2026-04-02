import { useState } from 'react';
import styles from './Calendar.module.css';

interface CalendarProps {
  onSelectDate: (date: string) => void;
  selectedDate?: string;
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function Calendar({ onSelectDate, selectedDate }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth()));

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, () => null);

  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function handlePreviousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  }

  function handleDayClick(day: number) {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onSelectDate(formatDate(selectedDateObj));
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={handlePreviousMonth} className={styles.navBtn}>
          ←
        </button>
        <h3 className={styles.monthYear}>{monthYear}</h3>
        <button onClick={handleNextMonth} className={styles.navBtn}>
          →
        </button>
      </div>

      <div className={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.days}>
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className={styles.emptyDay} />
        ))}
        {daysArray.map(day => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateStr = formatDate(date);
          const isSelected = selectedDate === dateStr;
          const isPast = date < today && dateStr !== formatDate(today);
          const isToday = formatDate(date) === formatDate(today);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`${styles.day} ${isSelected ? styles.selected : ''} ${
                isToday ? styles.today : ''
              } ${isPast ? styles.past : ''}`}
              disabled={isPast}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
