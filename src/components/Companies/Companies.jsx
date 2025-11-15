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

import { BiTable, BiCard } from "react-icons/bi";
import { Avatar } from "@chakra-ui/react";


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
  {
    Header: "Verification",
    accessor: "verified",
    Cell: ({ row }) => {
      const { isOpen, onOpen, onClose } = useDisclosure();
      const cancelRef = useRef();
      const [cookies] = useCookies();
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const companyId = row.original._id;
      const [otp, setOtp] = useState("");
      const [isVerified, setIsVerified] = useState(row.original.verify);

      const reSendVerificationOtp = async () => {
        try {
          const response = await fetch(
            `${baseURL}company/resend-otp/${companyId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${cookies?.access_token}`,
              },
            }
          );
          const otpResponse = await response.json();
          toast.success("OTP has been resent successfully!");
        } catch (error) {
          toast.error("Failed to resend OTP. Please try again.");
        }
      };

      const verifyOtp = async () => {
        try {
          if (!companyId || !otp) {
            toast.warning("Please enter OTP before verifying.");
            return;
          }
          const numericOtp = Number(otp);
          if (isNaN(numericOtp)) {
            toast.warning("Invalid OTP format. Please enter a valid number.");
            return;
          }
          const response = await fetch(
            `${baseURL}company/verify-company/${companyId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                authorization: `Bearer ${cookies?.access_token}`,
              },
              body: JSON.stringify({ otp: numericOtp }),
            }
          );
          const verifyResponse = await response.json();
          if (verifyResponse.success) {
            toast.success("OTP verified successfully!");
            setIsVerified(true);
            onClose();
          } else {
            toast.error(
              verifyResponse.message || "Invalid OTP. Please try again."
            );
          }
        } catch (error) {
          toast.error("Something went wrong. Please try again.");
        }
      };

      return (
        <>
          {isVerified ? (
            <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full">
              Verified
            </span>
          ) : (
            <>
              <Button size="sm" colorScheme="blue" onClick={onOpen}>
                Verify
              </Button>
              <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent className="p-6 rounded-lg shadow-lg">
                    <AlertDialogHeader className="text-xl font-semibold text-center">
                      Confirm Verification
                    </AlertDialogHeader>
                    <AlertDialogBody className="text-center space-y-4">
                      <p className="text-gray-600">
                        A one-time password has been sent to your email
                      </p>
                      <Input
                        className="text-center border border-gray-300 rounded-md py-2 px-4 w-3/4 mx-auto"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <div className="flex justify-center gap-4">
                        <Button onClick={verifyOtp} colorScheme="blue">
                          Verify OTP
                        </Button>
                        <Button
                          onClick={reSendVerificationOtp}
                          variant="outline"
                          colorScheme="gray"
                        >
                          Resend OTP
                        </Button>
                      </div>
                    </AlertDialogBody>
                    <AlertDialogFooter className="flex justify-end gap-3">
                      <Button
                        ref={cancelRef}
                        onClick={onClose}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </>
          )}
        </>
      );
    },
  },
];

const Companies = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");

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
  } = useTable({ columns, data: filteredData }, useSortBy, usePagination);

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
      setData(data.companies);
      setFilteredData(data.companies);
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
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.creator?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          d?.companyname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.contact?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);

  const [viewMode, setViewMode] = useState("table");  // table | card


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

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">

              {/* HEADER TITLE */}
              <div className="text-lg md:text-xl font-semibold">Corporate List</div>

              {/* ACTION BUTTONS + SEARCH */}
              <div className="
                  w-full md:w-auto 
                  flex flex-col sm:flex-row 
                  gap-3 flex-wrap
                "
              >
                {/* Hidden file input */}
                <input
                  ref={companyBulkInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleCompanyBulkFile}
                  className="hidden"
                />

                {/* Bulk Upload */}
                <Button
                  onClick={() =>
                    companyBulkInputRef.current &&
                    companyBulkInputRef.current.click()
                  }
                  className="w-full sm:w-auto"
                  fontSize="14px"
                  paddingX="12px"
                  paddingY="3px"
                  rightIcon={<FaFileCsv size={18} />}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Bulk Upload
                </Button>

                {/* Download CSV */}
                <Button
                  onClick={downloadCompanySampleCSV}
                  className="w-full sm:w-auto"
                  fontSize="14px"
                  paddingX="12px"
                  paddingY="3px"
                  rightIcon={<FaFileCsv size={18} />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Download Sample CSV
                </Button>

                {/* Search Box */}
                <textarea
                  className="
                    rounded-[10px] 
                    w-full sm:flex-1 
                    px-3 py-2 text-sm 
                    border 
                    focus:outline-[#1640d6]
                  "
                  rows="1"
                  placeholder="Search"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />

                {/* Refresh */}
                <Button
                  className="w-full sm:w-auto"
                  fontSize="14px"
                  paddingX="12px"
                  paddingY="3px"
                  leftIcon={<MdOutlineRefresh />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                  onClick={fetchAllCompanies}
                >
                  Refresh
                </Button>

                {/* Add Corporate */}
                <Button
                  className="w-full sm:w-auto"
                  fontSize="14px"
                  paddingX="12px"
                  paddingY="3px"
                  color="white"
                  backgroundColor="#1640d6"
                  onClick={addCompaniesHandler}
                >
                  Add New Corporate
                </Button>

                {/* Page Size */}
                <Select
                  onChange={(e) => setPageSize(e.target.value)}
                  width={{ base: "100%", sm: "80px" }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={100000}>All</option>
                </Select>
              </div>
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
                <div className="mt-6">

                  {/* VIEW TOGGLE */}
                  <div className="flex justify-end mb-5">
                    <div className="flex bg-gray-100 p-1 rounded-lg shadow-inner gap-2">

                      {/* TABLE BUTTON */}
                      <button
                        onClick={() => setViewMode("table")}
                        className={`px-4 py-2 rounded-md flex items-center gap-1 transition-all ${viewMode === "table"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        <BiTable size={18} />
                        {/* <span className="hidden sm:block"></span> */}
                      </button>

                      {/* CARD BUTTON */}
                      <button
                        onClick={() => setViewMode("card")}
                        className={`px-4 py-2 rounded-md flex items-center gap-1 transition-all ${viewMode === "card"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-600 hover:bg-gray-200"
                          }`}
                      >
                        <BiCard size={18} />
                        {/* <span className="hidden sm:block"></span> */}
                      </button>

                    </div>
                  </div>

                  {/* ================= TABLE VIEW ================= */}
                  {viewMode === "table" && (
                    <div>
                      <TableContainer maxHeight="600px" overflowY="auto" overflowX="auto">
                        <Table variant="simple" {...getTableProps()} className="min-w-[1100px]">

                          {/* TABLE HEAD */}
                          <Thead className="bg-blue-400 text-white text-lg font-semibold">
                            {headerGroups.map((hg) => (
                              <Tr
                                {...hg.getHeaderGroupProps()}
                                className="border-b-2 border-gray-300"
                              >
                                {hg.headers.map((column) => (
                                  <Th
                                    className={`text-center py-3 px-4 bg-blue-400 border-r border-gray-300 text-[15px] font-[700]
                                        ${column.id === "uniqueId"
                                        ? "sticky left-0 z-[10] text-left pl-4 shadow-[4px_0_6px_-3px_rgba(0,0,0,1)]"
                                        : ""
                                      }
                                      `}
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                  >
                                    <div className="flex justify-center items-center text-white">
                                      {column.render("Header")}
                                      {column.isSorted && (
                                        <span className="ml-1 text-xs">
                                          {column.isSortedDesc ? <FaCaretDown /> : <FaCaretUp />}
                                        </span>
                                      )}
                                    </div>
                                  </Th>
                                ))}

                                <Th className="bg-blue-400 text-center py-3 px-4 text-white whitespace-nowrap">
                                  Actions
                                </Th>
                              </Tr>
                            ))}
                          </Thead>

                          {/* TABLE BODY */}
                          <Tbody {...getTableBodyProps()}>
                            {page.map((row) => {
                              prepareRow(row);

                              return (
                                <Tr
                                  {...row.getRowProps()}
                                  className="hover:bg-gray-100 transition text-base text-gray-700"
                                >
                                  {row.cells.map((cell) => (
                                    <Td
                                      {...cell.getCellProps()}
                                      className={`text-center border-b border-l border-r p-3
                                          ${cell.column.id === "uniqueId"
                                          ? "sticky left-0 bg-gray-50 z-20 shadow-[4px_0_6px_-3px_rgba(0,0,0,1)]"
                                          : ""
                                        }
                                        `}
                                    >
                                      {/* normal cells */}
                                      {cell.column.id !== "created_on" &&
                                        cell.column.id !== "creator" &&
                                        cell.render("Cell")}

                                      {/* created on */}
                                      {cell.column.id === "created_on" &&
                                        row.original.createdAt && (
                                          <span>
                                            {moment(row.original.createdAt).format("DD/MM/YYYY")}
                                          </span>
                                        )}

                                      {/* creator */}
                                      {cell.column.id === "creator" && (
                                        <span className="text-blue-500 font-semibold">
                                          {row.original.creator?.name}
                                        </span>
                                      )}
                                    </Td>
                                  ))}

                                  {/* ACTION BUTTONS */}
                                  <Td className="p-3 flex justify-center items-center">
                                    <Menu placement="bottom-end">
                                      <MenuButton
                                        as={IconButton}
                                        icon={<MdMoreVert />}
                                        variant="ghost"
                                        size="sm"
                                      />
                                      <Portal>
                                        <MenuList zIndex={2000}>
                                          <MenuItem
                                            icon={<MdOutlineVisibility />}
                                            onClick={() => showDetailsHandler(row.original._id)}
                                          >
                                            View
                                          </MenuItem>
                                          <MenuItem
                                            icon={<MdEdit />}
                                            onClick={() => editHandler(row.original._id)}

                                          >
                                            Edit
                                          </MenuItem>
                                          <MenuItem
                                            icon={<MdDeleteOutline />}
                                            onClick={() => {
                                              setCompanyDeleteId(row.original._id);
                                              confirmDeleteHandler();
                                            }}
                                          >
                                            Delete
                                          </MenuItem>
                                        </MenuList>
                                      </Portal>
                                    </Menu>
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </TableContainer>

                      {/* PAGINATION */}
                      <div className="flex justify-center items-center gap-4 my-7">
                        <button
                          className="bg-[#1640d6] text-white px-5 py-1 rounded-full disabled:bg-gray-400"
                          disabled={!canPreviousPage}
                          onClick={previousPage}
                        >
                          Prev
                        </button>

                        <span className="font-medium">
                          {pageIndex + 1} of {pageCount}
                        </span>

                        <button
                          className="bg-[#1640d6] text-white px-5 py-1 rounded-full disabled:bg-gray-400"
                          disabled={!canNextPage}
                          onClick={nextPage}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ================= CARD VIEW ================= */}
                  {viewMode === "card" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {page.map((row) => {
                        prepareRow(row);
                        const c = row.original;

                        return (
                          <div
                            key={c._id}
                            className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-3">
                                <Avatar name={c.companyname} size="md" />
                                <div>
                                  <div className="font-semibold text-lg">{c.companyname}</div>
                                  <div className="text-sm text-gray-500">ID: {c.uniqueId}</div>
                                </div>
                              </div>

                              <span
                                className={`px-2 py-1 text-xs rounded-full ${c.verify
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {c.verify ? "Verified" : "Not Verified"}
                              </span>
                            </div>

                            <div className="mt-3 text-sm space-y-1">
                              <p>
                                <span className="font-semibold">Contact:</span>{" "}
                                {c.contactPersonName || "-"}
                              </p>
                              <p>
                                <span className="font-semibold">Phone:</span> {c.phone}
                              </p>
                              <p>
                                <span className="font-semibold">Status:</span> {c.status}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {moment(c.createdAt).format("DD/MM/YYYY")}
                              </p>
                            </div>

                            <div className="mt-4 flex justify-end gap-4 text-lg">
                              <MdOutlineVisibility
                                className="text-blue-600 hover:scale-110 cursor-pointer"
                                onClick={() => showDetailsHandler(c._id)}
                              />
                              <MdEdit
                                className="text-yellow-600 hover:scale-110 cursor-pointer"
                                onClick={() => editHandler(c._id)}
                              />
                              <MdDeleteOutline
                                className="text-red-600 hover:scale-110 cursor-pointer"
                                onClick={() => {
                                  setCompanyDeleteId(c._id);
                                  confirmDeleteHandler();
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Companies;
