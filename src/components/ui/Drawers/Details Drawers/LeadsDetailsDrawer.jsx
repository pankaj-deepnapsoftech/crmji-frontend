import { useState, useEffect } from "react";
import { BiX } from "react-icons/bi";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import { useCookies } from "react-cookie";
import {
  Avatar,
  Badge,
  Textarea,
  Button,
  Box,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";

const LeadsDetailsDrawer = ({ dataId: id, closeDrawerHandler }) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "lead/lead-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          leadId: id,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      setDetails({
        name: data.lead?.name,
        type: data.lead?.leadtype,
        company: data.lead?.company ? data.lead?.company?.companyname : "",
        people: data.lead?.people
          ? data.lead?.people?.firstname +
          " " +
          (data.lead?.people?.lastname || "")
          : "",
        status: data.lead?.status,
        source: data.lead?.source,
        phone: data.lead?.company
          ? data.lead?.company?.phone
          : data.lead?.people?.phone,
        email: data.lead?.company
          ? data.lead?.company?.email
          : data.lead?.people?.email,
        notes: data.lead?.notes ? data.lead?.notes : "",
        products: data.lead?.products,
        assignedName: data.lead?.assigned?.name || "N/A",
        assignedPhone: data.lead?.assigned?.phone || "N/A",
        assignedEmail: data.lead?.assigned?.email || "N/A",
        followupDate: data.lead?.followup_date,
        followupReason: data.lead?.followup_reason,
        prcQt: data.lead?.prc_qt || "N/A",
        location: data.lead?.location || "N/A",
        leadCategory: data.lead?.leadCategory,
        meeting: data.lead?.meeting,
        comments: data.lead?.comments || [],
      });

      setIsLoading(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsAddingComment(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "lead/add-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          leadId: id,
          comment: newComment,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setNewComment("");
      fetchLeadDetails(id); // Refresh to get updated comments
      toast.success("Comment added successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAddingComment(false);
    }
  };

  const fetchComments = async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + `lead/comments/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchLeadDetails(id);
    fetchComments();
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
        Lead
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-3xl font-bold py-5 text-center mb-8 border-y border-gray-200 bg-blue-200 rounded-md shadow-md">
          Lead Details
        </h2>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="bg-gray-50 shadow-inner rounded-lg p-6 space-y-6 border border-gray-200">
            {/* Type and Category */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                Lead Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-gray-700">Type</p>
                  <p className="text-indigo-800">{details?.type || "Not Available"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Lead Category</p>
                  <Badge
                    colorScheme={
                      details?.leadCategory === "Hot"
                        ? "red"
                        : details?.leadCategory === "Cold"
                          ? "blue"
                          : "orange"
                    }
                  >
                    {details?.leadCategory || "Not Available"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                Contact Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="font-bold text-gray-700">Phone</p>
                  <p className="text-indigo-800">{details?.phone || "Not Available"}</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Email</p>
                  <p className="text-indigo-800">{details?.email || "Not Available"}</p>
                </div>
                {details?.location && (
                  <div>
                    <p className="font-bold text-gray-700">Location</p>
                    <p className="text-indigo-800">{details.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                Products Interested In
              </h3>
              <table className="border w-full table-auto text-left rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border px-3 py-2">Product</th>
                    <th className="border px-3 py-2">Category</th>
                    <th className="border px-3 py-2">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {details?.products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="border px-3 py-2">{p.name}</td>
                      <td className="border px-3 py-2">{p.category.categoryname}</td>
                      <td className="border px-3 py-2">
                        <Avatar size="sm" src={p.imageUrl} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Meeting */}
            {details?.meeting && (
              <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                  Meeting Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-gray-700">Meeting Date & Time</p>
                    <p>
                      {details.meeting.meetingDateTime
                        ? moment(details.meeting.meetingDateTime).format("DD-MM-YYYY HH:mm")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">Meeting Type</p>
                    <Badge
                      colorScheme={
                        details.meeting.meetingType === "Physical" ? "blue" : "purple"
                      }
                    >
                      {details.meeting.meetingType || "N/A"}
                    </Badge>
                  </div>
                </div>
                {details.meeting.notes && (
                  <div className="mt-3">
                    <p className="font-bold text-gray-700">Meeting Notes</p>
                    <p className="text-green-700">{details.meeting.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">
                Comments & Remarks
              </h3>
              <Box mb={4}>
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  mb={3}
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  onClick={addComment}
                  isLoading={isAddingComment}
                >
                  Add Comment
                </Button>
              </Box>

              <VStack spacing={3} align="stretch">
                {details.comments && details.comments.length > 0 ? (
                  details.comments.map((comment, index) => (
                    <Box
                      key={index}
                      p={3}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="gray.50"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="bold" fontSize="sm" color="gray.600">
                          {comment.createdBy?.firstname} {comment.createdBy?.lastname}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {moment(comment.timestamp).format("MMM DD, YYYY - h:mm A")}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.700">
                        {comment.comment}
                      </Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>
                    No comments yet
                  </Text>
                )}
              </VStack>
            </div>
          </div>

        )}
      </div>
    </div>
  );
};

export default LeadsDetailsDrawer;
