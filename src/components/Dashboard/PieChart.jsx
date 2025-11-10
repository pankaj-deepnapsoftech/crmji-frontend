import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for navigation

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({
  totalLeads,
  canceledLeads,
  completedLeads,
  followupLeads,
}) => {
  const navigate = useNavigate();

  const data = {
    labels: ["Canceled Leads", "Completed Leads", "Follow-up Leads"],
    datasets: [
      {
        data: [canceledLeads, completedLeads, followupLeads], // Data values
        backgroundColor: ["#FF5722", "#2196F3", "#FFC107"], // Colors for each section
        hoverBackgroundColor: ["#D32F2F", "#1976D2", "#FFB300"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    onClick: (e, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        handleNavigation(index);
      }
    },
  };

  const handleNavigation = (index) => {
    switch (index) {
      case 0:
        navigate("leads", { state: { searchKey: "Cancelled" } });
        break;
      case 1:
        navigate("leads", { state: { searchKey: "Completed" } });
        break;
      case 2:
        navigate("leads", { state: { searchKey: "Follow Up" } });
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg flex items-center justify-center flex-col w-full">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-center mb-4 sm:mb-6">
        <Link to="leads" className="hover:text-green-600 transition-colors">
          Total Leads:{" "}
          <span className="text-green-700 font-bold">{totalLeads}</span>
        </Link>
      </h2>
      {data && data.datasets[0]?.data?.every((value) => value === 0) ? (
        <p className="text-center text-gray-600 text-sm sm:text-base">No graph to show!</p>
      ) : (
        <div className="w-full h-[300px] sm:h-[350px] lg:h-[440px] items-center justify-center flex">
          <Pie data={data} options={options} className="cursor-pointer" />
        </div>
      )}
    </div>
  );
};

export default PieChart;
