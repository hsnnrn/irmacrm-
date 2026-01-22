"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface City {
  id: number;
  name: string;
  displayName: string;
  lat: string;
  lon: string;
}

interface CityAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

export function CityAutocomplete({
  label,
  value,
  onChange,
  placeholder = "Şehir ara...",
  required = false,
  id,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCities = async (query: string) => {
    if (query.length < 2) {
      setCities([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setCities(data.cities || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce the API call
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      fetchCities(newValue);
    }, 300);
  };

  const handleCitySelect = (city: City) => {
    setInputValue(city.name);
    onChange(city.name);
    setIsOpen(false);
    setCities([]);
  };

  const clearInput = () => {
    setInputValue("");
    onChange("");
    setCities([]);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-2" ref={wrapperRef}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
        <Input
          id={id}
          type="text"
          value={inputValue || ""}
          onChange={handleInputChange}
          onFocus={() => {
            if (cities.length > 0) setIsOpen(true);
            if (inputValue.length >= 2 && cities.length === 0) fetchCities(inputValue);
          }}
          placeholder={placeholder}
          required={required}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && cities.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-xl ring-1 ring-black ring-opacity-5">
          <ul className="py-1">
            {cities.map((city) => (
              <li
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  "hover:bg-red-50 active:bg-red-100",
                  "border-b border-gray-50 last:border-0"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{city.name.split(',')[0]}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{city.name}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && !isLoading && inputValue.length >= 2 && cities.length === 0 && (
         <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-xl">
           Sonuç bulunamadı.
         </div>
      )}
    </div>
  );
}
