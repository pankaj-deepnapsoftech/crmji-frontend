import { useState, useEffect } from "react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import { useCookies } from "react-cookie";

const CompaniesDetailsDrawer = ({ dataId: id, closeDrawerHandler }) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({});

  const fetchCompanyDetails = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "company/company-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyId: id,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setDetails({
        name: data.company?.companyname,
        email: data.company?.email,
        phone: data.company?.phone,
        contactPersonName: data.company?.contactPersonName,
        designation: data.company?.designation,
        address: data.company?.address,
        website: data.company?.website,
        gst_no: data.company?.gst_no,
        status: data.company?.status,
        additionalContacts: data.company?.additionalContacts || [],
        comments: data.company?.comments || [],
      });

      setIsLoading(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchCompanyDetails(id);
  }, []);

  return (
    <div
      className="absolute overflow-auto h-[100vh] w-[90vw] md:w-[450px] bg-white right-0 top-0 z-10 py-3"
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px",
      }}
    >
      <h1 className="px-4 flex gap-x-2 items-center text-xl py-3 border-b">
        <BiX onClick={closeDrawerHandler} size="26px" />
        Corporate
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-3xl font-bold py-5 text-center mb-8 border-y border-gray-200 bg-blue-200 rounded-md shadow-md">
          Corporate Details
        </h2>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 space-y-6">
            <div className="font-bold text-lg text-gray-700">
              <p>Name</p>
              <p className="font-normal text-indigo-800">
                {details?.name ? details.name : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Email</p>
              <p className="font-normal text-indigo-800">
                {details?.email ? details.email : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Contact Person Name</p>
              <p className="font-normal text-indigo-800">
                {details?.contactPersonName ? details.contactPersonName : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Designation</p>
              <p className="font-normal text-indigo-800">
                {details?.designation ? details.designation : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Address</p>
              <p className="font-normal text-indigo-800">
                {details?.address ? details.address : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Phone</p>
              <p className="font-normal text-indigo-800">
                {details?.phone ? details.phone : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Website</p>
              <p className="font-normal text-indigo-800">
                {details?.website ? details.website : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>GST No.</p>
              <p className="font-normal text-indigo-800">
                {details?.gst_no ? details.gst_no : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Status</p>
              <p className="font-normal text-indigo-800">
                {details?.status ? details.status : "Not Available"}
              </p>
            </div>
            
            {/* Additional Contacts */}
            {details?.additionalContacts && details.additionalContacts.length > 0 && (
              <div className="font-bold text-lg text-gray-700">
                <p>Additional Contacts</p>
                <div className="space-y-2">
                  {details.additionalContacts.map((contact, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.designation}</p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                      <p className="text-sm text-gray-600">{contact.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Comments */}
            {details?.comments && details.comments.length > 0 && (
              <div className="font-bold text-lg text-gray-700">
                <p>Comments</p>
                <div className="space-y-2">
                  {details.comments.map((comment, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-600">{comment.comment}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesDetailsDrawer;
