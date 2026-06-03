import { Button } from "antd";
import { useEffect, useState } from "react";
import { CollectionQuery, Order } from "../../../models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "../../../models/entity-config.model";
import { Role } from "../../../models/role-model";
import EntityList from "../../../shared/component/entity-list/entity-list.component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { useLocation, useParams } from "react-router-dom";
import { useLazyGetRolesQuery } from "../store/role.query";

export default function RoleListPage() {
  const params = useParams();
  const [viewMode, setViewMode] = useState<entityViewMode>("list");

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const [getRoles, roles] = useLazyGetRolesQuery();

  useEffect(() => {
    getRoles(collection);
  }, [collection]);

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params?.id]);

  const config: EntityConfig<Role> = {
    primaryColumn: {
      key: "name",
      name: "Role Name",
      render: (role: Role) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{role?.name}</span>
          </div>
        );
      },
    },
    rootUrl: "/roles",
    identity: "roleId",
    visibleColumn: [
      {
        key: "name",
        name: "Role Name",
        render: (role: Role) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">{role?.name}</span>
            </div>
          );
        },
      },
      { key: "key", name: "Role Key" },
      { key: "description", name: "Description" },
      { key: "createdAt", name: "Created At", isDate: true },
    ],
    filter: [
      [
        {
          field: "isActive",
          name: "Active",
          operator: "=",
          value: true,
        },
        {
          field: "isActive",
          name: "Inactive",
          operator: "=",
          value: false,
        },
      ],
    ],
  };


  const items = roles.data?.data;
  const total = roles.data?.count;

  return (
    <div className="flex">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        tableKey="roles"
        showArchived={false}
        showSelector={false}
        showExport={false}
        title={"Roles"}
        detailTitle={<span className="cursor-pointer">Role Details</span>}
        newButtonText="New Role"
        total={total}
        collectionQuery={collection}
        itemsLoading={roles.isLoading}
        config={config}
        items={items}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          if (data === "") {
            setCollection({
              ...collection,
              search: "",
              searchFrom: [],
            });
          } else {
            setCollection({
              ...collection,
              search: data,
              searchFrom: ["name", "key"],
            });
          }
        }}
        onFilterChange={(data: any) => {
          if (collection?.filter || data.length > 0) {
            setCollection({ ...collection, filter: data });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
      />
    </div>
  );
}
