import { useState, useEffect } from "react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import { useCookies } from "react-cookie";
import moment from "moment";

const PeoplesDetailsDrawer = ({ dataId: id, closeDrawerHandler }) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState("");
  const [isAddingRemark, setIsAddingRemark] = useState(false);

  const fetchPeopleDetails = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "people/person-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          peopleId: id,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setDetails({
        firstname: data.person?.firstname,
        lastname: data.person?.lastname,
        company: data.person?.company,
        phone: data.person?.phone,
        email: data.person?.email,
        comment: data.person?.comment,
        status: data.person?.status,
        verify: data.person?.verify,
        uniqueId: data.person?.uniqueId,
        createdAt: data.person?.createdAt,
        creator: data.person?.creator?.name || data.person?.creator || "",
      });

      setIsLoading(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchRemarks = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + `people/remarks/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });
      const data = await response.json();
      if (data.success) setRemarks(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addRemark = async () => {
    if (!newRemark.trim()) {
      toast.error("Please enter a remark");
      return;
    }
    setIsAddingRemark(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "people/add-remark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({ peopleId: id, remark: newRemark }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setNewRemark("");
      fetchRemarks();
      toast.success("Remark added");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAddingRemark(false);
    }
  };

  useEffect(() => {
    fetchPeopleDetails(id);
    fetchRemarks();
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
        Individual
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-3xl font-bold  py-5 text-center mb-8 border-y border-gray-200 bg-blue-200 rounded-md shadow-md">
          Individual Details--
        </h2>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-gray-50 shadow-lg rounded-lg p-6 space-y-6">
            {details?.uniqueId && (
              <div className="font-bold text-lg text-gray-700">
                <p>ID</p>
                <p className="font-normal text-indigo-800">
                  {details.uniqueId}
                </p>
              </div>
            )}
            <div className="font-bold text-lg text-gray-700">
              <p>First Name</p>
              <p className="font-normal text-indigo-800">
                {details?.firstname ? details.firstname : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Last Name</p>
              <p className="font-normal text-indigo-800">
                {details?.lastname ? details.lastname : "Not Available"}
              </p>
            </div>
            {/* Uncomment this block if you want to add the 'Corporate' field back */}
            {/* <div className="font-bold text-lg text-gray-700">
        <p>Corporate</p>
        <p className="font-normal text-gray-600">{details?.company ? details.company : 'Not Available'}</p>
      </div> */}
            <div className="font-bold text-lg text-gray-700">
              <p>Phone</p>
              <p className="font-normal text-indigo-800">
                {details?.phone ? details.phone : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Email</p>
              <p className="font-normal text-indigo-800">
                {details?.email ? details.email : "Not Available"}
              </p>
            </div>
            {details?.creator && (
              <div className="font-bold text-lg text-gray-700">
                <p>Created By</p>
                <p className="font-normal text-indigo-800">{details.creator}</p>
              </div>
            )}
            <div className="font-bold text-lg text-gray-700">
              <p>Status</p>
              <p className="font-normal text-indigo-800">
                {details?.status ? details.status : "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Verification</p>
              <p className="font-normal">
                {details?.verify ? (
                  <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                    Not Verified
                  </span>
                )}
              </p>
            </div>
            {details?.createdAt && (
              <div className="font-bold text-lg text-gray-700">
                <p>Created On</p>
                <p className="font-normal text-indigo-800">
                  {new Date(details.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {details?.comment && (
              <div className="font-bold text-lg text-gray-700">
                <p>Comment</p>
                <p className="font-normal text-indigo-800">{details.comment}</p>
              </div>
            )}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-700 mb-3">Remarks</h3>
              <div className="mb-3">
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  placeholder="Add a remark..."
                  value={newRemark}
                  onChange={(e) => setNewRemark(e.target.value)}
                />
                <button
                  className="mt-2 px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                  onClick={addRemark}
                  disabled={isAddingRemark}
                >
                  {isAddingRemark ? "Adding..." : "Add Remark"}
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-auto pr-1">
                {remarks && remarks.length > 0 ? (
                  remarks
                    .slice()
                    .sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                    )
                    .map((r, idx) => (
                      <div key={idx} className="border rounded p-3 bg-white">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>
                            {r?.createdBy?.firstname ||
                              r?.createdBy?.name ||
                              "User"}
                            {r?.createdBy?.lastname
                              ? ` ${r.createdBy.lastname}`
                              : ""}
                          </span>
                          <span className="text-gray-500">
                            {moment(r.timestamp).format(
                              "ddd, DD MMM YYYY, h:mm A"
                            )}
                          </span>
                        </div>
                        <div className="text-gray-800 text-sm whitespace-pre-wrap">
                          {r.remark}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-sm">No remarks yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PeoplesDetailsDrawer;
