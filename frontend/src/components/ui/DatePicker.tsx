import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon,
    X
} from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isSameDay, 
    addDays, 
    eachDayOfInterval,
    isToday,
    parseISO
} from 'date-fns';
import styles from './DatePicker.module.css';

interface DatePickerProps {
    value: string; // ISO format YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export default function DatePicker({
    value,
    onChange,
    label,
    placeholder = 'Select date...',
    className = ''
}: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value ? parseISO(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedDate = useMemo(() => value ? parseISO(value) : null, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleDateClick = (date: Date) => {
        onChange(format(date, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => (
        <div className={styles.calendarHeader}>
            <button onClick={prevMonth} className={styles.navBtn} type="button">
                <ChevronLeft size={18} />
            </button>
            <div className={styles.monthDisplay}>
                {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button onClick={nextMonth} className={styles.navBtn} type="button">
                <ChevronRight size={18} />
            </button>
        </div>
    );

    const renderDays = () => {
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        return (
            <div className={styles.daysRow}>
                {days.map(day => <div key={day} className={styles.dayName}>{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className={styles.cellsGrid}>
                {calendarDays.map(day => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                ${styles.cell} 
                                ${!isCurrentMonth ? styles.disabled : ''} 
                                ${isSelected ? styles.selected : ''}
                                ${isCurrentDay ? styles.today : ''}
                            `}
                            onClick={() => handleDateClick(day)}
                        >
                            <span className={styles.dayNumber}>{format(day, 'd')}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`${styles.container} ${className}`} ref={containerRef}>
            {label && <label className={styles.label}>{label}</label>}
            <div 
                className={`${styles.inputWrapper} ${isOpen ? styles.inputActive : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon size={16} className={styles.calendarIcon} />
                <span className={value ? styles.valText : styles.placeholder}>
                    {value ? format(parseISO(value), 'dd MMM yyyy') : placeholder}
                </span>
                {value && (
                    <button 
                        className={styles.clearBtn} 
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        type="button"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className={styles.calendarDropdown}>
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                    <div className={styles.footer}>
                        <button 
                            className={styles.todayBtn} 
                            onClick={() => handleDateClick(new Date())}
                            type="button"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
