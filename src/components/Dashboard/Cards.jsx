import React from "react";


const Cards = ({ label, content, bg, Icon, iconColor }) => {
  return (
    <div className={`bg-gradient-to-r ${bg} p-4 sm:p-6 rounded-xl shadow-lg w-full hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
          <Icon className={`${iconColor} text-xl sm:text-2xl`}/> 
        </div>

        <h3 className="text-white text-sm sm:text-base lg:text-lg font-semibold text-center sm:text-right leading-tight">
          {label}
        </h3>
      </div>

      <div className="mt-4 text-white text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-end">
        {content}
      </div>
    </div>
  );

};

export default Cards;
