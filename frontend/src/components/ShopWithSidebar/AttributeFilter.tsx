import React, { useState } from "react";
import { Attribute, AttributeValue } from "@/services/attribute.service";

interface AttributeFilterProps {
  attributes: Attribute[];
  selectedAttributes: string[];
  onAttributeSelect: (value: string) => void;
}

const AttributeFilter: React.FC<AttributeFilterProps> = ({
  attributes,
  selectedAttributes,
  onAttributeSelect,
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>(
    attributes.reduce((acc, attr) => ({ ...acc, [attr.id]: true }), {})
  );

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col gap-6">
      {attributes.map((attr) => (
        <div key={attr.id} className="bg-white shadow-1 rounded-lg py-4 px-5">
          <div
            className="flex items-center justify-between cursor-pointer mb-3"
            onClick={() => toggleExpand(attr.id)}
          >
            <h3 className="font-medium text-dark">{attr.name}</h3>
            <svg
              className={`fill-current ease-out duration-200 ${
                expanded[attr.id] ? "rotate-180" : ""
              }`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                fill=""
              />
            </svg>
          </div>

          <div
            className={`flex flex-col gap-2 ${
              expanded[attr.id] ? "block" : "hidden"
            }`}
          >
            {attr.values.map((val) => (
              <label
                key={val.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedAttributes.includes(val.value)}
                    onChange={() => onAttributeSelect(val.value)}
                  />
                  <div
                    className={`w-5 h-5 border rounded sm:w-4 sm:h-4 flex items-center justify-center ${
                      selectedAttributes.includes(val.value)
                        ? "bg-blue border-blue"
                        : "border-gray-3 bg-white group-hover:border-blue"
                    }`}
                  >
                    {selectedAttributes.includes(val.value) && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.70704 0.792787C9.89451 0.980314 9.99983 1.23462 9.99983 1.49979C9.99983 1.76495 9.89451 2.01926 9.70704 2.20679L4.70704 7.20679C4.51951 7.39426 4.26521 7.49957 4.00004 7.49957C3.73488 7.49957 3.48057 7.39426 3.29304 7.20679L0.293041 4.20679C0.110883 4.01818 0.0100885 3.76558 0.0123669 3.50339C0.0146453 3.24119 0.119814 2.99038 0.305222 2.80497C0.490631 2.61956 0.741443 2.51439 1.00364 2.51211C1.26584 2.50983 1.51844 2.61063 1.70704 2.79279L4.00004 5.08579L8.29304 0.792787C8.48057 0.605316 8.73488 0.5 9.00004 0.5C9.26521 0.5 9.51951 0.605316 9.70704 0.792787Z"
                          fill="white"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-dark-4 group-hover:text-blue">
                  {val.value}
                </span>
                {val.colorCode && (
                   <span className="w-4 h-4 rounded-full border border-gray-200 ml-auto" style={{ backgroundColor: val.colorCode }}></span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttributeFilter;
