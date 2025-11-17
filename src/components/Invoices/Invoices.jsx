import { Button, Select } from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
  MdDownload,
  MdPayment,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddOffersDrawer,
  closeAddPeoplesDrawer,
  closeAddInvoicesDrawer,
  closeEditPeoplesDrawer,
  closeEditInvoicesDrawer,
  closeShowDetailsPeoplesDrawer,
  closeShowDetailsInvoicesDrawer,
  openAddOffersDrawer,
  openAddPeoplesDrawer,
  openAddInvoicesDrawer,
  openEditPeoplesDrawer,
  openEditInvoicesDrawer,
  openShowDetailsPeoplesDrawer,
  openShowDetailsInvoicesDrawer,
  closeAddPaymentsDrawer,
  openAddPaymentsDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { BiTable, BiCard } from "react-icons/bi";
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
import { FcDatabase } from "react-icons/fc";
import InvoicesDrawer from "../ui/Drawers/Add Drawers/InvoicesDrawer";
import moment from "moment";
import InvoicesEditDrawer from "../ui/Drawers/Edit Drawers/InvoicesEditDrawer";
import InvoicesDetailsDrawer from "../ui/Drawers/Details Drawers/InvoicesDetailsDrawer";
import PaymentsDrawer from "../ui/Drawers/Add Drawers/PaymentsDrawer";
import { checkAccess } from "../../utils/checkAccess";
import { Link } from "react-router-dom";

const columns = [
  {
    Header: "Number",
    accessor: "number",
  },
  {
    Header: "Created By",
    accessor: "creator",
  },
  {
    Header: "Created On",
    accessor: "created_on",
  },
  {
    Header: "Customer",
    accessor: "customer",
  },
  {
    Header: "Date",
    accessor: "startdate",
  },
  {
    Header: "Expire Date",
    accessor: "expiredate",
  },
  {
    Header: "Sub Total",
    accessor: "subtotal",
  },
  {
    Header: "Total",
    accessor: "total",
  },
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Payment Status",
    accessor: "paymentstatus",
  },
];

const Invoices = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");

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
  } = useTable({ columns, data: filteredData }, useSortBy, usePagination);

  const {
    addInvoicesDrawerIsOpened,
    editInvoicesDrawerIsOpened,
    showDetailsInvoicesDrawerIsOpened,
    addPaymentsDrawerIsOpened,
    editPaymentsDrawerIsOpened,
    showDetailsPaymentsDrawerIsOpened,
  } = useSelector((state) => state.misc);

  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "invoice");

  const addInvoicesHandler = () => {
    dispatch(openAddInvoicesDrawer());
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
  };

  const paymentStatusStyles = {
    "partially paid": {
      bg: "#f9f0ff",
      text: "#531dab",
    },
    paid: {
      bg: "#f6ffed",
      text: "#389e0d",
    },
    unpaid: {
      bg: "#fff1f0",
      text: "#cf1322",
    },
  };

  const getAllInvoices = async () => {
    setSearchKey("");
    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "invoice/all-invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cookies?.access_token}`,
        },
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setData(data.invoices);
      setFilteredData(data.invoices);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  console.log(data);

  const deleteHandler = async (id) => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseUrl + "invoice/delete-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          invoiceId: id,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      getAllInvoices();
      dispatch(closeAddInvoicesDrawer());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editHandler = async (id) => {
    setDataId(id);
    dispatch(openEditInvoicesDrawer());
  };

  const paymentHandler = async (id) => {
    setDataId(id);
    dispatch(openAddPaymentsDrawer());
  };

  const downloadHandler = async (id) => {
    const baseUrl = process.env.REACT_APP_BACKEND_URL;
    fetch(baseUrl + "invoice/download-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies?.access_token}`,
      },
      body: JSON.stringify({
        invoiceId: id,
      }),
    })
      .then((response) => {
        const filename = response?.headers
          ?.get("content-disposition")
          ?.split("filename=")[1]
          ?.replace(/"/g, "");
        return response.blob().then((blob) => ({ filename, blob }));
      })
      .then(({ filename, blob }) => {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        a.remove();
      })
      .catch((err) => {
        toast.error(err?.message || "Something went wrong");
      });
  };

  const showDetailsHandler = async (id) => {
    setDataId(id);
    dispatch(openShowDetailsInvoicesDrawer());
  };

  useEffect(() => {
    if (isAllowed) {
      getAllInvoices();
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
          d?.expiredate?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.total?.toString().includes(searchKey.toLowerCase()) ||
          d?.subtotal?.toString().includes(searchKey.toLowerCase()) ||
          d?.status?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.paymentstatus?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.customer?.people
            ? (
              d?.customer?.people?.firstname +
              " " +
              d?.customer?.people?.lastname
            )
              .toLowerCase()
              .includes(searchKey.toLowerCase())
            : d.customer.company.companyname
              .toLowerCase()
              .includes(searchKey.toLowerCase()))
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);


  const [viewMode, setViewMode] = useState("table"); // table or card


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
          <div>
            <div className="flex flex-col items-start justify-start md:flex-row gap-y-1 md:justify-between md:items-center mb-8">
              <div className="flex text-lg md:text-xl font-semibold items-center gap-y-1">
                Invoice List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full md:w-fit">
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
                  onClick={getAllInvoices}
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
                  onClick={addInvoicesHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Invoice
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
            {addInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeAddInvoicesDrawer())
                }
              >
                <InvoicesDrawer
                  closeDrawerHandler={() => dispatch(closeAddInvoicesDrawer())}
                  getAllInvoices={getAllInvoices}
                />
              </ClickMenu>
            )}

            {editInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeEditInvoicesDrawer())
                }
              >
                <InvoicesEditDrawer
                  dataId={dataId}
                  closeDrawerHandler={() => {
                    dispatch(closeEditInvoicesDrawer());
                  }}
                  getAllInvoices={getAllInvoices}
                />
              </ClickMenu>
            )}

            {showDetailsInvoicesDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeShowDetailsInvoicesDrawer())
                }
              >
                <InvoicesDetailsDrawer
                  dataId={dataId}
                  closeDrawerHandler={() =>
                    dispatch(closeShowDetailsInvoicesDrawer())
                  }
                  getAllInvoices={getAllInvoices}
                />
              </ClickMenu>
            )}

            {addPaymentsDrawerIsOpened && (
              <ClickMenu
                top={0}
                right={0}
                closeContextMenuHandler={() =>
                  dispatch(closeAddPaymentsDrawer())
                }
              >
                <PaymentsDrawer
                  dataId={dataId}
                  getAllInvoices={getAllInvoices}
                  closeDrawerHandler={() => dispatch(closeAddPaymentsDrawer())}
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
                <span className="mt-1 font-semibold text-2xl">No data found.</span>
              </div>
            )}

            {!loading && filteredData.length > 0 && (
              <div>

                {/* VIEW MODE TOGGLE BUTTONS */}
                <div className="flex justify-end gap-x-2 mb-4">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-colors duration-200 ${viewMode === "table"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                  >
                    <BiTable size={20} />
                  </button>

                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded-md transition-colors duration-200 ${viewMode === "card"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                  >
                    <BiCard size={20} />
                  </button>
                </div>

              
                {viewMode === "table" && (
                  <>
                    <TableContainer maxHeight="600px" overflowY="auto">
                      <Table
                        variant="simple"
                        {...getTableProps()}
                        className="rounded-lg shadow-md"
                      >
                        <Thead className="bg-blue-400 text-white text-lg font-semibold">
                          {headerGroups.map((hg) => (
                            <Tr {...hg.getHeaderGroupProps()}>
                              {hg.headers.map((column) => (
                                <Th
                                  className={`text-sm font-semibold text-left py-3 px-4 
                        ${column.id === "customer"
                                      ? "sticky top-0 left-[-2px] bg-blue-400"
                                      : ""
                                    } border-b-2 border-gray-200`}
                                  {...column.getHeaderProps(column.getSortByToggleProps())}
                                >
                                  <div className="flex items-center text-white">
                                    {column.render("Header")}
                                    {column.isSorted && (
                                      <span className="ml-2">
                                        {column.isSortedDesc ? <FaCaretDown /> : <FaCaretUp />}
                                      </span>
                                    )}
                                  </div>
                                </Th>
                              ))}
                              <Th className="text-sm font-semibold py-3 px-4 border-b-2 border-gray-200">
                                Actions
                              </Th>
                            </Tr>
                          ))}
                        </Thead>

                        <Tbody {...getTableBodyProps()}>
                          {page.map((row, ind) => {
                            prepareRow(row);
                            return (
                              <Tr
                                className="hover:bg-gray-200 transition-all"
                                {...row.getRowProps()}
                              >
                                {row.cells.map((cell) => (
                                  <Td
                                    className={`py-3 px-4 ${cell.column.id === "customer"
                                        ? "sticky left-[-2px] bg-[#f9fafc]"
                                        : ""
                                      }`}
                                    {...cell.getCellProps()}
                                  >
                                    {/* General cell */}
                                    {[
                                      "number",
                                      "total",
                                      "subtotal",
                                      "creator",
                                      "created_on",
                                      "customer",
                                      "startdate",
                                      "expiredate",
                                      "status",
                                      "paymentstatus",
                                    ].includes(cell.column.id) === false && cell.render("Cell")}

                                    {/* number */}
                                    {cell.column.id === "number" && <span>{ind + 1}</span>}

                                    {/* Creator */}
                                    {cell.column.id === "creator" && (
                                      <span className="text-blue-500">
                                        {row.original?.creator?.name || "Unknown"}
                                      </span>
                                    )}

                                    {/* Created Date */}
                                    {cell.column.id === "created_on" && (
                                      <span>
                                        {row.original?.createdAt
                                          ? moment(row.original.createdAt).format("DD/MM/YYYY")
                                          : "--"}
                                      </span>
                                    )}

                                    {/* Customer SAFE */}
                                    {cell.column.id === "customer" && (
                                      <span>
                                        {row.original?.customer?.company
                                          ? row.original.customer.company.companyname
                                          : row.original?.customer?.people
                                            ? `${row.original.customer.people.firstname || ""} ${row.original.customer.people.lastname || ""
                                            }`
                                            : "Unknown"}
                                      </span>
                                    )}

                                    {/* Dates */}
                                    {cell.column.id === "startdate" && (
                                      <span>
                                        {row.original?.startdate
                                          ? moment(row.original.startdate).format("DD/MM/YYYY")
                                          : "--"}
                                      </span>
                                    )}

                                    {cell.column.id === "expiredate" && (
                                      <span>
                                        {row.original?.expiredate
                                          ? moment(row.original.expiredate).format("DD/MM/YYYY")
                                          : "--"}
                                      </span>
                                    )}

                                    {/* Amount */}
                                    {cell.column.id === "total" && (
                                      <span>&#8377;{row.original?.total || 0}</span>
                                    )}

                                    {cell.column.id === "subtotal" && (
                                      <span>&#8377;{row.original?.subtotal || 0}</span>
                                    )}

                                    {/* Status */}
                                    {cell.column.id === "status" && (
                                      <span
                                        className="text-sm rounded-md px-3 py-1"
                                        style={{
                                          backgroundColor:
                                            statusStyles[
                                              row.original?.status?.toLowerCase() || "default"
                                            ]?.bg,
                                          color:
                                            statusStyles[
                                              row.original?.status?.toLowerCase() || "default"
                                            ]?.text,
                                        }}
                                      >
                                        {row.original?.status || "--"}
                                      </span>
                                    )}

                                    {/* Payment Status */}
                                    {cell.column.id === "paymentstatus" && (
                                      <span
                                        className="text-sm rounded-md px-3 py-1"
                                        style={{
                                          backgroundColor:
                                            paymentStatusStyles[
                                              row.original?.paymentstatus?.toLowerCase() ||
                                              "default"
                                            ]?.bg,
                                          color:
                                            paymentStatusStyles[
                                              row.original?.paymentstatus?.toLowerCase() ||
                                              "default"
                                            ]?.text,
                                        }}
                                      >
                                        {row.original?.paymentstatus || "--"}
                                      </span>
                                    )}
                                  </Td>
                                ))}

                                {/* Actions */}
                                <Td className="flex gap-x-3 py-3 px-4">
                                  <MdDownload
                                    className="hover:scale-110 text-green-500"
                                    size={20}
                                    onClick={() =>
                                      row.original?._id && downloadHandler(row.original._id)
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
                                      row.original?._id && editHandler(row.original._id)
                                    }
                                  />

                                  <MdPayment
                                    className="hover:scale-110 text-red-500"
                                    size={20}
                                    onClick={() =>
                                      row.original?._id && paymentHandler(row.original._id)
                                    }
                                  />
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    {/* Pagination */}
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

                
                {viewMode === "card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {page.map((row) => {
                      prepareRow(row);
                      const item = row.original;

                      return (
                        <div
                          key={item?._id}
                          className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                          {/* Title */}
                          <div className="font-semibold text-xl text-gray-800 mb-2">
                            {item?.customer?.company
                              ? item.customer.company.companyname
                              : item?.customer?.people
                                ? `${item.customer.people.firstname} ${item.customer.people.lastname || ""
                                }`
                                : "No Name"}
                          </div>

                          {/* Description */}
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {item?.description
                              ? item.description.length > 140
                                ? item.description.substring(0, 140) + "..."
                                : item.description
                              : "No description available."}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 text-xs text-gray-500">
                            Created by{" "}
                            <span className="text-blue-600 font-medium">
                              {item?.creator?.name || "Unknown"}
                            </span>{" "}
                            on{" "}
                            {item?.createdAt
                              ? moment(item.createdAt).format("DD/MM/YYYY")
                              : "--"}
                          </div>

                          {/* CARD ACTION BUTTONS */}
                          <div className="flex justify-center space-x-8 border-t pt-3 mt-4">
                            <button
                              onClick={() => item?._id && showDetailsHandler(item._id)}
                              className="p-2 rounded-full hover:bg-blue-50 transition"
                            >
                              <MdOutlineVisibility
                                size={22}
                                className="text-blue-600 hover:text-blue-800"
                              />
                            </button>

                            <button
                              onClick={() => item?._id && editHandler(item._id)}
                              className="p-2 rounded-full hover:bg-yellow-50 transition"
                            >
                              <MdEdit
                                size={22}
                                className="text-yellow-600 hover:text-yellow-800"
                              />
                            </button>

                            <button
                              onClick={() => item?._id && paymentHandler(item._id)}
                              className="p-2 rounded-full hover:bg-red-50 transition"
                            >
                              <MdPayment
                                size={22}
                                className="text-red-600 hover:text-red-800"
                              />
                            </button>
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

export default Invoices;
