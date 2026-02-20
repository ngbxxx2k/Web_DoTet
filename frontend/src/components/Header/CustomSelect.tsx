"use client";
import React, { useState, useEffect } from "react";
import { CategoryService } from "@/services/category.service";
import { Category } from "@/types/category";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options?: Option[];
  onSelect?: (option: Option) => void;
}

const CustomSelect = ({ options: propOptions, onSelect }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>(propOptions || [{ label: "All Categories", value: "0" }]);
  const [selectedOption, setSelectedOption] = useState<Option>(options[0]);
  const [loading, setLoading] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      if (propOptions) return; // Skip if options are provided externally
      
      setLoading(true);
      try {
        const categories = await CategoryService.getAll();
        const categoryOptions: Option[] = [
          { label: "All Categories", value: "0" },
          ...categories.filter(c => c.isActive).map((cat: Category) => ({
            label: cat.title,
            value: cat.id.toString(),
          })),
        ];
        setOptions(categoryOptions);
        setSelectedOption(categoryOptions[0]);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [propOptions]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: Option) => {
    setSelectedOption(option);
    onSelect?.(option);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {loading ? "Loading..." : selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption.value === option.value ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
