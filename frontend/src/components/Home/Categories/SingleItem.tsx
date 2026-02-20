import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";

const SingleItem = ({ item }: { item: Category }) => {
  return (
    <a href="#" className="group flex flex-col items-center">
      {/* Container cố định kích thước */}

      <div className="w-[130px] h-[130px] bg-[#F2F3F8] rounded-full flex items-center justify-center mb-4 overflow-hidden">
        {item.imageUrl ? (
          <Image 
            src={item.imageUrl} 
            alt={item.title || ""} 
            width={82} 
            height={62} 
            className="object-contain max-w-[82px] max-h-[62px]"
          />
        ) : (
          <span className="text-4xl font-bold text-gray-400">
            {(item.title || "C").charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.title}
        </h3>
      </div>
    </a>
  );
};

export default SingleItem;
