import { Button } from "antd";
import { useEffect, useState } from "react";
import { CollectionQuery, Order } from "../../../models/collection.model";
import {
  EntityConfig,
  entityViewMode,
} from "../../../models/entity-config.model";
import { School } from "../../../models/school-model";
import EntityList from "../../../shared/component/entity-list/entity-list.component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";
import { useLocation, useParams } from "react-router-dom";
import { useLazyGetSchoolsQuery } from "../store/school.query";
import districtsJson from "@/shared/constants/us-school-districts.json";

export default function SchoolListPage() {
  const params = useParams(); 
  const [viewMode, setViewMode] = useState<entityViewMode>("list");
  
  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const [getSchools, schools] = useLazyGetSchoolsQuery();
  
  useEffect(() => {
    getSchools(collection);
  }, [collection]);

  useEffect(() => {
    if (params?.id !== undefined) {
      setViewMode("detail");
    } else {
      setViewMode("list");
    }
  }, [setViewMode, params?.id]);

  const config: EntityConfig<School> = {
    primaryColumn: {
      key: "name",
      name: "School Name",
      render: (school: School) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{school?.name}</span>
          </div>
        );
      },
    },
    rootUrl: "/schools",
    identity: "schoolId",
    visibleColumn: [
      {
        key: "name",
        name: "School Name",
        render: (school: School) => {
          return (
            <div className="flex wrap items-center space-x-1">
              <span className="cursor-pointer">{school?.name}</span>
            </div>
          );
        },
      },
      { key: "code", name: "School Code" },
      { key: "district", name: "District", render: (school: School) => {
        return (
          <div className="flex wrap items-center space-x-1">
            <span className="cursor-pointer">{districtsJson.find(d => d.id === school?.district)?.name}</span>
          </div>
        );
      } },
      { key: "phoneNumber", name: "Phone Number" },
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


  const items = schools.data?.data;
  const total = schools.data?.count;
  return (
    <div className="flex">
      <EntityList
        parentStyle="w-full"
        viewMode={viewMode}
        tableKey="schools"
        showArchived={false}
        showSelector={false}
        showExport={false}
        title={"Schools"}
        detailTitle={
          <span className="cursor-pointer">School Details</span>
        }
        newButtonText="New School"
        total={total}
        collectionQuery={collection}
        itemsLoading={schools.isLoading}
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
              searchFrom: [
                "name",
                "code",
                "description"
              ],
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