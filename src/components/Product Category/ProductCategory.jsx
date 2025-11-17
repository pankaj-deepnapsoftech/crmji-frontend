import { Button, Select, useDisclosure } from "@chakra-ui/react";
import {
  MdOutlineRefresh,
  MdArrowBack,
  MdEdit,
  MdDeleteOutline,
  MdOutlineVisibility,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  closeAddProductsCategoryDrawer,
  closeEditProductsCategoryDrawer,
  closeShowDetailsProductsCategoryDrawer,
  openAddProductsCategoryDrawer,
  openEditProductsCategoryDrawer,
  openShowDetailsProductsCategoryDrawer,
} from "../../redux/reducers/misc";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../ui/Loading";
import ProductCategoryEditDrawer from "../ui/Drawers/Edit Drawers/ProductCategoryEditDrawer";
import ProductCategoryDetailsDrawer from "../ui/Drawers/Details Drawers/ProductCategoryDetailsDrawer";
import ClickMenu from "../ui/ClickMenu";
import { FcDatabase } from "react-icons/fc";
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
import ProductsCategoryDrawer from "../ui/Drawers/Add Drawers/ProductsCategoryDrawer";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import moment from "moment";
import { checkAccess } from "../../utils/checkAccess";
import { Link } from "react-router-dom";
import { BiTable, BiCard } from "react-icons/bi";


const columns = [
  {
    Header: "Created By",
    accessor: "creator",
  },
  {
    Header: "Created On",
    accessor: "created_on",
  },
  {
    Header: "Name",
    accessor: "categoryname",
  },
  {
    Header: "Description",
    accessor: "description",
  },
  // {
  //   Header: "Color",
  //   accessor: "color",
  // },
  // {
  //   Header: "Enabled",
  //   accessor: "enabled",
  // },
];

const ProductCategory = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");

  const dispatch = useDispatch();

  const [categoryDeleteId, setCategoryDeleteId] = useState();
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
    addProductsCategoryDrawerIsOpened,
    editProductsCategoryDrawerIsOpened,
    showDetailsProductsCategoryDrawerIsOpened,
  } = useSelector((state) => state.misc);
  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "category");

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const editHandler = (id) => {
    setDataId(id);
    dispatch(openEditProductsCategoryDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsProductsCategoryDrawer());
  };

  const confirmDeleteHandler = async () => {
    onOpen();
  };

  const deleteHandler = async () => {
    if (!categoryDeleteId) {
      return;
    }
    try {
      const response = await fetch(baseURL + "category/delete-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          categoryId: categoryDeleteId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      fetchAllProductsCategory();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      onClose();
    }
  };

  const fetchAllProductsCategory = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "category/all-categories", {
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

      setData(data.categories);
      setFilteredData(data.categories);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  const addProductsCategoryHandler = () => {
    dispatch(openAddProductsCategoryDrawer());
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllProductsCategory();
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.categoryname?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.description?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.color?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.creator?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          (d?.createdAt &&
            new Date(d?.createdAt)
              ?.toISOString()
              ?.substring(0, 10)
              ?.split("-")
              .reverse()
              .join("")
              ?.includes(searchKey.replaceAll("/", "")))
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
          <>
            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete Product Category
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure, Deleting a Product Category will also delete
                    its corresponding Products?{" "}
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
            <div className="flex flex-col items-start justify-start lg:flex-row gap-y-1 md:justify-between lg:items-center mb-8">
              <div className="flex text-lg md:text-xl font-semibold items-center gap-y-1">
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                Product Category List
              </div>

              <div className="mt-2 lg:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full lg:w-fit">
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
                  onClick={fetchAllProductsCategory}
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
                  onClick={addProductsCategoryHandler}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New Product Category
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

            <div>
              {addProductsCategoryDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeAddProductsCategoryDrawer())
                  }
                >
                  <ProductsCategoryDrawer
                    closeDrawerHandler={() =>
                      dispatch(closeAddProductsCategoryDrawer())
                    }
                    fetchAllProductsCategory={fetchAllProductsCategory}
                  />
                </ClickMenu>
              )}
              {editProductsCategoryDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeEditProductsCategoryDrawer())
                  }
                >
                  <ProductCategoryEditDrawer
                    dataId={dataId}
                    fetchAllProductsCategory={fetchAllProductsCategory}
                    closeDrawerHandler={() =>
                      dispatch(closeEditProductsCategoryDrawer())
                    }
                  />
                </ClickMenu>
              )}

              {showDetailsProductsCategoryDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowDetailsProductsCategoryDrawer())
                  }
                >
                  <ProductCategoryDetailsDrawer
                    dataId={dataId}
                    closeDrawerHandler={() =>
                      dispatch(closeShowDetailsProductsCategoryDrawer())
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

                {/* VIEW MODE TOGGLE */}
                <div className="flex justify-end gap-x-2 mb-4">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    <BiTable size={20} />
                  </button>

                  <button
                    onClick={() => setViewMode("card")}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    <BiCard size={20} />
                  </button>
                </div>

                {/* TABLE VIEW */}
                {viewMode === "table" && (
                  <>
                    <TableContainer
                      maxHeight="600px"
                      overflowY="auto"
                      className="shadow-lg rounded-lg bg-white"
                    >
                      <Table variant="simple" {...getTableProps()}>
                        <Thead className="bg-blue-400 text-lg font-semibold text-gray-800">
                          {headerGroups.map((hg) => (
                            <Tr {...hg.getHeaderGroupProps()}>
                              {hg.headers.map((column) => (
                                <Th
                                  className="bg-blue-400 text-white px-4 py-3"
                                  {...column.getHeaderProps(column.getSortByToggleProps())}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{column.render("Header")}</span>
                                    {column.isSorted ? (
                                      column.isSortedDesc ? <FaCaretDown /> : <FaCaretUp />
                                    ) : ""}
                                  </div>
                                </Th>
                              ))}
                              <Th className="bg-blue-400 text-white">Actions</Th>
                            </Tr>
                          ))}
                        </Thead>

                        <Tbody {...getTableBodyProps()}>
                          {page.map((row) => {
                            prepareRow(row);
                            return (
                              <Tr {...row.getRowProps()} className="hover:bg-gray-200">
                                {row.cells.map((cell) => (
                                  <Td
                                    {...cell.getCellProps()}
                                    className="px-4 py-3 text-sm font-medium text-gray-700"
                                  >
                                    {cell.column.id === "description"
                                      ? (row.original.description.length > 50
                                          ? row.original.description.substring(0, 50) + "..."
                                          : row.original.description)
                                      : cell.column.id === "creator"
                                      ? row.original.creator?.name
                                      : cell.column.id === "created_on"
                                      ? moment(row.original.createdAt).format("DD/MM/YYYY")
                                      : cell.render("Cell")}
                                  </Td>
                                ))}

                                <Td className="flex gap-x-3 py-2 justify-center">
                                  <MdOutlineVisibility
                                    className="text-blue-600 cursor-pointer hover:scale-110"
                                    onClick={() => showDetailsHandler(row.original._id)}
                                    size={20}
                                  />
                                  <MdEdit
                                    className="text-yellow-600 cursor-pointer hover:scale-110"
                                    onClick={() => editHandler(row.original._id)}
                                    size={20}
                                  />
                                  <MdDeleteOutline
                                    className="text-red-600 cursor-pointer hover:scale-110"
                                    onClick={() => {
                                      setCategoryDeleteId(row.original._id);
                                      confirmDeleteHandler();
                                    }}
                                    size={20}
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

                      <span className="mx-3">{pageIndex + 1} of {pageCount}</span>

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

                {/* CARD VIEW */}
                {viewMode === "card" && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {page.map((row) => {
      prepareRow(row);
      const item = row.original;

      return (
        <div
          key={item._id}
          className="border rounded-2xl p-5 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          {/* Title */}
          <div className="font-semibold text-xl text-gray-800 mb-2">
            {item.categoryname}
          </div>

          {/* Description */}
          <div className="text-sm text-gray-600 leading-relaxed">
            {item.description?.length > 140
              ? item.description.substring(0, 140) + "..."
              : item.description}
          </div>

          {/* Footer Info */}
          <div className="mt-4 text-xs text-gray-500">
            Created by{" "}
            <span className="text-blue-600 font-medium">
              {item.creator?.name || "Unknown"}
            </span>{" "}
            on {moment(item.createdAt).format("DD/MM/YYYY")}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-10 border-t pt-3 mt-4">
            <button
              onClick={() => showDetailsHandler(item._id)}
              className="p-2 rounded-full hover:bg-blue-50 transition"
            >
              <MdOutlineVisibility
                size={22}
                className="text-blue-600 hover:text-blue-800 transition"
              />
            </button>

            <button
              onClick={() => editHandler(item._id)}
              className="p-2 rounded-full hover:bg-yellow-50 transition"
            >
              <MdEdit
                size={22}
                className="text-yellow-600 hover:text-yellow-800 transition"
              />
            </button>

            <button
              onClick={() => {
                setCategoryDeleteId(item._id);
                confirmDeleteHandler();
              }}
              className="p-2 rounded-full hover:bg-red-50 transition"
            >
              <MdDeleteOutline
                size={22}
                className="text-red-600 hover:text-red-800 transition"
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
        </div>
      )}
    </>
  );
};

export default ProductCategory;
