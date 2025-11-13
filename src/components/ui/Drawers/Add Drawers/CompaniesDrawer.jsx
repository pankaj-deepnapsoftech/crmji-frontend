import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { BiX } from "react-icons/bi";
import { MdAdd, MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { closeAddCompaniesDrawer } from "../../../../redux/reducers/misc";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

const CompaniesDrawer = ({ fetchAllCompanies, closeDrawerHandler }) => {
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState(""); // Fixed typo: setDestination -> setDesignation
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [additionalContacts, setAdditionalContacts] = useState([]); // Only 0 or 1 item
  const [statusOptions, setStatusOptions] = useState([]);
  const [customStatus, setCustomStatus] = useState("");
  const [cookies] = useCookies();

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  // Add only if no contact exists
  const addAdditionalContact = () => {
    if (additionalContacts.length === 0) {
      setAdditionalContacts([
        { name: "", phone: "", designation: "", email: "" }
      ]);
    }
  };

  // Remove the only contact
  const removeAdditionalContact = () => {
    setAdditionalContacts([]);
  };

  // Update the single contact
  const updateAdditionalContact = (field, value) => {
    setAdditionalContacts(prev => {
      const updated = [...prev];
      updated[0][field] = value;
      return updated;
    });
  };

  const addCompanyHandler = async (e) => {
    e.preventDefault();

    // Validation
    if (phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (gstNo && gstNo.length !== 15) {
      toast.error("GST number must be exactly 15 characters");
      return;
    }

    if (gstNo && !/^[A-Z0-9]{15}$/.test(gstNo)) {
      toast.error("GST number must contain only capital letters and numbers");
      return;
    }

    // Additional validation: Ensure required fields are filled
    if (!companyName.trim()) {
      toast.error("Company Name is required");
      return;
    }
    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!contactPersonName.trim()) {
      toast.error("Contact Person Name is required");
      return;
    }
    if (!designation.trim()) {
      toast.error("Designation is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    // If additional contact exists, validate its fields
    if (additionalContacts.length > 0) {
      const contact = additionalContacts[0];
      if (contact.phone && contact.phone.length !== 10) {
        toast.error("Additional Contact Phone must be exactly 10 digits");
        return;
      }
    }

    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;
      console.log("this isthe baseurl :: ", process.env.REACT_APP_BACKEND_URL)

      const response = await fetch(baseURL + "company/create-company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${cookies?.access_token}`,
        },
        body: JSON.stringify({
          companyname: companyName.trim(),
          address: address.trim(),
          contactPersonName: contactPersonName.trim(),
          phone: phone,
          designation: designation.trim(),
          email: email.trim(),
          website: website.trim(),
          gst_no: gstNo,
          status: status,
          additionalContacts: additionalContacts.map(contact => ({
            name: contact.name.trim(),
            phone: contact.phone,
            designation: contact.designation.trim(),
            email: contact.email.trim()
          })),
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      closeDrawerHandler();
      fetchAllCompanies();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const baseURL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(baseURL + "company-status/all", {
        method: "GET",
        headers: {
          authorization: `Bearer ${cookies?.access_token}`,
        },
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setStatusOptions(data.data.map((s) => ({ value: s.name, label: s.name })));
      } else {
        setStatusOptions([]);
      }
    } catch (err) {
      setStatusOptions([]);
    }
  };

  const addCompanyStatus = async (statusName) => {
    const name = statusName?.trim();
    if (!name) throw new Error("Status name is required");
    const exists = statusOptions.some((o) => o.value.toLowerCase() === name.toLowerCase());
    if (exists) throw new Error("Status already exists");

    const baseURL = process.env.REACT_APP_BACKEND_URL;
    const response = await fetch(baseURL + "company-status/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${cookies?.access_token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Failed to add status");
    return data;
  };

  useEffect(() => {
    fetchStatusOptions();
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
        Corporate
      </h1>

      <div className="mt-8 px-5">
        <h2 className="text-2xl font-bold py-5 text-center mb-6 border-y bg-blue-200 rounded-lg shadow-md">
          Add New Corporate
        </h2>

        <form onSubmit={addCompanyHandler} className="space-y-5">
          {/* Company Name */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Company Name
            </FormLabel>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter Company Name"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* Address */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Address
            </FormLabel>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Company Address"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </FormControl>

          {/* Contact Person Name */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Contact Person Name
            </FormLabel>
            <Input
              value={contactPersonName}
              onChange={(e) => setContactPersonName(e.target.value)}
              placeholder="Enter Contact Person Name"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* Phone Number */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Phone Number
            </FormLabel>
            <Input
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhone(value);
              }}
              placeholder="Enter 10-digit Phone Number"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
              maxLength={10}
            />
          </FormControl>

          {/* Designation */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Designation of Contact Person
            </FormLabel>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Enter Designation"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* Email */}
          <FormControl isRequired>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Email
            </FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter Email Address"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* === Additional Contact (Only One) === */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontWeight="bold" className="text-[#4B5563]">
                Additional Contact Information
              </Text>
              {additionalContacts.length === 0 && (
                <Button
                  leftIcon={<MdAdd />}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  onClick={addAdditionalContact}
                >
                  Add Contact
                </Button>
              )}
            </HStack>

            {/* Show only if one contact exists */}
            {additionalContacts.length > 0 && (
              <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" mb={3}>
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="semibold">Additional Contact</Text>
                  <IconButton
                    icon={<MdDelete />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={removeAdditionalContact}
                  />
                </HStack>

                <VStack spacing={3}>
                  <HStack spacing={3} width="100%">
                    <FormControl flex={1}>
                      <FormLabel fontSize="sm">Name</FormLabel>
                      <Input
                        value={additionalContacts[0].name}
                        onChange={(e) => updateAdditionalContact('name', e.target.value)}
                        placeholder="Enter Name"
                        size="sm"
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="sm">Phone</FormLabel>
                      <Input
                        value={additionalContacts[0].phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          updateAdditionalContact('phone', value);
                        }}
                        placeholder="10-digit Phone"
                        size="sm"
                        maxLength={10}
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={3} width="100%">
                    <FormControl flex={1}>
                      <FormLabel fontSize="sm">Designation</FormLabel>
                      <Input
                        value={additionalContacts[0].designation}
                        onChange={(e) => updateAdditionalContact('designation', e.target.value)}
                        placeholder="Enter Designation"
                        size="sm"
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="sm">Email</FormLabel>
                      <Input
                        value={additionalContacts[0].email}
                        onChange={(e) => updateAdditionalContact('email', e.target.value)}
                        placeholder="Enter Email"
                        size="sm"
                        type="email"
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </Box>
            )}
          </Box>

          {/* GST Number */}
          <FormControl>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              GST Number
            </FormLabel>
            <Input
              value={gstNo}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                setGstNo(value);
              }}
              placeholder="Enter 15-character GST Number"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
              maxLength={15}
            />
          </FormControl>

          {/* Status */}
          <FormControl>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Status
            </FormLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Select status"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {(auth?.role === "Super Admin") && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  placeholder="Add more status"
                  disabled={statusOptions.length >= 10}
                />
                <Button
                  onClick={async (e) => {
                    e.preventDefault();
                    const val = customStatus.trim();
                    if (!val) return;

                    if (statusOptions.length >= 10) {
                      toast.error("Maximum 10 status options allowed");
                      return;
                    }

                    if (!statusOptions.some((o) => o.value.toLowerCase() === val.toLowerCase())) {
                      try {
                        await addCompanyStatus(val);
                        await fetchStatusOptions();
                        setStatus(val);
                        toast.success("Status added successfully");
                      } catch (err) {
                        toast.error(err.message);
                      }
                    } else {
                      toast.error("Status already exists");
                    }
                    setCustomStatus("");
                  }}
                  disabled={statusOptions.length >= 10}
                >
                  Add
                </Button>
              </div>
            )}
          </FormControl>

          {/* Website */}
          <FormControl>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Website
            </FormLabel>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Enter Website URL"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
            />
          </FormControl>

          {/* Comment */}
          <FormControl>
            <FormLabel fontWeight="bold" className="text-[#4B5563]">
              Comment
            </FormLabel>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any comments or remarks"
              className="rounded mt-2 border p-3 focus:ring-2 focus:ring-blue-400"
              rows={3}
            />
          </FormControl>

          {/* Submit Button */}
          <Button
            type="submit"
            className="mt-1 w-full py-3 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300"
            colorScheme="blue"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompaniesDrawer;