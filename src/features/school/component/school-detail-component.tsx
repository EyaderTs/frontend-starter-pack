import { Suspense, useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import DetailsPage from "../../../shared/component/details-page/details-page.component";
import {
  useLazyGetSchoolsQuery,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useRestoreSchoolMutation,
  useLazyGetSchoolQuery,
} from "../store/school.query";
import dateFormat from "dateformat";
import {
  Button,
  Modal,
  Spin,
  Tabs,
  message,
  Popconfirm,
  Table,
  Input,
} from "antd";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { ItemGuard } from "../../../shared/auth/component/auth-guard";
import { EnumRoles } from "../../../shared/constants/enum/app.enum";
import { useLazyGetUsersQuery } from "@/features/user/store/user.query";
import { CollectionQuery } from "@/models/collection.model";
import { User } from "@/models/user-model";
import districtsJson from "@/shared/constants/us-school-districts.json";
// import { districts } from "@/shared/constants/data/country-data";


export default function SchoolDetailComponent() {
  const params = useParams();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;
  const { Search } = Input;

  const [getSchool, school] = useLazyGetSchoolQuery();
  const [updateSchool, updatedSchool] = useUpdateSchoolMutation();
  const [deleteSchool, deleteResponse] = useDeleteSchoolMutation();
  const [restoreSchool, restoreResponse] = useRestoreSchoolMutation();
  const [getUsers, users] = useLazyGetUsersQuery();
  const [searchText, setSearchText] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const [userCollection, setUserCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 10,
    filter: [
      [
        {
          field: "schoolId",
          value: `${params?.id}`,
          operator: "=",
        },
      ],
    ],
    includes: ["userRoles", "school"],
  });

  // Helper function to get district display name
  const getDistrictDisplayName = (districtId: string) => {
    const district = districtsJson.find(d => d.id === districtId);
    return district ? `${district.name} (${district.state})` : districtId || "";
  };

  useEffect(() => {
    getUsers(userCollection);
  }, [userCollection]);

  useEffect(() => {
    if (params?.id) {
      setUserCollection(prev => ({
        ...prev,
        filter: [
          [
            {
              field: "schoolId",
              value: `${params.id}`,
              operator: "=",
            },
          ],
        ],
        skip: 0,
      }));
    }
  }, [params?.id]);

  useEffect(() => {
    getSchool({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  const data = [
    {
      key: "1",
      label: "Name",
      value: school?.data?.name ?? "",
    },
    {
      key: "2",
      label: "Code",
      value: school?.data?.code ?? "",
    },
    {
      key: "3",
      label: "District",
      value: getDistrictDisplayName(school?.data?.district ?? ""),
    },
    {
      key: "4",
      label: "Email",
      value: school?.data?.email ?? "",
    },
    {
      key: "5",
      label: "Phone",
      value: school?.data?.phoneNumber,
    },
    {
      key: "6",
      label: "Website",
      value: school?.data?.website ? (
        <a href={school?.data?.website} target="_blank" rel="noopener noreferrer">
          {school?.data?.website}
        </a>
      ) : "",
    },


    {
      key: "8",
      label: "State",
      value: school?.data?.state ?? "",
    },
    {
      key: "9",
      label: "City",
      value: school?.data?.city ?? "",
    },
    {
      key: "10",
      label: "Street",
      value: school?.data?.street ?? "",
    },
  ];

  const profileData = {
    image: `${school?.data?.schoolLogo ?? "/school-placeholder.png"}`, // You can replace with a school icon
    name: school?.data?.name ?? "",
    type: "School",
    code: school?.data?.code ?? "",
  };

  const config = {
    editUrl: `/schools/edit/${params?.id}`,
    isProfile: true,
    title: school?.data?.name ?? "",
    widthClass: "w-full",
  };

  const actions = (
    <div className="flex space-x-2 items-end p-2">
      <ItemGuard
        roles={[
          EnumRoles.SuperAdmin,
        ]}
      >
        <Popconfirm
          title={`${school?.data?.archivedAt ? "Restore" : "Delete"} School`}
          description={`Are you sure you want to ${
            school?.data?.archivedAt ? "restore" : "delete"
          } this school?`}
          icon={<ExclamationCircleFilled style={{ color: "#ff4d4f" }} />}
          onConfirm={() => {
            school?.data?.archivedAt
              ? restoreSchool(`${params.id}`)
              : deleteSchool(`${params.id}`);
          }}
          okButtonProps={{
            className: `${
              school?.data?.archivedAt ? "bg-green-400" : "bg-danger"
            } shadow-none`,
          }}
          cancelButtonProps={{
            className: "shadow-none",
          }}
        >
          <Button
            danger={!school?.data?.archivedAt}
            type="primary"
            className={`${
              school?.data?.archivedAt ? "bg-green-400" : ""
            } shadow-none`}
            loading={deleteResponse.isLoading || restoreResponse.isLoading}
          >
            {school?.data?.archivedAt ? "Restore" : "Delete"} School
          </Button>
        </Popconfirm>
      </ItemGuard>
    </div>
  );

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (_: unknown, record: User) =>
        `${record.firstName || ""} ${
          record.lastName || ""
        }`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: ["userRoles", "roleName"],
      key: "role",
      render: (_: unknown, record: User) => record.userRoles?.roleName || "---",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (_: unknown, record: User) =>
        record.isActive ? "Active" : "Inactive",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout
    const timeout = setTimeout(() => {
      if (value === "") {
        setUserCollection({
          ...userCollection,
          search: "",
          searchFrom: [],
        });
      } else {
        setUserCollection({
          ...userCollection,
          search: value,
          searchFrom: [
            "users.firstName",
            "users.middleName",
            "users.lastName",
            "users.email",
            "users.phone",
          ],
        });
      }
    }, 1000);
    
    setSearchTimeout(timeout as any);
  };

  return (
    <div className="w-full flex-col mx-6 space-y-4">
      {contextHolder}
      <Tabs
        className="px-2"
        items={[
          {
            key: "school",
            label: "School Details",
            children: (
              <DetailsPage
                dataSource={[{ title: "Basic Information", source: data }]}
                additionalActions={actions}
                profileData={profileData}
                config={config}
                isLoading={school.isLoading}
              />
            ),
          },
          {
            label: "Staffs",
            key: "user",
            children: (
              <div className="w-full">
                <div className="flex justify-between items-center mb-4 p-2">
                  <Search
                    placeholder="Search users"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchText}
                    style={{ width: 450 }}
                    allowClear
                  />
                  <Button
                    className="flex items-center rounded bg-primary text-white shadow-none"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      navigate(`/users/new?schoolId=${params?.id}`);
                    }}
                  >
                    Add Staff
                  </Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={users?.data?.data as User[]}
                  loading={users?.isLoading || users?.isFetching}
                  rowKey={(record) => record.userId || Math.random().toString()}
                  pagination={{
                    pageSize: userCollection.top,
                    total: users?.data?.count,
                    onChange: (page, pageSize) => {
                      const skip = (page - 1) * pageSize;
                      setUserCollection({
                        ...userCollection,
                        skip: skip,
                        top: pageSize,
                      });
                    },
                  }}
                  onRow={(record) => {
                    return {
                      onDoubleClick: () => {
                        navigate(`/users/edit/${record.userId}`);
                      },
                    };
                  }}
                />
              </div>
            ),
          },
          // You can add more tabs here for school-specific features
          // For example: Departments, Students, etc.
        ]}
      />
    </div>
  );
}
