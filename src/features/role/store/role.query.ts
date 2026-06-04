/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { Role } from "@/models/role-model";
import { Collection, CollectionQuery } from "@/models/collection.model";
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { ROLE_ENDPOINT } from "../role.endpoint";

let roleCollection: CollectionQuery;
let roleDetail: any;
const roleQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getRole: builder.query<Role, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${ROLE_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            roleDetail = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    getRoles: builder.query<Collection<Role>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: ROLE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            roleCollection = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    createRole: builder.mutation<Role, Role>({
      query: (newData: any) => ({
        url: `${ROLE_ENDPOINT.create}`,
        method: "post",
        data: newData,
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notification.success({
              message: "Success",
              description: "Successfully created",
            });
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data.push(data);
                    draft.count += 1;
                  }
                }
              )
            );
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    updateRole: builder.mutation<Role, any>({
      query: (newData: any) => ({
        url: `${ROLE_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((role) => {
                      if (role.roleId === data.roleId) return data;
                      else {
                        return role;
                      }
                    });
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Successfully Updated",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    archiveRole: builder.mutation<Role, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((role) => {
                      if (role.roleId === data.roleId) return data;
                      else {
                        return role;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              roleQuery.util.updateQueryData("getRole", roleDetail, (draft) => {
                if (data) {
                  draft.archivedAt = data?.archivedAt;
                }
              })
            );
            notification.success({
              message: "Success",
              description: "Successfully deleted",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    restoreRole: builder.mutation<Role, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((role) => {
                      if (role.roleId === data.roleId)
                        return { ...data, archivedDate: null };
                      else {
                        return role;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              roleQuery.util.updateQueryData("getRole", roleDetail, (draft) => {
                if (data) {
                  draft.archivedAt = "";
                }
              })
            );
            notification.success({
              message: "Success",
              description: "Successfully restored",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    deleteRole: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (role) => role.roleId !== id
                    );
                    draft.count -= 1;
                  }
                }
              )
            );
            notification.success({
              message: "Success",
              description: "Successfully Deleted",
            });
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useLazyGetRoleQuery,
  useLazyGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useArchiveRoleMutation,
  useRestoreRoleMutation,
} = roleQuery;
