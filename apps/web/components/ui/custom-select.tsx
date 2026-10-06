"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps<T extends string | number = string | number> {
  value?: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
}

export function CustomSelect<T extends string | number = string | number>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  disabled = false,
  name,
  id,
  "aria-label": ariaLabel,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  // Manejo de click-outside con event listener de mousedown
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  // Sincronizar índice resaltado cuando se abre el menú
  useEffect(() => {
    if (isOpen) {
      const selectedIndex = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value, options]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (option: CustomSelectOption<T>) => {
    if (option.disabled || disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (!opt.disabled) {
            handleSelect(opt);
          }
        } else {
          setIsOpen((prev) => !prev);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next < options.length ? next : 0;
          });
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next >= 0 ? next : options.length - 1;
          });
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value !== undefined ? String(value) : ""} />}

      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left bg-white border border-slate-200 rounded-lg shadow-xs transition-all duration-150 select-none ${
          disabled
            ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
            : isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 outline-none"
              : "hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        }`}
      >
        <span
          className={`truncate flex-1 ${
            selectedOption ? "text-slate-900 font-medium" : "text-slate-400 font-normal"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && !disabled && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel || placeholder}
          className="absolute left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          {options.length === 0 ? (
            <li className="px-3.5 py-2 text-xs text-slate-400 italic">
              No hay opciones disponibles
            </li>
          ) : (
            options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = highlightedIndex === index;

              return (
                <li
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`relative flex items-center justify-between px-3 py-2 cursor-pointer select-none rounded-md mx-1 transition-colors ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed text-slate-400"
                      : isSelected
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : isHighlighted
                          ? "bg-slate-50 text-slate-900"
                          : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" aria-hidden="true" />
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default CustomSelect;
