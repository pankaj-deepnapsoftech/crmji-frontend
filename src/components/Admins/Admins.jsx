import {
  Button,
  Select,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  closeAddEmployeeDrawer,
  closeEditAdminsDrawer,
  closeEditCompaniesDrawer,
  closeShowDetailsAdminsDrawer,
  openAddCompaniesDrawer,
  openAddEmployeeDrawer,
  openEditAdminsDrawer,
  openShowDetailsAdminsDrawer,
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
import CompaniesDrawer from "../ui/Drawers/Add Drawers/CompaniesDrawer";
import AdminsDetailsDrawer from "../ui/Drawers/Details Drawers/AdminsDetailsDrawer";
import AdminsEditDrawer from "../ui/Drawers/Edit Drawers/AdminsEditDrawer";
import AdminDeleteAlert from "../ui/AdminDeleteAlert";
import { checkAccess } from "../../utils/checkAccess";
import { Link } from "react-router-dom";
import EmployeeDrawer from "../ui/Drawers/Add Drawers/EmployeeDrawer";
import { BiCard, BiTable } from "react-icons/bi";

const columns = [
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "User ID",
    accessor: "employeeId",
    Cell: ({ row }) => {
      // Extract the number part from the original employeeId (last 3 digits)
      const originalId = row.original.employeeId || "";
      const numberPart = originalId.slice(-3) || "001";

      return `UI${numberPart}`;
    },
  },
  {
    Header: "Phone",
    accessor: "phone",
  },
  {
    Header: "Verification Status",
    accessor: "verified",
  },
];

const Admins = () => {
  const [cookies] = useCookies();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dataId, setDataId] = useState();
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState("");

  const [deleteEmployeeSelectedId, setDeleteEmployeeSelectedId] = useState();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const dispatch = useDispatch();
  const { role, ...auth } = useSelector((state) => state.auth);
  const { isAllowed, msg } = checkAccess(auth, "admin");

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
    addEmployeeDrawerIsOpened,
    editAdminsDrawerIsOpened,
    showDetailsAdminsDrawerIsOpened,
  } = useSelector((state) => state.misc);

  const baseURL = process.env.REACT_APP_BACKEND_URL;

  const fetchAllAdmins = async () => {
    setSearchKey("");
    setData([]);
    setFilteredData([]);
    setLoading(true);
    try {
      const response = await fetch(baseURL + "admin/all-admins", {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setData(data.admins);
      setFilteredData(data.admins);
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
    dispatch(openEditAdminsDrawer());
  };

  const showDetailsHandler = (id) => {
    setDataId(id);
    dispatch(openShowDetailsAdminsDrawer());
  };

  useEffect(() => {
    if (isAllowed) {
      fetchAllAdmins();
    }
  }, []);

  useEffect(() => {
    if (searchKey.trim() !== "") {
      const searchedData = data.filter(
        (d) =>
          d?.name?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.employeeId?.toLowerCase().includes(searchKey.toLowerCase()) ||
          d?.phone?.includes(searchKey) ||
          d?.email?.toLowerCase().includes(searchKey.toLowerCase())
      );
      setFilteredData(searchedData);
    } else {
      setFilteredData(data);
    }
  }, [searchKey]);

  return (
    <>
      <AdminDeleteAlert
        fetchAllAdmins={fetchAllAdmins}
        deleteEmployeeSelectedId={deleteEmployeeSelectedId}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        cancelRef={cancelRef}
      />

      {addEmployeeDrawerIsOpened && (
        <ClickMenu
          top={0}
          right={0}
          closeContextMenuHandler={() => dispatch(closeAddEmployeeDrawer())}
        >
          <EmployeeDrawer
            fetchAllEmployees={fetchAllAdmins}
            closeDrawerHandler={() => dispatch(closeAddEmployeeDrawer())}
          />
        </ClickMenu>
      )}

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
                {/* <span className="mr-2">
                  <MdArrowBack />
                </span> */}
                Users List
              </div>

              <div className="mt-2 md:mt-0 flex flex-wrap gap-y-1 gap-x-2 w-full md:w-fit">
                <textarea
                  className="rounded-[10px] w-full md:flex-1 px-2 py-2 md:px-3 md:py-2 text-sm focus:outline-[#1640d6] hover:outline:[#1640d6] border resize-none"
                  rows="1"
                  placeholder="Search"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
                <Button
                  fontSize={{ base: "14px", md: "14px" }}
                  paddingX={{ base: "10px", md: "12px" }}
                  paddingY={{ base: "0", md: "3px" }}
                  width={{ base: "-webkit-fill-available", md: 100 }}
                  onClick={fetchAllAdmins}
                  leftIcon={<MdOutlineRefresh />}
                  color="#1640d6"
                  borderColor="#1640d6"
                  variant="outline"
                >
                  Refresh
                </Button>
                <Button
                  onClick={() => dispatch(openAddEmployeeDrawer())}
                  color="white"
                  backgroundColor="#1640d6"
                >
                  Add New User
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
              <button>
                <BiTable />
              </button>
              <button>
                <BiCard />
              </button>
            </div>

            <div>
              {editAdminsDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeEditAdminsDrawer())
                  }
                >
                  <AdminsEditDrawer
                    fetchAllAdmins={fetchAllAdmins}
                    dataId={dataId}
                    closeDrawerHandler={() => {
                      dispatch(closeEditAdminsDrawer());
                      fetchAllAdmins();
                    }}
                  />
                </ClickMenu>
              )}

              {showDetailsAdminsDrawerIsOpened && (
                <ClickMenu
                  top={0}
                  right={0}
                  closeContextMenuHandler={() =>
                    dispatch(closeShowDetailsAdminsDrawer())
                  }
                >
                  <AdminsDetailsDrawer
                    dataId={dataId}
                    closeDrawerHandler={() =>
                      dispatch(closeShowDetailsAdminsDrawer())
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
                  <TableContainer
                    maxHeight="600px"
                    overflowY="auto"
                    className="shadow-lg rounded-lg bg-white"
                  >
                    <Table variant="striped" {...getTableProps()}>
                      <Thead className="bg-blue-400 text-lg font-semibold text-gray-800 sticky top-0 z-10">
                        {headerGroups.map((hg) => (
                          <Tr
                            {...hg.getHeaderGroupProps()}
                            className="shadow-md"
                          >
                            {hg.headers.map((column) => (
                              <Th
                                className={`
                                text-transform: capitalize
                                font-size: 15px
                                font-weight: 700
                                border-b-2 border-gray-300
                                p-3
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
                            ))}
                            <Th className="p-3 text-center bg-blue-400 text-white sticky top-0 z-10">
                              <p className="text-white">Actions</p>
                            </Th>
                          </Tr>
                        ))}
                      </Thead>

                      <Tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                          prepareRow(row);
                          return (
                            <Tr
                              className="hover:bg-gray-100 hover:cursor-pointer text-base text-gray-700 transition duration-300 ease-in-out"
                              {...row.getRowProps()}
                            >
                              {row.cells.map((cell) => (
                                <Td
                                  className={`
                  ${
                    cell.column.id === "name" ? "sticky top-0 left-[-2px] " : ""
                  }
                  p-3 text-center
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
                                      {moment(row.original.createdAt).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </span>
                                  )}
                                </Td>
                              ))}
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
                                        showDetailsHandler(row.original?._id)
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
                                        onOpen();
                                        setDeleteEmployeeSelectedId(
                                          row.original?._id
                                        );
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

                  <div className="border rounded-sm p-2 mt-4 w-96">
                    <div className="flex justify-between items-center">
                      <div className="bg-yellow-500 text-yellow-800 text-center rounded-md w-20">
                        UI001
                      </div>
                      <div className="bg-green-500 text-green-800 text-center rounded-md w-20">
                        Verfied
                      </div>
                    </div>
                    <div className="my-1">Name: Deepak Sharma</div>
                    <div className="my-1">Designation: Office Assistant</div>
                    <div className="my-1">Phone: 8851220023</div>
                    <div className="my-1">Email: dsharmaportal@gmail.com</div>
                    <div className="bg-blue-500 text-blue-800 text-center rounded-md w-20">
                      Verfied
                    </div>
                  </div>

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

export default Admins;
