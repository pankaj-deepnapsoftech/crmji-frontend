import React from "react";
import { Link } from "react-router-dom";

const ListCard = ({
  totalOffers,
  OfferAmount,
  totalInvoices,
  totalProformaInvoices,
  ProformaInvoiceAmount,
  InvoiceAmount,
  totalUnpaidInvoices,
  UnpaidInvoiceAmount,
  products,
}) => {
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-lg w-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Financial Summary</h2>
      <ul className="space-y-2">
        <Link to="offers" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
          <li className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-sm sm:text-base">Total Offers:</span>
            <span className="text-green-600 font-semibold text-sm sm:text-base">{totalOffers}</span>
          </li>
          <li className="flex justify-between items-center py-2">
            <span className="font-bold text-sm sm:text-base">Offers Amount:</span>
            <span className="text-green-600 font-semibold text-sm sm:text-base">
              Rs. {OfferAmount}
            </span>
          </li>
        </Link>

        <Link to="proforma-invoices" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
          <li className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-sm sm:text-base">Total Proforma Invoices:</span>
            <span className="text-red-600 font-semibold text-sm sm:text-base">
              {totalProformaInvoices}
            </span>
          </li>
          <li className="flex justify-between items-center py-2">
            <span className="font-bold text-sm sm:text-base">Proforma Amount:</span>
            <span className="text-red-600 font-semibold text-sm sm:text-base">
              Rs. {ProformaInvoiceAmount}
            </span>
          </li>
        </Link>

        <Link to="invoices" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
          <li className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-sm sm:text-base">Total Invoices:</span>
            <span className="text-blue-600 font-semibold text-sm sm:text-base">{totalInvoices}</span>
          </li>
          <li className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-sm sm:text-base">Invoices Amount:</span>
            <span className="text-blue-600 font-semibold text-sm sm:text-base">
              Rs. {InvoiceAmount}
            </span>
          </li>
          <li className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-sm sm:text-base">Total Unpaid Invoices:</span>
            <span className="text-purple-600 font-semibold text-sm sm:text-base">
              {totalUnpaidInvoices}
            </span>
          </li>
          <li className="flex justify-between items-center py-2">
            <span className="font-bold text-sm sm:text-base">Unpaid Amount:</span>
            <span className="text-purple-600 font-semibold text-sm sm:text-base">
              Rs. {UnpaidInvoiceAmount}
            </span>
          </li>
        </Link>

        <Link to="products" className="block hover:bg-gray-50 rounded-lg p-2 transition-colors">
          <li className="flex justify-between items-center py-2">
            <span className="font-bold text-sm sm:text-base">Total Products:</span>
            <span className="text-blue-600 font-semibold text-sm sm:text-base">{products}</span>
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default ListCard;
