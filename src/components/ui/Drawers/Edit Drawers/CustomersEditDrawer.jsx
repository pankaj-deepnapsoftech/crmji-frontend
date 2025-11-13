import {
  Button,
  FormControl,
  FormHelperText,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import Loading from "../../Loading";
import Select from "react-select";
import { useSelector } from "react-redux";

const CustomersEditDrawer = ({
  dataId: id,
  closeDrawerHandler,
  fetchAllCustomers,
}) => {
  const [cookies] = useCookies();
  const [isLoading, setIsLoading] = useState(false);

  const [statusId, setStatusId] = useState();
  const [statusOptions, setStatusOptions] = useState([]);
  const [customStatus, setCustomStatus] = useState("");
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const auth = useSelector((state) => state.auth);
  const STATUS_LIMIT = 10;

  const fetchStatuses = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "status/all-statuses", {
        method: "POST",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      const formattedOptions = data.statuses.map((status) => ({
        value: status.name,
        label: status.name,
        id: status._id,
      }));

      setStatusOptions((prevOptions) => {
        if (!statusId?.value) {
          return formattedOptions;
        }

        const hasMatch = formattedOptions.some((option) => {
          return (
            option.value.toLowerCase() === statusId.value.toLowerCase() ||
            (statusId.id && option.id === statusId.id)
          );
        });

        if (hasMatch) {
          return formattedOptions;
        }

        return [
          ...formattedOptions,
          {
            value: statusId.value,
            label: statusId.value,
            id: statusId.id,
          },
        ];
      });
      setStatusId((prev) => {
        if (!prev?.value) return prev;
        const match = formattedOptions.find((option) => {
          return (
            option.value.toLowerCase() === prev.value.toLowerCase() ||
            option.id === prev.id
          );
        });
        return match || prev;
      });
    } catch (err) {
      setStatusOptions((prevOptions) => {
        if (!statusId?.value) {
          return prevOptions;
        }

        const hasMatch = prevOptions.some((option) => {
          return (
            option.value.toLowerCase() === statusId.value.toLowerCase() ||
            (statusId.id && option.id === statusId.id)
          );
        });

        if (hasMatch) {
          return prevOptions;
        }

        return [
          ...prevOptions,
          {
            value: statusId.value,
            label: statusId.value,
            id: statusId.id,
          },
        ];
      });
      if (err?.message) {
        toast.error(err.message);
      }
    }
  };

  const fetchCustomerDetails = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseUrl + "customer/customer-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          customerId: id,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      setStatusId({ value: data.customer.status, label: data.customer.status });

      setIsLoading(false);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const editCustomersHandler = async (e) => {
    e.preventDefault();

    if (!statusId?.value) {
      toast.error("Status not selected");
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "customer/edit-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          customerId: id,
          status: statusId?.value,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      closeDrawerHandler();
      fetchAllCustomers();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addStatusHandler = async (e) => {
    e.preventDefault();
    const newStatus = customStatus.trim();

    if (!newStatus) {
      toast.error("Status name cannot be empty");
      return;
    }

    const uniqueCount = new Set(
      statusOptions.map((option) => option.value.toLowerCase())
    ).size;

    if (uniqueCount >= STATUS_LIMIT) {
      toast.error(`Maximum ${STATUS_LIMIT} status options allowed`);
      return;
    }

    const alreadyExists = statusOptions.some(
      (option) => option.value.toLowerCase() === newStatus.toLowerCase()
    );

    if (alreadyExists) {
      toast.error("Status already exists");
      return;
    }

    try {
      setIsAddingStatus(true);
      const baseURL = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(baseURL + "status/create-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          name: newStatus,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      const option = {
        value: data.status.name,
        label: data.status.name,
        id: data.status._id,
      };
      setStatusOptions((prev) => [...prev, option]);
      setStatusId(option);
      toast.success(data.message || "Status added successfully");
      setCustomStatus("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAddingStatus(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (!statusId?.value) return;
    setStatusOptions((prev) => {
      if (
        prev.some(
          (option) => option.value.toLowerCase() === statusId.value.toLowerCase()
        )
      ) {
        return prev;
      }
      return [
        ...prev,
        {
          value: statusId.value,
          label: statusId.value,
          id: statusId.id,
        },
      ];
    });
  }, [statusId?.value]);

  const deleteStatusHandler = async (status) => {
    if (!status?.id) {
      toast.error("Unable to delete this status.");
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(
        `${baseURL}status/delete-status/${status.id}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${cookies?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setStatusOptions((prev) =>
        prev.filter((option) => option.id !== status.id)
      );

      if (statusId?.id === status.id) {
        setStatusId(undefined);
      }

      toast.success(data.message || "Status deleted successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

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
        Customer
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-3xl bg-blue-200 font-bold py-5 text-center mb-8 border-y border-gray-200  rounded-md shadow-md">
          Edit Customer
        </h2>

        {isLoading && <Loading />}
        {!isLoading && (
          <form onSubmit={editCustomersHandler}>
            <div>
              <div className="mt-2 mb-5">
                <label className="font-bold">Status</label>
                <Select
                  className="rounded mt-2"
                  options={statusOptions}
                  placeholder="Select status"
                  value={statusId}
                  onChange={(d) => {
                    setStatusId(d);
                  }}
                  isSearchable={true}
                />
                {["Super Admin", "Admin"].includes(auth?.role) && (
                  <FormControl mt={3}>
                    <div className="flex gap-2">
                      <Input
                        value={customStatus}
                        onChange={(event) => setCustomStatus(event.target.value)}
                        placeholder="Add new status"
                        maxLength={50}
                      isDisabled={
                        isAddingStatus ||
                        new Set(
                          statusOptions.map((option) =>
                            option.value.toLowerCase()
                          )
                        ).size >= STATUS_LIMIT
                      }
                      />
                      <Button
                        onClick={addStatusHandler}
                      isDisabled={
                        isAddingStatus ||
                        new Set(
                          statusOptions.map((option) =>
                            option.value.toLowerCase()
                          )
                        ).size >= STATUS_LIMIT
                      }
                        isLoading={isAddingStatus}
                        loadingText="Adding"
                        colorScheme="blue"
                      >
                        Add
                      </Button>
                    </div>
                    <FormHelperText>
                      {new Set(
                        statusOptions.map((option) =>
                          option.value.toLowerCase()
                        )
                      ).size >= STATUS_LIMIT
                        ? `You can only have up to ${STATUS_LIMIT} status options.`
                        : `You can add ${
                            STATUS_LIMIT -
                            new Set(
                              statusOptions.map((option) =>
                                option.value.toLowerCase()
                              )
                            ).size
                          } more status${
                            STATUS_LIMIT -
                              new Set(
                                statusOptions.map((option) =>
                                  option.value.toLowerCase()
                                )
                              ).size ===
                            1
                              ? ""
                              : "es"
                          }.`}
                    </FormHelperText>
                    {statusOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {statusOptions.map((option) => (
                          <Tag
                            size="md"
                            key={option.id || option.value}
                            borderRadius="full"
                            colorScheme="blue"
                          >
                            <TagLabel>{option.label}</TagLabel>
                            {option.id && (
                              <TagCloseButton
                                onClick={() => deleteStatusHandler(option)}
                                aria-label={`Delete ${option.label}`}
                              />
                            )}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </FormControl>
                )}
              </div>
            </div>
            {/* <FormControl className="mt-3 mb-5" isRequired>
            <FormLabel fontWeight="bold">Type</FormLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Select type"
            >
              <option value="People">People</option>
              <option value="Company">Company</option>
            </Select>
          </FormControl>
          {(showSelectPeoples || type === "") && (
            <FormControl className="mt-2 mb-5">
              <FormLabel fontWeight="bold">People</FormLabel>
              <Select
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="Select person"
              >
                {peoples.map((people) => (
                  <option key={people._id} value={people._id}>
                    {people.firstname + " " + people.lastname}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          {(showSelectCompanies || type === "") && (
            <FormControl className="mt-2 mb-5">
              <FormLabel fontWeight="bold">Company</FormLabel>
              <Select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Select company"
              >
                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )} */}
            <Button
              type="submit"
              className="mt-1 w-full py-3 text-white font-bold rounded-lg"
              colorScheme="blue"
            >
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomersEditDrawer;
