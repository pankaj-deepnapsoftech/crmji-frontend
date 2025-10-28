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
        demo: data.lead?.demo,
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
          <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
            {/* Type and Lead Category side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="font-bold text-lg text-gray-700">
                <p>Type</p>
                <p className="font-normal text-indigo-800">
                  {details?.type || "Not Available"}
                </p>
              </div>
              <div className="font-bold text-lg text-gray-700">
                <p>Lead Category</p>
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

            {/* Corporate Field */}
            {details.company && (
              <div className="font-bold text-lg text-gray-700">
                <p>Corporate</p>
                <p className="font-normal text-indigo-800">
                  {details?.company}
                </p>
              </div>
            )}

            {/* Individual Field */}
            {details.people && (
              <div className="font-bold text-lg text-gray-700">
                <p>Individual</p>
                <p className="font-normal text-indigo-800">{details?.people}</p>
              </div>
            )}

            {/* Status Field */}
            <div className="font-bold text-lg text-gray-700">
              <p>Status</p>
              <Badge colorScheme="orange">
                {details?.status || "Not Available"}
              </Badge>
            </div>

            {/* Source Field */}
            <div className="font-bold text-lg text-gray-700">
              <p>Source</p>
              <p className="font-normal text-indigo-800">
                {details?.source || "Not Available"}
              </p>
            </div>

            {/* Contact Fields */}
            <div className="font-bold text-lg text-gray-700">
              <p>Phone</p>
              <p className="font-normal text-indigo-800">
                {details?.phone || "Not Available"}
              </p>
            </div>
            <div className="font-bold text-lg text-gray-700">
              <p>Email</p>
              <p className="font-normal text-indigo-800">
                {details?.email || "Not Available"}
              </p>
            </div>

            {/* Products Table */}
            <div className="cursor-pointer">
              <p className="font-bold mb-1 text-gray-700">
                Products Interested In
              </p>
              <div>
                <table className="border w-full table-auto text-left shadow-md rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border px-3 py-2">Product</th>
                      <th className="border px-3 py-2">Category</th>
                      <th className="border px-3 py-2">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details?.products.map((p, ind) => (
                      <tr
                        className="border-b hover:bg-gray-100 transition-colors duration-200"
                        key={p._id}
                      >
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2">{p.category.categoryname}</td>
                        <td className="px-3 py-2">
                          <Avatar size="sm" src={p.imageUrl} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Follow-up Date & Reason */}
            {details?.followupDate && (
              <div className="font-bold text-lg text-gray-700">
                <p>Follow-up Date</p>
                <p className="font-normal text-indigo-800">
                  {moment(details.followupDate).format("DD-MM-YYYY")}
                </p>
              </div>
            )}
            {details?.followupReason && (
              <div className="font-bold text-lg text-gray-700">
                <p>Follow-up Reason</p>
                <p className="font-normal text-indigo-800">
                  {details?.followupReason}
                </p>
              </div>
            )}

            {/* Remarks */}
            <div className="font-bold text-lg text-gray-700">
              <p>Remarks</p>
              <p className="font-normal text-indigo-800">
                {details?.notes || "Not Available"}
              </p>
            </div>

            {/* Assigned To Fields */}
            {details?.assignedName !== "N/A" && (
              <>
                <div className="font-bold text-lg text-gray-700">
                  <p>Assigned To (Name)</p>
                  <p className="font-normal text-indigo-800">
                    {details?.assignedName}
                  </p>
                </div>
                <div className="font-bold text-lg text-gray-700">
                  <p>Assigned To (Phone)</p>
                  <p className="font-normal text-indigo-800">
                    {details?.assignedPhone}
                  </p>
                </div>
                <div className="font-bold text-lg text-gray-700">
                  <p>Assigned To (Email)</p>
                  <p className="font-normal text-indigo-800">
                    {details?.assignedEmail}
                  </p>
                </div>
              </>
            )}

            {/* PRC QT Field */}
            {details?.prcQt !== "N/A" && (
              <div className="font-bold text-lg text-gray-700">
                <p>PRC QT</p>
                <p className="font-normal text-indigo-800">{details?.prcQt}</p>
              </div>
            )}

            {/* Location Field */}
            {details?.location !== "N/A" && (
              <div className="font-bold text-lg text-gray-700">
                <p>Location</p>
                <p className="font-normal text-indigo-800">
                  {details?.location}
                </p>
              </div>
            )}

            {details?.demo && (
              <div className="border rounded-lg p-4 mt-6">
                <h3 className="font-bold text-lg mb-3">Demo Scheduled</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="font-bold text-gray-700">
                    <p>Demo Date & Time</p>
                    <p className="font-normal">
                      {details?.demo?.demoDateTime
                        ? moment(details.demo.demoDateTime).format(
                            "DD-MM-YYYY HH:mm"
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="font-bold text-gray-700">
                    <p>Demo Type</p>
                    <Badge
                      colorScheme={
                        details?.demo?.demoType === "Physical"
                          ? "blue"
                          : "purple"
                      }
                    >
                      {details?.demo?.demoType || "N/A"}
                    </Badge>
                  </div>
                </div>

                {details?.demo?.notes && (
                  <div className="font-bold text-gray-700 mt-3">
                    <p>Demo Notes</p>
                    <p className="font-normal text-green-700">
                      {details.demo.notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-700 mb-4">
                Comments & Remarks
              </h3>

              {/* Add Comment Form */}
              <Box
                mb={4}
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
              >
                <Textarea
                  placeholder="Add a comment or remark..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  mb={3}
                />
                <Button
                  colorScheme="blue"
                  onClick={addComment}
                  isLoading={isAddingComment}
                  loadingText="Adding..."
                  size="sm"
                >
                  Add Comment
                </Button>
              </Box>

              {/* Comments List */}
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
                        <Text fontSize="sm" fontWeight="bold" color="gray.600">
                          {comment.createdBy?.firstname}{" "}
                          {comment.createdBy?.lastname}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {moment(comment.timestamp).format(
                            "MMM DD, YYYY - h:mm A"
                          )}
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
