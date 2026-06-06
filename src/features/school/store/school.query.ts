/* eslint-disable @typescript-eslint/no-explicit-any */
import { notification } from "antd";
import { School } from "@/models/school-model";
import { Collection, CollectionQuery} from "@/models/collection.model"
import { collectionQueryBuilder } from "@/shared/utility/collection-builder/collection-query-builder";
import { appApi } from "@/store/app.api";
import { SCHOOL_ENDPOINT } from "../school.endpoint";

let schoolCollection: CollectionQuery;
let schoolDetail: any;
const schoolQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchool: builder.query<School, { id: string; includes?: string[] }>({
      query: (data: { id: string; includes?: string[] }) => ({
        url: `${SCHOOL_ENDPOINT.detail}/${data?.id}`,
        method: "get",
        params: collectionQueryBuilder({ includes: data?.includes }),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try { 
          const { data } = await queryFulfilled;
          if (data) {
            schoolDetail = param;
          }
        } catch (error: any) {
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
          });
          notification.error({
            message: "Error",
            description: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
          });
        }
      },
    }),
    getSchools: builder.query<Collection<School>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: SCHOOL_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            schoolCollection = param;
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
    createSchool: builder.mutation<School, School | FormData>({
      query: (newData: any) => ({
        url: `${SCHOOL_ENDPOINT.create}`,
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
              schoolQuery.util.updateQueryData(
                "getSchools",
                schoolCollection,
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
    updateSchool: builder.mutation<School, School | FormData>({
      query: (newData: any) => ({
        url: `${SCHOOL_ENDPOINT.update}`,
        method: "patch",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              schoolQuery.util.updateQueryData(
                "getSchools",
                schoolCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((school) => {
                      if (school.schoolId === data.schoolId) return data;
                      else {
                        return school;
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
    archiveSchool: builder.mutation<School, string>({
      query: (id: string) => ({
        url: `${SCHOOL_ENDPOINT.archive}/${id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              schoolQuery.util.updateQueryData(
                "getSchools",
                schoolCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((school) => {
                      if (school.schoolId === data.schoolId) return data;
                      else {
                        return school;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              schoolQuery.util.updateQueryData(
                "getSchool",
                schoolDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
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
    restoreSchool: builder.mutation<School, string>({
      query: (id: string) => ({
        url: `${SCHOOL_ENDPOINT.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              schoolQuery.util.updateQueryData(
                "getSchools",
                schoolCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((school) => {
                      if (school.schoolId === data.schoolId)
                        return { ...data, archivedDate: null };
                      else {
                        return school;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              schoolQuery.util.updateQueryData(
                "getSchool",
                schoolDetail,
                (draft) => {
                  if (data) {
                    draft.archivedAt = "";
                  }
                }
              )
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
    deleteSchool: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${SCHOOL_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            schoolQuery.util.updateQueryData(
              "getSchools",
              schoolCollection,
              (draft) => {
                if (draft?.data) {
                  draft.data = draft.data.filter(
                    (school) => school.schoolId !== id
                  );
                  draft.count -= 1;
                }
              }
            )
          );
          notification.success({
            message: "Success",
            description: "Successfully deleted",
          });
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
});

export const {
  useGetSchoolQuery,
  useLazyGetSchoolQuery,
  useGetSchoolsQuery,
  useLazyGetSchoolsQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useArchiveSchoolMutation,
  useRestoreSchoolMutation,
  useDeleteSchoolMutation,
} = schoolQuery; 