import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './SelectDropdown.module.css';

interface Option {
    label: string;
    value: string;
}

interface SelectDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export default function SelectDropdown({
    value,
    onChange,
    options,
    placeholder = 'Select...',
    className = '',
    style,
    disabled = false
}: SelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div
            className={`${styles.container} ${disabled ? styles.disabled : ''} ${className}`}
            style={style}
            ref={dropdownRef}
        >
            <div
                className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={selectedOption ? styles.value : styles.placeholder}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={`${styles.icon} ${isOpen ? styles.rotated : ''}`} />
            </div>

            {isOpen && !disabled && (
                <div className={styles.menu}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`${styles.item} ${value === option.value ? styles.selected : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <span className={styles.itemLabel}>{option.label}</span>
                            {value === option.value && <Check size={16} className={styles.checkIcon} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
