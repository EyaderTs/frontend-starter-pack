import { Suspense, useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import DetailsPage from "../../../shared/component/details-page/details-page.component";
import {
  useLazyGetRoleQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useRestoreRoleMutation,
} from "../store/role.query";
import dateFormat from "dateformat";
import { Button, Modal, Spin, Tabs, message, Popconfirm } from "antd";
import { DeleteOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { ItemGuard } from "../../../shared/auth/component/auth-guard";
import { EnumRoles } from "../../../shared/constants/enum/app.enum";

export default function RoleDetailComponent() {
  const params = useParams();
  const [messageApi, contextHolder] = message.useMessage();
  const { confirm } = Modal;

  const [getRole, role] = useLazyGetRoleQuery();
  const [updateRole, updatedRole] = useUpdateRoleMutation();
  const [deleteRole, deleteResponse] = useDeleteRoleMutation();
  const [restoreRole, restoreResponse] = useRestoreRoleMutation();

  useEffect(() => {
    getRole({
      id: `${params?.id}`,
    });
  }, [params?.id]);

  const data = [
    {
      key: "1",
      label: "Name",
      value: role?.data?.name ?? "",
    },
    {
      key: "2",
      label: "Key",
      value: role?.data?.key ?? "",
    },
    {
      key: "3",
      label: "Description",
      value: role?.data?.description ?? "",
    },
  ];

  const profileData = {
    image: "/role-placeholder.png",
    name: role?.data?.name ?? "",
    type: "Role",
    code: role?.data?.key ?? "",
  };

  const config = {
    editUrl: `/roles/edit/${params?.id}`,
    isProfile: true,
    title: role?.data?.name ?? "",
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
          title={`${role?.data?.archivedAt ? "Restore" : "Delete"} Role`}
          description={`Are you sure you want to ${
            role?.data?.archivedAt ? "restore" : "delete"
          } this role?`}
          icon={<ExclamationCircleFilled style={{ color: "#ff4d4f" }} />}
          onConfirm={() => {
            role?.data?.archivedAt
              ? restoreRole(`${params.id}`)
              : deleteRole(`${params.id}`);
          }}
          okButtonProps={{
            className: `${
              role?.data?.archivedAt ? "bg-green-400" : "bg-danger"
            } shadow-none`,
          }}
          cancelButtonProps={{
            className: "shadow-none",
          }}
        >
          <Button
            danger={!role?.data?.archivedAt}
            type="primary"
            className={`${
              role?.data?.archivedAt ? "bg-green-400" : ""
            } shadow-none`}
            loading={deleteResponse.isLoading || restoreResponse.isLoading}
          >
            {role?.data?.archivedAt ? "Restore" : "Delete"} Role
          </Button>
        </Popconfirm>
      </ItemGuard>
    </div>
  );

  return (
    <div className="w-full flex-col mx-6 space-y-4">
      {contextHolder}
      <Tabs
        className="px-2"
        items={[
          {
            key: "role",
            label: "Role Details",
            children: (
              <DetailsPage
                dataSource={[{ title: "Basic Information", source: data }]}
                additionalActions={actions}
                profileData={profileData}
                config={config}
                isLoading={role.isLoading}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
