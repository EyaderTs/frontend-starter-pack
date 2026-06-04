import {
  SaveOutlined,
  DeleteOutlined,
  RollbackOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  DeleteFilled,
  PictureOutlined,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Collapse,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Row,
  Col,
  Upload,
  Avatar,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import type { RcFile } from "antd/es/upload";
import ImgCrop from "antd-img-crop";
import { School } from "@/models/school-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useArchiveSchoolMutation,
  useDeleteSchoolMutation,
  useLazyGetSchoolQuery,
  useRestoreSchoolMutation,
} from "@/features/school/store/school.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import countryJson from "@/shared/constants/country-json.json";
import districtsJson from "@/shared/constants/us-school-districts.json";

dayjs.extend(customParseFormat);

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}
const { Panel } = Collapse;
const { confirm } = Modal;

// Priority map for countries that share dial codes
const countryPriorityMap: { [dialCode: string]: string } = {
  "+1": "US", // Prioritize US over Canada, etc.
  "+44": "GB", // Prioritize UK over other +44 countries
  "+61": "AU", // Prioritize Australia over other +61 countries
};

// Updated country codes mapping
const countryCodes = countryJson.map((country: any) => {
  return { 
    value: country.code, // Country code like 'US', 'CA', etc.
    label: `${country.name} (${country.dial_code})`,
    name: country.name,
    dialCode: country.dial_code
  };
});

const schema = yup
  .object<School>({
    name: yup.string().required("Name is required"),
    code: yup.string().required("Code is required"),
    email: yup.string().email("Invalid email format").nullable(),
    website: yup.string().url("Invalid website URL").nullable(),
    phoneNumber: yup.string().nullable().test('phone-validation', 'Invalid phone number format', function(value) {
      if (!value || value === '') return true; // Allow empty values
      // Simple validation - adjust as needed
      return /^\d{7,15}$/.test(value.replace(/[^\d]/g, ''));
    }),
    street: yup.string().nullable(),
    city: yup.string().nullable(), 
    state: yup.string().nullable(),
    district: yup.string().required("District is required"),
  })

const defaultValue: Partial<School> = {
  name: "",
  code: "",
  email: "",
  website: "",
  phoneNumber: "",
  street: "",
  city: "",
  state: "",
  district: "",
};

export default function NewSchoolComponent(props: Props) {
  const params = useParams();
  const navigate = useNavigate();
  const { editMode, onCreating } = props;
  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<any>({
    defaultValues: defaultValue,
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const [createSchool, createResponse] = useCreateSchoolMutation();
  const [updateSchool, updateResponse] = useUpdateSchoolMutation();
  const [archiveSchool, archiveResponse] = useArchiveSchoolMutation();
  const [deleteSchool, deleteResponse] = useDeleteSchoolMutation();
  const [restoreSchool, restoreResponse] = useRestoreSchoolMutation();

  const [getSchool, school] = useLazyGetSchoolQuery();

  const [selectedCountry, setSelectedCountry] = useState<string>("US"); // Default to US
  const [schoolLogoFile, setSchoolLogoFile] = useState<RcFile | null>(null);
  const [schoolLogoPreview, setSchoolLogoPreview] = useState<string | undefined>(undefined);

  // Helper function to parse phone number 
  const parsePhoneNumberHelper = (fullPhoneNumber: string) => {
    if (!fullPhoneNumber) return { countryCode: "US", phoneNumber: "" };
    
    // Simple parsing - look for country code in the full number
    const cleaned = fullPhoneNumber.replace(/[^\d+]/g, "");
    
    // Sort countries by dial code length (longest first) to match longer codes first
    const sortedCountries = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);
    
    // Find all matching countries by dial code
    const matchingCountries = sortedCountries.filter(country => 
      cleaned.startsWith(country.dialCode)
    );
    
    if (matchingCountries.length > 0) {
      let selectedCountry = matchingCountries[0];
      
      // Check if there's a priority country for this dial code
      const dialCode = matchingCountries[0].dialCode;
      const priorityCountryCode = countryPriorityMap[dialCode];
      
      if (priorityCountryCode) {
        const priorityCountry = matchingCountries.find(country => country.value === priorityCountryCode);
        if (priorityCountry) {
          selectedCountry = priorityCountry;
        }
      }
      
      const phoneNumber = cleaned.substring(selectedCountry.dialCode.length);
      return { 
        countryCode: selectedCountry.value, 
        phoneNumber: phoneNumber 
      };
    }
    
    // Default to US if no match found
    return { countryCode: "US", phoneNumber: cleaned.replace(/^\+?1?/, "") };
  };

  function onSubmit(data: any) {
    let formattedPhoneNumber = "";
    
    if (data.phoneNumber) {
      // Get dial code for selected country
      const selectedCountryData = countryCodes.find(c => c.value === selectedCountry);
      const dialCode = selectedCountryData?.dialCode || "+1";
      
      // Format: dialCode + phoneNumber (remove any non-digits from phone number)
      const cleanPhoneNumber = data.phoneNumber.replace(/[^\d]/g, "");
      formattedPhoneNumber = `${dialCode}${cleanPhoneNumber}`;
    }
    
    const submitData = {
      ...data,
      phoneNumber: formattedPhoneNumber,
      // Optionally store the country code for better parsing later
      countryCode: selectedCountry,
    };
    
    // Always use FormData for consistency - backend can handle optional schoolLogo
    const formData = new FormData();
    
    // Append all form fields
    formData.append("name", submitData.name || "");
    formData.append("code", submitData.code || "");
    formData.append("phoneNumber", formattedPhoneNumber || "");
    formData.append("countryCode", selectedCountry || "");
    
    if (submitData.email) formData.append("email", submitData.email);
    if (submitData.website) formData.append("website", submitData.website);
    if (submitData.district) formData.append("district", submitData.district);
    if (submitData.state) formData.append("state", submitData.state);
    if (submitData.city) formData.append("city", submitData.city);
    if (submitData.street) formData.append("street", submitData.street);
    
    // Append school logo only if it exists
    if (schoolLogoFile) {
      formData.append("schoolLogo", schoolLogoFile);
    }
    
    if (editMode === "new") {
      onCreating?.(true);
      createSchool(formData).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate(`/schools/detail/${response?.data?.schoolId}`);
          }
        }
      });
    } else {
      formData.append("schoolId", `${params.id}`);
      updateSchool(formData).then((response: any) => {
        if (response?.data) {
          navigate(`/schools/detail/${response?.data?.schoolId}`);
        }
      });
    }
  }
  
  // Handle school logo upload
  const handleSchoolLogoChange = (file: RcFile) => {
    setSchoolLogoFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSchoolLogoPreview(previewUrl);
    return false; // Prevent auto upload
  };
  
  // Handle school logo removal
  const handleSchoolLogoRemove = () => {
    // Clean up blob URL if it exists
    if (schoolLogoPreview && schoolLogoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(schoolLogoPreview);
    }
    setSchoolLogoFile(null);
    setSchoolLogoPreview(undefined);
  };
  
  // Before crop validation
  const beforeCrop = (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return false;
    }
    
    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }
    
    return true;
  };

  const onError = (error: any) => {
    console.log("Error", error);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (schoolLogoPreview && schoolLogoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(schoolLogoPreview);
      }
    };
  }, [schoolLogoPreview]);

  useEffect(() => {
    if (params?.id !== "new") {
      getSchool({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          // If the backend has stored country code, use it; otherwise parse from phone number
          let countryToSet = "US";
          let phoneToSet = "";
          
          if (response?.data?.countryCode) {
            // Use stored country code
            countryToSet = response?.data?.countryCode;
            
            // Extract phone number by removing the dial code
            if (response?.data?.phoneNumber) {
              const countryData = countryCodes.find(c => c.value === countryToSet);
              if (countryData && response?.data?.phoneNumber.startsWith(countryData.dialCode)) {
                phoneToSet = response?.data?.phoneNumber.substring(countryData.dialCode.length);
              } else {
                phoneToSet = response?.data?.phoneNumber.replace(/[^\d]/g, "");
              }
            }
          } else {
            // Fallback to parsing from phone number
            const { countryCode: parsedCountryCode, phoneNumber } = parsePhoneNumberHelper(response?.data?.phoneNumber);
            countryToSet = parsedCountryCode;
            phoneToSet = phoneNumber;
          }
          
          setSelectedCountry(countryToSet);
          
          // Set school logo preview from server (MinIO URL)
          if (response?.data?.schoolLogo) {
            setSchoolLogoPreview(response?.data?.schoolLogo);
          } else {
            setSchoolLogoPreview(undefined);
          }
          
          reset({
            ...response?.data,
            phoneNumber: phoneToSet,
          });
        }
      });
    } else {
      reset(defaultValue);
      setSelectedCountry("US"); // Reset to default country code for new entries
      setSchoolLogoPreview(undefined);
      setSchoolLogoFile(null);
    }
  }, [params.id]);

  return (
    <Card
      className="w-full"
      title={editMode === "detail" ? school?.data?.name : "New School"}
    >
      <Spin spinning={school.isLoading || school.isFetching}>
        <div className="w-full flex justify-center">
          <Form
            name="School form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <div className="">
              <div className=" rounded">
                {/* School Logo Section */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar
                      size={120}
                      src={schoolLogoPreview}
                      icon={<PictureOutlined />}
                      className="border-4 border-gray-200"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <ImgCrop
                        beforeCrop={beforeCrop}
                        modalProps={{
                          okButtonProps: {
                            className: "bg-primary",
                          },
                        }}
                        modalOk="Crop"
                        rotationSlider
                      >
                        <Upload
                          beforeUpload={handleSchoolLogoChange}
                          showUploadList={false}
                          accept="image/jpeg,image/png"
                          maxCount={1}
                        >
                          <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            className="bg-primary shadow-lg hover:shadow-xl"
                            size="small"
                          />
                        </Upload>
                      </ImgCrop>
                    </div>
                    {schoolLogoPreview && (
                      <Button
                        type="text"
                        danger
                        shape="circle"
                        icon={<DeleteFilled />}
                        className="absolute -top-2 -right-2 bg-white shadow-md hover:bg-red-50"
                        size="small"
                        onClick={handleSchoolLogoRemove}
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="School Name"
                        required
                        error={errors?.name?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Name"
                          status={errors?.name ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                  <Controller
                    name="code"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Code"
                        required
                        error={errors?.code?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Code"
                          status={errors?.code ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="Phone number"
                          error={errors?.phoneNumber?.message}
                        >
                          <div className="flex">
                            <Select
                              status={errors?.phoneNumber ? "error" : ""}
                              showSearch
                              popupClassName="w-48"
                              className={`rounded-r-none ant-input border border-gray-300 rounded-l w-full ${
                                errors?.phoneNumber ? "border-danger" : ""
                              }`}
                              value={selectedCountry}
                              style={{ width: 250, borderTopRightRadius: 0, borderBottomRightRadius: 0, }}
                              onChange={(value) => {
                                setSelectedCountry(value);
                              }}
                              filterOption={(input, option) =>
                                (
                                  option?.label?.toString().toLowerCase() ?? ""
                                ).includes(input.toLowerCase())
                              }
                              filterSort={(optionA, optionB) =>
                                (optionA?.label?.toString() ?? "")
                                  .toLowerCase()
                                  .localeCompare(
                                    (
                                      optionB?.label?.toString() ?? ""
                                    ).toLowerCase()
                                  )
                              }
                              options={countryCodes}
                            />
                            <Input
                              {...field}
                              placeholder="Enter phone number"
                              className={`rounded-l-none ant-input border border-gray-300 rounded-r w-full ${
                                errors?.phoneNumber ? "border-danger" : ""
                              }`}
                              onChange={(e) => {
                                // Allow only digits and basic formatting characters
                                const value = e.target.value.replace(/[^\d\-\s\(\)]/g, '');
                                field.onChange(value);
                              }}
                              value={field.value || ""}
                            />
                          </div>
                        </InputWrapper>
                      )}
                    />
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="Email"
                          error={errors?.email?.message}
                          className="w-1/2"
                        >
                          <Input
                            placeholder="Email"
                            status={errors?.email ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="School District"
                        error={errors?.district?.message}
                        className="w-full"
                      >
                        <Select
                          {...field}
                          className="w-full"
                          showSearch
                          allowClear
                          placeholder="Select a district"
                          optionFilterProp="label"
                          filterOption={(input, option) =>
                            (option?.label?.toString().toLowerCase() ?? "")
                              .includes(input.toLowerCase())
                          }
                          filterSort={(optionA, optionB) =>
                            (optionA?.label?.toString() ?? "")
                              .toLowerCase()
                              .localeCompare(
                                (optionB?.label?.toString() ?? "").toLowerCase()
                              )
                          }
                          options={districtsJson.map((district: any) => ({
                            label: `${district.name} (${district.state})`,
                            value: district.id
                          }))}
                          status={errors?.district ? "error" : ""}
                        />
                      </InputWrapper>
                    )}
                  />
                    <Controller
                      name="website"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="Website"
                          error={errors?.website?.message}
                          className="w-1/2"
                        >
                          <Input
                            placeholder="Website"
                            status={errors?.website ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                   
                       <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="State"
                          error={errors?.state?.message}
                          className="w-full"
                        >
                          <Input
                            placeholder="State"
                            status={errors?.state ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="City"
                          error={errors?.city?.message}
                          className="w-1/2"
                        >
                          <Input
                            placeholder="City"
                            status={errors?.city ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-col md:flex-row w-1/2 md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                      name="street"
                      control={control}
                      render={({ field }) => (
                        <InputWrapper
                          label="Street"
                          error={errors?.street?.message}
                          className="w-full"
                        >
                          <Input
                            placeholder="Street Address"
                            status={errors?.street ? "error" : ""}
                            {...field}
                          />
                        </InputWrapper>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-2 justify-end mt-4">
              <Form.Item>
                <Button
                  htmlType="button"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    reset(defaultValue);
                    setSchoolLogoFile(null);
                    setSchoolLogoPreview(undefined);
                  }}
                >
                  Reset
                </Button>
              </Form.Item>
              {editMode === "detail" && (
                <>
                  <Form.Item>
                    <Button
                      type="primary"
                      className={`${
                        school?.data?.archivedAt ? "bg-green-400" : "bg-danger"
                      } shadow-none rounded flex items-center`}
                      htmlType="button"
                      onClick={() =>
                        confirm({
                          title: `Warning`,
                          okButtonProps: {
                            className: `${
                              school?.data?.archivedAt
                                ? "bg-green-400"
                                : "bg-danger"
                            } shadow-none`,
                          },
                          cancelButtonProps: {
                            className: "shadow-none",
                          },
                          icon: <ExclamationCircleFilled />,
                          content: `Are you sure you want to ${
                            school?.data?.archivedAt ? "restore" : "delete"
                          } this school?`,
                          onOk() {
                            school?.data?.archivedAt
                              ? restoreSchool(`${params.id}`)
                              : deleteSchool(`${params.id}`);
                          },
                        })
                      }
                      loading={
                        deleteResponse.isLoading || restoreResponse.isLoading
                      }
                    >
                      {school?.data?.archivedAt ? "Restore" : "Delete"} 
                    </Button>
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={createResponse.isLoading || updateResponse.isLoading}
                >
                  {editMode === "detail" ? "Update" : "Save"}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Spin>
    </Card>
  );
}
