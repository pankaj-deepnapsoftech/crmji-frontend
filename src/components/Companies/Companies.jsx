import {
  Button,
  Link,
  Select,
  useDisclosure,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Portal,
} from "@chakra-ui/react";
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
  closeAddCompaniesDrawer,
  closeEditCompaniesDrawer,
  closeShowDetailsCompaniesDrawer,
  openAddCompaniesDrawer,
  openEditCompaniesDrawer,
  openShowDetailsCompaniesDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FcDatabase } from "react-icons/fc";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import moment from "moment";

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { usePagination, useSortBy, useTable } from "react-table";
import ClickMenu from "../ui/ClickMenu";
import CompaniesEditDrawer from "../ui/Drawers/Edit Drawers/CompaniesEditDrawer";
import CompaniesDetailsDrawer from "../ui/Drawers/Details Drawers/CompaniesDetailsDrawer";
import CompaniesDrawer from "../ui/Drawers/Add Drawers/CompaniesDrawer";

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
import * as XLSX from "xlsx";

const columns = [
  {
    Header: "ID",
    accessor: "uniqueId",
  },
  {
    Header: "Company Name",
    accessor: "companyname",
  },
  {
    Header: "Contact Person Name",
    accessor: "contactPersonName",
  },
  {
    Header: "Phone",
    accessor: "phone",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  // {
  //   Header: "Verification",
  //   accessor: "verified",
  //   Cell: ({ row }) => {
  //     const { isOpen, onOpen, onClose } = useDisclosure();
  //     const cancelRef = useRef();
  //     const [cookies] = useCookies();
  //     const baseURL = process.env.REACT_APP_BACKEND_URL;

  //     const companyId = row.original._id;
  //     const [otp, setOtp] = useState("");
  //     const [isVerified, setIsVerified] = useState(row.original.verify);

  //     const reSendVerificationOtp = async () => {
  //       try {
  //         const response = await fetch(
  //           `${baseURL}company/resend-otp/${companyId}`,
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
  //         if (!companyId || !otp) {
  //           toast.warning("Please enter OTP before verifying.");
  //           return;
  //         }
  //         const numericOtp = Number(otp);
  //         if (isNaN(numericOtp)) {
  //           toast.warning("Invalid OTP format. Please enter a valid number.");
  //           return;
  //         }
  //         const response = await fetch(
  //           `${baseURL}company/verify-company/${companyId}`,
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
];

const Companies = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [archivedData, setArchivedData] = useState([]);
  const [interestedData, setInterestedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredArchivedData, setFilteredArchivedData] = useState([]);
  const [filteredInterestedData, setFilteredInterestedData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  const dispatch = useDispatch();

  const [companyDeleteId, setCompanyDeleteId] = useState();
  const [bulkPreviewRows, setBulkPreviewRows] = useState([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const companyBulkInputRef = useRef(null);

  const downloadCompanySampleCSV = () => {
    const headers = [
      "companyname",
      "contact",
      "phone",
      "email",
      "website",
      "gst_no",
    ];
    const sample = [
      {
        companyname: "Acme Pvt Ltd",
        contact: "Ravi Kumar",
        phone: "9876001122",
        email: "contact@acme.com",
        website: "https://acme.com",
        gst_no: "22AAAAA0000A1Z5",
      },
      {
        companyname: "Globex Corp",
        contact: "Priya Singh",
        phone: "9876003344",
        email: "sales@globex.com",
        website: "https://globex.com",
        gst_no: "27BBBBB1111B2Z6",
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
    link.download = "corporates_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "company");

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
    addCompaniesDrawerIsOpened,
    editCompaniesDrawerIsOpened,
    showDetailsCompaniesDrawerIsOpened,
  } = useSelector((state) => state.misc);

  const baseURL = process.env.REACT_APP_BACKEND_URL;
  const handleCompanyBulkFile = (event) => {
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

  const fetchAllCompanies = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "company/all-companies", {
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
      const active = data.companies.filter(
        (company) => company.status !== "Not Interested" && company.status !== "Interested"
      );
      const archived = data.companies.filter((company) => company.status === "Not Interested");
      const interested = data.companies.filter((company) => company.status === "Interested");
      setData(active);
      setArchivedData(archived);
      setInterestedData(interested);
      setFilteredData(active);
      setFilteredArchivedData(archived);
      setFilteredInterestedData(interested);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  const addCompaniesHandler = () => {
    dispatch(openAddCompaniesDrawer());
  };

  const editHandler = (id) => {
    setDataId(id);
    dispatch(openEditCompaniesDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsCompaniesDrawer());
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  const deleteHandler = async () => {
    if (!companyDeleteId) {
      return;
    }

    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseURL + "company/delete-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyId: companyDeleteId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      onClose();
      fetchAllCompanies();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllCompanies();
    }
  }, []);

  useEffect(() => {
    const filterFn = (list = []) => {
      if (searchKey.trim() === "") return list;
      return list.filter(
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
          d?.companyname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.contactPersonName?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.uniqueId?.toLowerCase().includes(searchKey.toLowerCase())
      );
    };

    setFilteredData(filterFn(data));
    setFilteredArchivedData(filterFn(archivedData));
    setFilteredInterestedData(filterFn(interestedData));
  }, [searchKey, data, archivedData, interestedData]);

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
                    Delete Corporate
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure, deleting a Corporate will also delete it from
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
                Corporate List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full md:w-fit">
                <input
                  ref={companyBulkInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleCompanyBulkFile}
                  style={{ display: "none" }}
                />
                <Button
                  onClick={() =>
                    companyBulkInputRef.current &&
                    companyBulkInputRef.current.click()
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
                  onClick={downloadCompanySampleCSV}
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
                <textarea
                  className="rounded-[10px] w-full md:flex-1 px-2 py-2 md:px-3 md:py-2 text-sm focus:outline-[#1640d6] hover:outline:[#1640d6] border resize-none"
                  rows="1"
                  width="220px"
                  placeholder="Search"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 100 }}
                  onClick={fetchAllCompanies}
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
                  onClick={addCompaniesHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Corporate
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
              <butCorporate
                Listton
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === "card"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title="Card View"
              >
                <BiCard size={20} />
              </butCorporate>
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
              {addCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeAddCompaniesDrawer())
                  }
                >
                  <CompaniesDrawer
                    fetchAllCompanies={fetchAllCompanies}
                    closeDrawerHandler={() =>
                      dispatch(closeAddCompaniesDrawer())
                    }
                  />
                </ClickMenu>
              )}

              {editCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeEditCompaniesDrawer())
                  }
                >
                  <CompaniesEditDrawer
                    fetchAllCompanies={fetchAllCompanies}
                    dataId={dataId}
                    closeDrawerHandler={() => {
                      dispatch(closeEditCompaniesDrawer());
                      fetchAllCompanies();
                    }}
                  />
                </ClickMenu>
              )}

              {showDetailsCompaniesDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowDetailsCompaniesDrawer())
                  }
                >
                  <CompaniesDetailsDrawer
                    dataId={dataId}
                    closeDrawerHandler={() =>
                      dispatch(closeShowDetailsCompaniesDrawer())
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
                          cell.column.id === "companyname"
                            ? "sticky top-0 left-[-2px] "
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
                                            setCompanyDeleteId(
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
                        const company = row.original;
                        return (
                          <div
                            key={company._id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                  {company.companyname}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">
                                  ID: {company.uniqueId}
                                </p>
                              </div>
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
                                      showDetailsHandler(company._id)
                                    }
                                  >
                                    View Details
                                  </MenuItem>
                                  <MenuItem
                                    icon={<MdEdit />}
                                    onClick={() => editHandler(company._id)}
                                  >
                                    Edit
                                  </MenuItem>
                                  <MenuItem
                                    icon={<MdDeleteOutline />}
                                    onClick={() => {
                                      setCompanyDeleteId(company._id);
                                      confirmDeleteHandler();
                                    }}
                                  >
                                    Delete
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Contact Person:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {company.contactPersonName}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Phone:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {company.phone}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Status:
                                </span>
                                <span className="text-sm text-gray-800">
                                  {company.status}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Verification:
                                </span>
                                <span
                                  className={`text-xs rounded-md px-2 py-1 ${
                                    company.verified
                                      ? "bg-green-500 text-white"
                                      : "bg-red-500 text-white"
                                  }`}
                                >
                                  {company.verified
                                    ? "Verified"
                                    : "Not Verified"}
                                </span>
                              </div>
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
      {!loading && (
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Archived Corporates (Not Interested)</h3>
          {filteredArchivedData.length === 0 && (
            <div className="flex items-center justify-center flex-col text-gray-500">
              <FcDatabase color="orange" size={60} />
              <span className="mt-1 font-semibold">No archived corporates.</span>
            </div>
          )}
          {filteredArchivedData.length > 0 && (
            <TableContainer
              maxHeight="400px"
              overflowY="auto"
              className="shadow-lg rounded-lg bg-white"
            >
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Company Name</Th>
                    <Th>Contact Person</Th>
                    <Th>Status</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredArchivedData.map((company) => (
                    <Tr key={company._id}>
                      <Td>{company.uniqueId}</Td>
                      <Td>{company.companyname}</Td>
                      <Td>{company.contactPersonName}</Td>
                      <Td>{company.status}</Td>
                      <Td>{company.phone}</Td>
                      <Td>{company.email}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </div>
      )}
    </>
  );
};
export default Companies;
