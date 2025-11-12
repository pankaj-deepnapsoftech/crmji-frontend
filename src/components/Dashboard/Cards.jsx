import React from "react";

const Cards = ({ label, content, bg, Icon, iconColor }) => {
  return (
    <div
      className={`bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03] flex justify-between items-center h-[100px] sm:h-[120px]`}
    >
      {/* Left Text Section */}
      <div className="flex flex-col justify-center">
        <p className="text-xs sm:text-sm text-gray-600 font-medium">{label}</p>
        <p className="font-bold text-lg sm:text-xl md:text-2xl mt-1 text-gray-800">
          {content}
        </p>
      </div>

      {/* Right Icon Section */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 ${bg} rounded-full flex items-center justify-center shadow-sm`}
      >
        <Icon className={`${iconColor} text-lg sm:text-xl md:text-2xl`} />
      </div>
    </div>
  );
};

export default Cards;
