import { Button, Select, useDisclosure } from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
  MdDownload,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddOffersDrawer,
  closeAddPeoplesDrawer,
  closeAddProformaInvoicesDrawer,
  closeEditPeoplesDrawer,
  closeEditProformaInvoicesDrawer,
  closeShowDetailsPeoplesDrawer,
  closeShowDetailsProformaInvoicesDrawer,
  openAddOffersDrawer,
  openAddPeoplesDrawer,
  openAddProformaInvoicesDrawer,
  openEditPeoplesDrawer,
  openEditProformaInvoicesDrawer,
  openShowDetailsPeoplesDrawer,
  openShowDetailsProformaInvoicesDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

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
import PeoplesEditDrawer from "../ui/Drawers/Edit Drawers/PeoplesEditDrawer";
import PeoplesDetailsDrawer from "../ui/Drawers/Details Drawers/PeoplesDetailsDrawer";
import PeoplesDrawer from "../ui/Drawers/Add Drawers/PeoplesDrawer";
import { FcDatabase } from "react-icons/fc";
import OffersDrawer from "../ui/Drawers/Add Drawers/OffersDrawer";
import ProformaInvoicesDrawer from "../ui/Drawers/Add Drawers/ProformaInvoicesDrawer";
import moment from "moment";
import ProformaInvoicesEditDrawer from "../ui/Drawers/Edit Drawers/ProformaInvoiceEditDrawer";
import ProformaInvoicesDetailsDrawer from "../ui/Drawers/Details Drawers/ProformaInvoicesDetailsDrawer";
import { BiTable, BiCard } from "react-icons/bi";
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
import { Link } from "react-router-dom";

const columns = [
  { Header: "Number", accessor: "number" },
  { Header: "Created By", accessor: "creator" },
  { Header: "Created On", accessor: "created_on" },
  { Header: "Customer", accessor: "customer" },
  { Header: "Date", accessor: "startdate" },
  { Header: "Expire Date", accessor: "expiredate" },
  { Header: "Sub Total", accessor: "subtotal" },
  { Header: "Total", accessor: "total" },
  { Header: "Status", accessor: "status" },
  { Header: "Payment Status", accessor: "paymentstatus" },
];

const ProformaInvoices = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");

  const dispatch = useDispatch();
  const [proformaInovoiceDeleteId, setProformaInvoiceDeleteId] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

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
    addProformaInvoicesDrawerIsOpened,
    editProformaInvoicesDrawerIsOpened,
    showDetailsProformaInvoicesDrawerIsOpened,
  } = useSelector((state) => state.misc);
  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "proforma-invoice");

  const addProformaInvoicesHandler = () => {
    dispatch(openAddProformaInvoicesDrawer());
  };

  const statusStyles = {
    draft: {
      bg: "#ffffff",
      text: "black",
    },
    pending: {
      bg: "#e6f4ff",
      text: "#0958d9",
    },
    sent: {
      bg: "#f9f0ff",
      text: "#531dab",
    },
    accepted: {
      bg: "#f6ffed",
      text: "#389e0d",
    },
    declined: {
      bg: "#fff1f0",
      text: "#cf1322",
    },
  };

  const getAllProformaInvoices = async () => {
    setSearchKey("");
    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        baseUrl + "proforma-invoice/all-proforma-invoices",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setData(data.proformaInvoices);
      setFilteredData(data.proformaInvoices);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  const deleteHandler = async () => {
    if (!proformaInovoiceDeleteId) {
      return;
    }

    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(
        baseUrl + "proforma-invoice/delete-proforma-invoice",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookies?.access_token}`,
          },
          body: JSON.stringify({
            proformaInvoiceId: proformaInovoiceDeleteId,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      onClose();
      getAllProformaInvoices();
      dispatch(closeAddOffersDrawer());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editHandler = async (id) => {
    setDataId(id);
    dispatch(openEditProformaInvoicesDrawer());
  };

  const downloadHandler = (id) => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL;
    fetch(baseUrl + "proforma-invoice/download-proforma-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies?.access_token}`,
      },
      body: JSON.stringify({
        proformaInvoiceId: id,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch file");
        const filename = response.headers
          .get("content-disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "");
        return response.blob().then((blob) => ({
          filename: filename || "proforma-invoice.pdf",
          blob,
        }));
      })
      .then(({ filename, blob }) => {
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      })
      .catch((err) => {
        toast.error(err?.message || "Something went wrong");
      });
  };

  const showDetailsHandler = async (id) => {
    setDataId(id);
    dispatch(openShowDetailsProformaInvoicesDrawer());
  };

  useEffect(() => {
    if (isAllowed) {
      getAllProformaInvoices();
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.startdate?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.creator?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", ""))) ||
          d?.total?.toString().includes(searchKey.toLowerCase()) ||
          d?.subtotal?.toString().includes(searchKey.toLowerCase()) ||
          d?.status?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.people
            ? (d?.people?.firstname + " " + d?.people?.lastname)
                .toLowerCase()
                .includes(searchKey.toLowerCase())
            : d?.company?.companyname
                .toLowerCase()
                .includes(searchKey.toLowerCase()))
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);

    const [viewMode, setViewMode] = useState("table");

  return (
    <>
      {!isAllowed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-[#ff6f6f] flex gap-x-2">
          {msg}
          {auth?.isTrial && !auth?.isTrialEnded && (
            <div className="-mt-1">
              <Link to="/pricing">
                <button className="text-base border border-[#d61616] rounded-md px-5 py-1 bg-[#d61616] text-white font-medium hover:bg-white hover:text-[#d61616] ease-in-out duration-300">
                  {auth?.account?.trial_started || auth?.isSubscriptionEnded
                    ? "Upgrade"
                    : "Activate Free Trial"}
                </button>
              </Link>
            </div>
          )}
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
                    Delete Proforma Invoice
                  </AlertDialogHeader>

                  <AlertDialogBody>Are you sure?</AlertDialogBody>

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
            <div className="flex flex-col items-start justify-start lg:flex-row gap-y-1 lg:justify-between lg:items-center mb-8">
              <div className="flex text-lg md:text-xl font-semibold items-center gap-y-1">
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                Proforma Invoice List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full lg:w-fit">
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
                  onClick={getAllProformaInvoices}
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
                  onClick={addProformaInvoicesHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Proforma Invoice
                </Button>
                <Select
                  onChange={(e) => setPageSize(e.target.value)}
                  width="80px"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={100000}>All</option>
                </Select>
              </div>
            </div>
          </div>

          <div>
            {addProformaInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeAddProformaInvoicesDrawer())
                }
              >
                <ProformaInvoicesDrawer
                  closeDrawerHandler={() =>
                    dispatch(closeAddProformaInvoicesDrawer())
                  }
                  getAllProformaInvoices={getAllProformaInvoices}
                />
              </ClickMenu>
            )}

            {editProformaInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeEditProformaInvoicesDrawer())
                }
              >
                <ProformaInvoicesEditDrawer
                  dataId={dataId}
                  closeDrawerHandler={() => {
                    dispatch(closeEditProformaInvoicesDrawer());
                  }}
                  getAllProformaInvoices={getAllProformaInvoices}
                />
              </ClickMenu>
            )}

            {showDetailsProformaInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeShowDetailsProformaInvoicesDrawer())
                }
              >
                <ProformaInvoicesDetailsDrawer
                  dataId={dataId}
                  closeDrawerHandler={() =>
                    dispatch(closeShowDetailsProformaInvoicesDrawer())
                  }
                  getAllProformaInvoices={getAllProformaInvoices}
                />
              </ClickMenu>
            )}
           {/* ------------------- LOADING ------------------- */}
{loading && (
  <div>
    <Loading />
  </div>
)}

{/* ------------------- NO DATA ------------------- */}
{!loading && filteredData.length === 0 && (
  <div className="flex items-center justify-center flex-col">
    <FcDatabase color="red" size={80} />
    <span className="mt-1 font-semibold text-2xl">No data found.</span>
  </div>
)}

{/* ------------------- HAS DATA ------------------- */}
{!loading && filteredData.length > 0 && (
  <div>

    {/* VIEW MODE TOGGLE */}
    <div className="flex justify-end gap-x-2 mb-4">
      <button
        onClick={() => setViewMode("table")}
        className={`p-2 rounded-md transition ${
          viewMode === "table"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        <BiTable size={20} />
      </button>

      <button
        onClick={() => setViewMode("card")}
        className={`p-2 rounded-md transition ${
          viewMode === "card"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        <BiCard size={20} />
      </button>
    </div>

    {/* ---------------------------------------------------------------- */}
    {/* ------------------------- TABLE VIEW --------------------------- */}
    {/* ---------------------------------------------------------------- */}
    {viewMode === "table" && (
      <>
        <TableContainer maxHeight="600px" overflowY="auto">
          <Table variant="simple" {...getTableProps()}>
            <Thead
              position="sticky"
              top={0}
              zIndex={1}
              bg="blue.400"
              color="white"
              boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)"
              className="text-lg font-semibold"
            >
              {headerGroups.map((hg) => (
                <Tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map((column) => (
                    <Th
                      className={
                        column.id === "customer"
                          ? "sticky top-0 left-[-2px]"
                          : ""
                      }
                      textTransform="capitalize"
                      fontSize="15px"
                      fontWeight="700"
                      color="white"
                      {...column.getHeaderProps(
                        column.getSortByToggleProps()
                      )}
                    >
                      <p className="flex items-center gap-1">
                        {column.render("Header")}
                        {column.isSorted && (
                          <span>
                            {column.isSortedDesc ? <FaCaretDown /> : <FaCaretUp />}
                          </span>
                        )}
                      </p>
                    </Th>
                  ))}

                  <Th
                    fontSize="15px"
                    fontWeight="700"
                    color="white"
                    borderLeft="1px solid #e0e0e0"
                  >
                    Actions
                  </Th>
                </Tr>
              ))}
            </Thead>

            <Tbody {...getTableBodyProps()}>
              {page.map((row, ind) => {
                prepareRow(row);

                const customer = row.original?.customer || {};
                const company = customer?.company;
                const people = customer?.people;

                return (
                  <Tr
                    className="hover:bg-gray-100 text-base"
                    {...row.getRowProps()}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <Td
                          className={
                            cell.column.id === "customer"
                              ? "sticky left-[-2px] bg-[#f9fafc]"
                              : ""
                          }
                          fontWeight="600"
                          {...cell.getCellProps()}
                        >
                          {/* DEFAULT CELL RENDER */}
                          {[
                            "number",
                            "startdate",
                            "status",
                            "customer",
                            "expiredate",
                            "total",
                            "subtotal",
                            "created_on",
                            "creator",
                          ].includes(cell.column.id) === false &&
                            cell.render("Cell")}

                          {/* Number */}
                          {cell.column.id === "number" && <span>{ind + 1}</span>}

                          {/* Total */}
                          {cell.column.id === "total" && (
                            <span>&#8377;{row.original?.total || 0}</span>
                          )}

                          {/* Subtotal */}
                          {cell.column.id === "subtotal" && (
                            <span>&#8377;{row.original?.subtotal || 0}</span>
                          )}

                          {/* Creator */}
                          {cell.column.id === "creator" && (
                            <span className="text-blue-600">
                              {row.original?.creator?.name || "Unknown"}
                            </span>
                          )}

                          {/* Created On */}
                          {cell.column.id === "created_on" && (
                            <span>
                              {row.original?.createdAt
                                ? moment(row.original.createdAt).format(
                                    "DD/MM/YYYY"
                                  )
                                : "--"}
                            </span>
                          )}

                          {/* CUSTOMER SAFE HANDLING */}
                          {cell.column.id === "customer" && (
                            <span>
                              {company?.companyname ||
                                (people
                                  ? `${people.firstname || ""} ${
                                      people.lastname || ""
                                    }`
                                  : "Unknown Customer")}
                            </span>
                          )}

                          {/* Start Date */}
                          {cell.column.id === "startdate" && (
                            <span>
                              {row.original?.startdate
                                ? moment(row.original.startdate).format(
                                    "DD/MM/YYYY"
                                  )
                                : "--"}
                            </span>
                          )}

                          {/* Status */}
                          {cell.column.id === "status" && (
                            <span
                              className="text-sm rounded-md px-3 py-1"
                              style={{
                                backgroundColor:
                                  statusStyles[
                                    row.original?.status?.toLowerCase() ||
                                      "default"
                                  ]?.bg,
                                color:
                                  statusStyles[
                                    row.original?.status?.toLowerCase() ||
                                      "default"
                                  ]?.text,
                              }}
                            >
                              {row.original?.status || "--"}
                            </span>
                          )}
                        </Td>
                      );
                    })}

                    {/* ACTIONS */}
                    <Td className="flex gap-x-3">
                      <MdDownload
                        className="hover:scale-110 text-green-500"
                        size={20}
                        onClick={() =>
                          row.original?._id &&
                          downloadHandler(row.original._id)
                        }
                      />

                      <MdOutlineVisibility
                        className="hover:scale-110 text-blue-500"
                        size={20}
                        onClick={() =>
                          row.original?._id &&
                          showDetailsHandler(row.original._id)
                        }
                      />

                      <MdEdit
                        className="hover:scale-110 text-orange-500"
                        size={20}
                        onClick={() =>
                          row.original?._id &&
                          editHandler(row.original._id)
                        }
                      />

                      <MdDeleteOutline
                        className="hover:scale-110 text-red-500"
                        size={20}
                        onClick={() => {
                          if (row.original?._id) {
                            setProformaInvoiceDeleteId(row.original._id);
                            confirmDeleteHandler();
                          }
                        }}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <div className="w-[max-content] m-auto my-7">
          <button
            className="bg-[#1640d6] text-white px-4 py-1 rounded-3xl disabled:bg-gray-300"
            disabled={!canPreviousPage}
            onClick={previousPage}
          >
            Prev
          </button>

          <span className="mx-3">
            {pageIndex + 1} of {pageCount}
          </span>

          <button
            className="bg-[#1640d6] text-white px-4 py-1 rounded-3xl disabled:bg-gray-300"
            disabled={!canNextPage}
            onClick={nextPage}
          >
            Next
          </button>
        </div>
      </>
    )}

    {/* ---------------------------------------------------------------- */}
    {/* ------------------------- CARD VIEW ---------------------------- */}
    {/* ---------------------------------------------------------------- */}
    {viewMode === "card" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {page.map((row) => {
          prepareRow(row);
          const item = row.original;

          const customer = item?.customer || {};
          const company = customer?.company;
          const people = customer?.people;

          return (
            <div
              key={item?._id}
              className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg transition-all"
            >
              {/* NAME */}
              <div className="text-xl font-semibold text-gray-800 mb-2">
                {company?.companyname ||
                  (people
                    ? `${people.firstname || ""} ${
                        people.lastname || ""
                      }`
                    : "Unknown Customer")}
              </div>

              {/* Description */}
              <div className="text-sm text-gray-600">
                {item?.description
                  ? item.description.length > 140
                    ? item.description.substring(0, 140) + "..."
                    : item.description
                  : "No description"}
              </div>

              {/* Footer */}
              <div className="text-xs text-gray-500 mt-3">
                Created by{" "}
                <span className="text-blue-600">
                  {item?.creator?.name || "Unknown"}
                </span>{" "}
                on{" "}
                {item?.createdAt
                  ? moment(item.createdAt).format("DD/MM/YYYY")
                  : "--"}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-6 border-t pt-4 mt-4">
                <MdOutlineVisibility
                  size={22}
                  className="text-blue-600 hover:scale-110 cursor-pointer"
                  onClick={() => item?._id && showDetailsHandler(item._id)}
                />

                <MdEdit
                  size={22}
                  className="text-orange-600 hover:scale-110 cursor-pointer"
                  onClick={() => item?._id && editHandler(item._id)}
                />

                <MdDeleteOutline
                  size={22}
                  className="text-red-600 hover:scale-110 cursor-pointer"
                  onClick={() =>
                    item?._id &&
                    (setProformaInvoiceDeleteId(item._id),
                    confirmDeleteHandler())
                  }
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
      )}
    </>
  );
};

export default ProformaInvoices;
