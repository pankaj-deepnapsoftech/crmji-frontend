import { Button, Link, Select, useDisclosure } from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
  MdMoreVert,
} from "react-icons/md";
import { BiTable, BiCard } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddPeoplesDrawer,
  closeEditPeoplesDrawer,
  closeShowDetailsPeoplesDrawer,
  openAddPeoplesDrawer,
  openEditPeoplesDrawer,
  openShowDetailsPeoplesDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import moment from "moment";
import * as XLSX from "xlsx";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { usePagination, useSortBy, useTable } from "react-table";
import ClickMenu from "../ui/ClickMenu";
import PeoplesEditDrawer from "../ui/Drawers/Edit Drawers/PeoplesEditDrawer";
import PeoplesDetailsDrawer from "../ui/Drawers/Details Drawers/PeoplesDetailsDrawer";
import PeoplesDrawer from "../ui/Drawers/Add Drawers/PeoplesDrawer";
import { FcDatabase } from "react-icons/fc";
import { Input } from "@chakra-ui/react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import { checkAccess } from "../../utils/checkAccess";
import { FaFileCsv } from "react-icons/fa6";

const columns = [
  {
    Header: "ID",
    accessor: "uniqueId",
  },
  {
    Header: "First Name",
    accessor: "firstname",
  },
  {
    Header: "Last Name",
    accessor: "lastname",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Phone",
    accessor: "phone",
  },
  // {
  //   Header: "Verification",
  //   accessor: "verified",
  //   Cell: ({ row }) => {
  //     const { isOpen, onOpen, onClose } = useDisclosure();
  //     const cancelRef = useRef();
  //     const [cookies] = useCookies();
  //     const baseURL = process.env.REACT_APP_BACKEND_URL;

  //     const personId = row.original._id;
  //     const [otp, setOtp] = useState("");
  //     const [isVerified, setIsVerified] = useState(row.original.verify);

  //     const reSendVerificationOtp = async () => {
  //       try {
  //         const response = await fetch(
  //           `${baseURL}people/resend-otp/${personId}`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //               authorization: `Bearer ${cookies?.access_token}`,
  //             },
  //           }
  //         );
  //         const otpResponse = await response.json();
  //         toast.success("OTP has been resent successfully!");
  //       } catch (error) {
  //         toast.error("Failed to resend OTP. Please try again.");
  //       }
  //     };

  //     const verifyOtp = async () => {
  //       try {
  //         if (!personId || !otp) {
  //           toast.warning("Please enter OTP before verifying.");
  //           return;
  //         }
  //         const numericOtp = Number(otp);
  //         if (isNaN(numericOtp)) {
  //           toast.warning("Invalid OTP format. Please enter a valid number.");
  //           return;
  //         }
  //         const response = await fetch(
  //           `${baseURL}people/verify-people/${personId}`,
  //           {
  //             method: "PATCH",
  //             headers: {
  //               "Content-Type": "application/json",
  //               authorization: `Bearer ${cookies?.access_token}`,
  //             },
  //             body: JSON.stringify({ otp: numericOtp }),
  //           }
  //         );
  //         const verifyResponse = await response.json();
  //         if (verifyResponse.success) {
  //           toast.success("OTP verified successfully!");
  //           setIsVerified(true);
  //           onClose();
  //         } else {
  //           toast.error(
  //             verifyResponse.message || "Invalid OTP. Please try again."
  //           );
  //         }
  //       } catch (error) {
  //         toast.error("Something went wrong. Please try again.");
  //       }
  //     };

  //     return (
  //       <>
  //         {isVerified ? (
  //           <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
  //             Verified
  //           </span>
  //         ) : (
  //           <>
  //             <Button size="sm" colorScheme="blue" onClick={onOpen}>
  //               Verify
  //             </Button>
  //             <AlertDialog
  //               isOpen={isOpen}
  //               leastDestructiveRef={cancelRef}
  //               onClose={onClose}
  //             >
  //               <AlertDialogOverlay>
  //                 <AlertDialogContent className="p-6 rounded-lg shadow-lg">
  //                   <AlertDialogHeader className="text-xl font-semibold text-center">
  //                     Confirm Verification
  //                   </AlertDialogHeader>
  //                   <AlertDialogBody className="text-center space-y-4">
  //                     <p className="text-gray-600">
  //                       A one-time password has been sent to your email
  //                     </p>
  //                     <Input
  //                       className="text-center border border-gray-300 rounded-md py-2 px-4 w-3/4 mx-auto"
  //                       placeholder="Enter OTP"
  //                       value={otp}
  //                       onChange={(e) => setOtp(e.target.value)}
  //                     />
  //                     <div className="flex justify-center gap-4">
  //                       <Button onClick={verifyOtp} colorScheme="blue">
  //                         Verify OTP
  //                       </Button>
  //                       <Button
  //                         onClick={reSendVerificationOtp}
  //                         variant="outline"
  //                         colorScheme="gray"
  //                       >
  //                         Resend OTP
  //                       </Button>
  //                     </div>
  //                   </AlertDialogBody>
  //                   <AlertDialogFooter className="flex justify-end gap-3">
  //                     <Button
  //                       ref={cancelRef}
  //                       onClick={onClose}
  //                       variant="outline"
  //                     >
  //                       Cancel
  //                     </Button>
  //                   </AlertDialogFooter>
  //                 </AlertDialogContent>
  //               </AlertDialogOverlay>
  //             </AlertDialog>
  //           </>
  //         )}
  //       </>
  //     );
  //   },
  // },

  // {
  //   Header: "Verification",
  //   accessor: "verified",
  //   Cell: ({ row }) => {
  //     const { isOpen, onOpen, onClose } = useDisclosure();
  //     const cancelRef = useRef();
  //     const [cookies] = useCookies();
  //     const baseURL = process.env.REACT_APP_BACKEND_URL;

  //     const personId = row.original._id; // Get the person's ID
  //     const [otp, setOtp] = useState(""); // Store OTP input
  //     const [isVerified, setIsVerified] = useState(row.original.verify); // Track verification status

  //     // Resend OTP
  //     const reSendVerificationOtp = async () => {
  //       try {

  //         const response = await fetch(
  //           `${baseURL}people/resend-otp/${personId}`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //               authorization: `Bearer ${cookies?.access_token}`,
  //             },
  //           }
  //         );

  //         const otpResponse = await response.json();

  //         // Show toast for resend OTP
  //         toast.success("OTP has been resent successfully!");
  //       } catch (error) {

  //         toast.error("Failed to resend OTP. Please try again.");
  //       }
  //     };

  //     // Verify OTP
  //     const verifyOtp = async () => {
  //       try {
  //         if (!personId || !otp) {
  //           toast.warning("Please enter OTP before verifying.");
  //           return;
  //         }

  //         const numericOtp = Number(otp); // Convert OTP to a number

  //         if (isNaN(numericOtp)) {
  //           toast.warning("Invalid OTP format. Please enter a valid number.");
  //           return;
  //         }

  //         const response = await fetch(
  //           `${baseURL}people/verify-people/${personId}`,
  //           {
  //             method: "PATCH",
  //             headers: {
  //               "Content-Type": "application/json",
  //               authorization: `Bearer ${cookies?.access_token}`,
  //             },
  //             body: JSON.stringify({ otp: numericOtp }), // Send OTP as number
  //           }
  //         );

  //         const verifyResponse = await response.json();

  //         if (verifyResponse.success) {
  //           toast.success("OTP verified successfully!"); // Show success toast
  //           setIsVerified(true); // Update UI state
  //           onClose(); // Close modal
  //         } else {
  //           toast.error(
  //             verifyResponse.message || "Invalid OTP. Please try again."
  //           ); // Show error toast
  //         }
  //       } catch (error) {
  //         toast.error("Something went wrong. Please try again."); // Show error toast
  //       }
  //     };

  //     return (
  //       <>
  //         {isVerified ? (
  //           <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
  //             Verified
  //           </span>
  //         ) : (
  //           <>
  //             <Button size="sm" colorScheme="blue" onClick={onOpen}>
  //               Verify
  //             </Button>

  //             {/* Verification Popup */}
  //             <AlertDialog
  //               isOpen={isOpen}
  //               leastDestructiveRef={cancelRef}
  //               onClose={onClose}
  //             >
  //               <AlertDialogOverlay>
  //                 <AlertDialogContent className="p-6 rounded-lg shadow-lg">
  //                   <AlertDialogHeader className="text-xl font-semibold text-center">
  //                     Confirm Verification
  //                   </AlertDialogHeader>

  //                   <AlertDialogBody className="text-center space-y-4">
  //                     <p className="text-gray-600">
  //                       A one-time password has been sent to your email
  //                     </p>
  //                     <Input
  //                       className="text-center border border-gray-300 rounded-md py-2 px-4 w-3/4 mx-auto"
  //                       placeholder="Enter OTP"
  //                       value={otp}
  //                       onChange={(e) => setOtp(e.target.value)}
  //                     />
  //                     <div className="flex justify-center gap-4">
  //                       <Button onClick={verifyOtp} colorScheme="blue">
  //                         Verify OTP
  //                       </Button>
  //                       <Button
  //                         onClick={reSendVerificationOtp}
  //                         variant="outline"
  //                         colorScheme="gray"
  //                       >
  //                         Resend OTP
  //                       </Button>
  //                     </div>
  //                   </AlertDialogBody>

  //                   <AlertDialogFooter className="flex justify-end gap-3">
  //                     <Button
  //                       ref={cancelRef}
  //                       onClick={onClose}
  //                       variant="outline"
  //                     >
  //                       Cancel
  //                     </Button>
  //                   </AlertDialogFooter>
  //                 </AlertDialogContent>
  //               </AlertDialogOverlay>
  //             </AlertDialog>
  //           </>
  //         )}
  //       </>
  //     );
  //   },
  // },
];

const Peoples = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  const [peopleDeleteId, setPeopleDeleteId] = useState();

  const dispatch = useDispatch();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    state: { pageIndex, pageSize },
    pageCount,
    setPageSize,
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    usePagination
  );

  const {
    addPeoplesDrawerIsOpened,
    editPeoplesDrawerIsOpened,
    showDetailsPeoplesDrawerIsOpened,
  } = useSelector((state) => state.misc);
  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "people");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const [peopleIds, setPeopleIds] = useState([]); // State to store all people IDs
  const [bulkPreviewRows, setBulkPreviewRows] = useState([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const peopleBulkInputRef = useRef(null);

  const downloadPeopleSampleCSV = () => {
    const headers = ["firstname", "lastname", "phone", "email"];
    const sample = [
      {
        firstname: "Rahul",
        lastname: "Sharma",
        phone: "9876543210",
        email: "rahul@example.com",
      },
      {
        firstname: "Anita",
        lastname: "Verma",
        phone: "9876501234",
        email: "anita@example.com",
      },
    ];
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of sample) {
      csvRows.push(
        headers
          .map((h) =>
            row[h] !== undefined ? String(row[h]).replaceAll(",", " ") : ""
          )
          .join(",")
      );
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "individuals_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePeopleBulkFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
      setBulkPreviewRows(Array.isArray(json) ? json.slice(0, 2000) : []);
      setShowBulkPreview(true);
    };
    reader.readAsArrayBuffer(file);
  };

  // Fetch all people and store their IDs
  const fetchAllPeople = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);

    try {
      const response = await fetch(baseURL + "people/all-persons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const active = data.people.filter((person) => person.status !== "Interested");
      setData(active);
      setFilteredData(active);

      // Extract IDs and store them in state
      const ids = data.people.map((person) => person._id);
      setPeopleIds(ids);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  // Send OTP to all people
  const sendVerificationOtp = async () => {
    try {
      if (peopleIds.length === 0) {
        return;
      }

      // Send OTP request for each person
      for (const id of peopleIds) {
        const response = await fetch(`${baseURL}people/verify-people/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${cookies?.access_token}`,
          },
        });

        const otpResponse = await response.json();
      }
    } catch (error) {
      toast.error(`Error while sending OTPs: ${error} `);
    }
  };

  const addPeoplesHandler = () => {
    dispatch(openAddPeoplesDrawer());
  };

  const editHandler = (id) => {
    setDataId(id);
    dispatch(openEditPeoplesDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsPeoplesDrawer());
  };

  const deleteHandler = async () => {
    if (!peopleDeleteId) {
      return;
    }

    try {
      const response = await fetch(baseURL + "people/delete-people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          peopleId: peopleDeleteId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      onClose();
      fetchAllPeople();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllPeople();
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.creator?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          d?.firstname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.lastname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.uniqueId?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);

  return (
    <>
      {!isAllowed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[#ff6f6f] flex gap-x-2">
          {msg}
        </div>
      )}

      {isAllowed && (
        <div
          className="border-[1px] px-2 py-8 md:px-9 rounded"
          style={{ boxShadow: "0 0 20px 3px #96beee26" }}
        >
          <>
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Individual
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure, deleting a Individual will also delete it from
                    Customer section, its Leads, Offers, Proforma Invoices,
                    Invoices and Payments?
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={deleteHandler} ml={3}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </>

          <div>
            <div className="flex flex-col items-start justify-start md:flex-row gap-y-1 md:justify-between md:items-center mb-8">
              <div className="flex text-lg md:text-xl font-semibold items-center gap-y-1">
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                Individual List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full md:w-fit">
                <input
                  ref={peopleBulkInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handlePeopleBulkFile}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={() =>
                    peopleBulkInputRef.current &&
                    peopleBulkInputRef.current.click()
                  }
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 160 }}
                  rightIcon={<FaFileCsv size={18} />}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Bulk Upload
                </Button>
                <Button
                  onClick={downloadPeopleSampleCSV}
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 200 }}
                  rightIcon={<FaFileCsv size={18} />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Download Sample CSV
                </Button>
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 100 }}
                  onClick={fetchAllPeople}
                  leftIcon={<MdOutlineRefresh />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Refresh
                </Button>
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 200 }}
                  onClick={addPeoplesHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Individual
                </Button>
                <Select
                  onChange={(e) => setPageSize(e.target.value)}
                  width="80px"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={100000}>All</option>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-x-2 mb-4">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title="Table View"
              >
                <BiTable size={20} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === "card"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title="Card View"
              >
                <BiCard size={20} />
              </button>
            </div>

            <div>
              {showBulkPreview && bulkPreviewRows.length > 0 && (
                <div className="mb-4 border rounded p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">
                      Bulk Preview ({bulkPreviewRows.length} rows)
                    </div>
                    <button
                      className="text-red-600 text-sm"
                      onClick={() => setShowBulkPreview(false)}
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: 300 }}>
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          {Object.keys(bulkPreviewRows[0] || {}).map((key) => (
                            <th
                              key={key}
                              className="border px-2 py-1 text-left bg-gray-50"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreviewRows.slice(0, 50).map((row, idx) => (
                          <tr key={idx}>
                            {Object.keys(bulkPreviewRows[0] || {}).map(
                              (key) => (
                                <td key={key} className="border px-2 py-1">
                                  {String(row[key])}
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {addPeoplesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeAddPeoplesDrawer())
                  }
                >
                  <PeoplesDrawer
                    closeDrawerHandler={() => dispatch(closeAddPeoplesDrawer())}
                    fetchAllPeople={fetchAllPeople}
                  />
                </ClickMenu>
              )}

              {editPeoplesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeEditPeoplesDrawer())
                  }
                >
                  <PeoplesEditDrawer
                    dataId={dataId}
                    closeDrawerHandler={() => {
                      dispatch(closeEditPeoplesDrawer());
                      fetchAllPeople();
                    }}
                  />
                </ClickMenu>
              )}

              {showDetailsPeoplesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowDetailsPeoplesDrawer())
                  }
                >
                  <PeoplesDetailsDrawer
                    dataId={dataId}
                    closeDrawerHandler={() =>
                      dispatch(closeShowDetailsPeoplesDrawer())
                    }
                  />
                </ClickMenu>
              )}
              {loading && (
                <div>
                  <Loading />
                </div>
              )}
              {!loading && filteredData.length === 0 && (
                <div className="flex items-center justify-center flex-col">
                  <FcDatabase color="red" size={80} />
                  <span className="mt-1 font-semibold text-2xl">
                    No data found.
                  </span>
                </div>
              )}
              {!loading && filteredData.length > 0 && (
                <div>
                  {viewMode === "table" ? (
                    // Table View
                    <>
                      <TableContainer
                        maxHeight="600px"
                        overflowY="auto"
                        className="shadow-lg rounded-lg bg-white"
                      >
                        <Table variant="striped" {...getTableProps()}>
                          <Thead className="bg-blue-400 text-lg font-semibold text-gray-800 sticky top-0 z-10">
                            {headerGroups.map((hg) => {
                              return (
                                <Tr
                                  {...hg.getHeaderGroupProps()}
                                  className="shadow-md"
                                >
                                  {hg.headers.map((column) => {
                                    return (
                                      <Th
                                        className={`
                                        ${
                                          column.id === "uniqueId"
                                            ? "sticky left-0 top-0 bg-blue-400 z-[10]"
                                            : ""
                                        }
                                        text-transform: capitalize
                                        font-size: 15px
                                        font-weight: 700
                                        border-b-2 border-gray-300
                                        text-center
                                        bg-blue-400
                                      `}
                                        borderLeft="1px solid #d7d7d7"
                                        borderRight="1px solid #d7d7d7"
                                        {...column.getHeaderProps(
                                          column.getSortByToggleProps()
                                        )}
                                      >
                                        <div className="flex items-center justify-center text-white">
                                          {column.render("Header")}
                                          {column.isSorted && (
                                            <span className="ml-1 text-xs">
                                              {column.isSortedDesc ? (
                                                <FaCaretDown />
                                              ) : (
                                                <FaCaretUp />
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </Th>
                                    );
                                  })}
                                  <Th className="p-3 text-center bg-blue-400 text-white sticky top-0 z-10">
                                    <p className="text-white">Actions</p>
                                  </Th>
                                </Tr>
                              );
                            })}
                          </Thead>

                          <Tbody {...getTableBodyProps()}>
                            {page.map((row) => {
                              prepareRow(row);

                              return (
                                <Tr
                                  className="hover:bg-gray-100 hover:cursor-pointer text-base text-gray-700 transition duration-300 ease-in-out"
                                  {...row.getRowProps()}
                                >
                                  {row.cells.map((cell) => {
                                    return (
                                      <Td
                                        className={`
                        ${
                          cell.column.id === "uniqueId"
                            ? "sticky left-0 top-auto bg-white z-[5] "
                            : ""
                        }
                         text-center
                        border-b border-gray-200
                      `}
                                        {...cell.getCellProps()}
                                      >
                                        {cell.column.id !== "verified" &&
                                          cell.column.id !== "createdAt" &&
                                          cell.render("Cell")}
                                        {cell.column.id === "verified" && (
                                          <span
                                            className={`text-sm rounded-md px-3 py-1 ${
                                              row.original.verified
                                                ? "bg-green-500 text-white"
                                                : "bg-red-500 text-white"
                                            }`}
                                          >
                                            {row.original.verified
                                              ? "Verified"
                                              : "Not Verified"}
                                          </span>
                                        )}
                                        {cell.column.id === "createdAt" && (
                                          <span>
                                            {moment(
                                              row.original.createdAt
                                            ).format("DD/MM/YYYY")}
                                          </span>
                                        )}
                                      </Td>
                                    );
                                  })}
                                  <Td className="p-3 text-center">
                                    <Menu>
                                      <MenuButton
                                        as={Button}
                                        variant="ghost"
                                        size="sm"
                                        rightIcon={<MdMoreVert />}
                                        className="hover:bg-gray-100"
                                      ></MenuButton>
                                      <MenuList>
                                        <MenuItem
                                          icon={<MdOutlineVisibility />}
                                          onClick={() =>
                                            showDetailsHandler(
                                              row.original?._id
                                            )
                                          }
                                        >
                                          View Details
                                        </MenuItem>
                                        <MenuItem
                                          icon={<MdEdit />}
                                          onClick={() =>
                                            editHandler(row.original?._id)
                                          }
                                        >
                                          Edit
                                        </MenuItem>
                                        <MenuItem
                                          icon={<MdDeleteOutline />}
                                          onClick={() => {
                                            setPeopleDeleteId(
                                              row.original?._id
                                            );
                                            confirmDeleteHandler();
                                          }}
                                        >
                                          Delete
                                        </MenuItem>
                                      </MenuList>
                                    </Menu>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    // Card View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {page.map((row) => {
                        prepareRow(row);
                        const person = row.original;
                        return (
                          <div
                            key={person._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-4"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                  {person.firstname} {person.lastname}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  ID: {person.uniqueId}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3 mb-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Status:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {person.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Phone:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {person.phone}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Email:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {person.email}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Verification:
                                </span>
                                <span
                                  className={`text-xs rounded-md px-2 py-1 ${
                                    person.verified
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {person.verified
                                    ? "Verified"
                                    : "Not Verified"}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Created By:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {person.creator}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-center space-x-2 pt-3 border-t border-gray-200">
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => showDetailsHandler(person._id)}
                                leftIcon={<MdOutlineVisibility />}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="orange"
                                onClick={() => editHandler(person._id)}
                                leftIcon={<MdEdit />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => {
                                  onOpen();
                                  setPeopleDeleteId(person._id);
                                }}
                                leftIcon={<MdDeleteOutline />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="w-[max-content] m-auto my-7">
                    <button
                      className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                      disabled={!canPreviousPage}
                      onClick={previousPage}
                    >
                      Prev
                    </button>
                    <span className="mx-3 text-sm md:text-lg lg:text-xl xl:text-base">
                      {pageIndex + 1} of {pageCount}
                    </span>
                    <button
                      className="text-sm mt-2 bg-[#1640d6] py-1 px-4 text-white border-[1px] border-[#1640d6] rounded-3xl disabled:bg-[#b2b2b2] disabled:border-[#b2b2b2] disabled:cursor-not-allowed md:text-lg md:py-1 md:px-4 lg:text-xl lg:py-1 xl:text-base"
                      disabled={!canNextPage}
                      onClick={nextPage}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Peoples;
