import {
  SaveOutlined,
  DeleteOutlined,
  RollbackOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Collapse, Form, Input, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Role } from "@/models/role-model";
import Card from "../../../shared/component/Card/card-component";
import InputWrapper from "../../../shared/component/input-wrapper/input-wrapper";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useArchiveRoleMutation,
  useDeleteRoleMutation,
  useLazyGetRoleQuery,
  useRestoreRoleMutation,
} from "@/features/role/store/role.query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface Props {
  editMode: "new" | "detail";
  onCreating?: (isCreating: boolean) => void;
}

const { Panel } = Collapse;
const { confirm } = Modal;

const schema = yup
  .object<Role>({
    name: yup.string().required("Name is required"),
    key: yup.string().required("Key is required"),
    description: yup.string().required("Description is required"),
  })
  .required();

const defaultValue: Role = {
  name: "",
  key: "",
  description: "",
};

export default function NewRoleComponent(props: Props) {
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

  const [createRole, createResponse] = useCreateRoleMutation();
  const [updateRole, updateResponse] = useUpdateRoleMutation();
  const [archiveRole, archiveResponse] = useArchiveRoleMutation();
  const [deleteRole, deleteResponse] = useDeleteRoleMutation();
  const [restoreRole, restoreResponse] = useRestoreRoleMutation();
  const [getRole, role] = useLazyGetRoleQuery();

  function onSubmit(data: any) {
    if (editMode === "new") {
      onCreating?.(true);
      createRole({
        ...data,
      }).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate(`/roles/detail/${response?.data?.roleId}`);
          }
        }
      });
    } else {
      updateRole({
        ...data,
        roleId:`${params.id}`,
      }).then((response: any) => {
        if (response?.data) {
          navigate(`/roles/detail/${response?.data?.roleId}`);
        }
      });
    }
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    if (params?.id !== "new") {
      getRole({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response?.data,
          });
        }
      });
    } else {
      reset(defaultValue);
    }
  }, [params.id]);

  return (
    <Card
      className="w-full"
      title={editMode === "detail" ? role?.data?.name : "New Role"}
    >
      <Spin spinning={role.isLoading || role.isFetching}>
        <div className="w-full flex justify-center">
          <Form
            name="Role form"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <div className="">
              <div className=" rounded">
                <div className="flex flex-col md:flex-row w-full md:space-x-4 space-y-4 md:space-y-0">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Name"
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
                    name="key"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Key"
                        required
                        error={errors?.key?.message}
                        className="w-full"
                      >
                        <Input
                          required
                          placeholder="Key"
                          status={errors?.key ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <InputWrapper
                        label="Description"
                        required
                        error={errors?.description?.message}
                        className="w-full md:w-1/2"
                      >
                        <Input
                          required
                          placeholder="Description"
                          status={errors?.description ? "error" : ""}
                          {...field}
                        />
                      </InputWrapper>
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 justify-end mt-4 gap-2">
              <Form.Item>
                <Button
                  htmlType="button"
                  icon={<ClearOutlined />}
                  onClick={() => reset(defaultValue)}
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
                        role?.data?.archivedAt ? "bg-green-400" : "bg-danger"
                      } shadow-none rounded flex items-center`}
                      htmlType="button"
                      onClick={() =>
                        confirm({
                          title: `Warning`,
                          okButtonProps: {
                            className: `${
                              role?.data?.archivedAt
                                ? "bg-green-400"
                                : "bg-danger"
                            } rounded shadow-none`,
                          },
                          cancelButtonProps: {
                            className: "shadow-none",
                          },
                          icon: <ExclamationCircleFilled />,
                          content: `Do you want to ${
                            role?.data?.archivedAt ? "restore" : "delete"
                          }  ${role?.data?.name}`,
                          onOk() {
                            role?.data?.archivedAt
                              ? restoreRole(`${params.id}`)
                              : deleteRole(`${params.id}`);
                          },
                        })
                      }
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      icon={
                        role?.data?.archivedAt ? (
                          <RollbackOutlined />
                        ) : (
                          <DeleteOutlined />
                        )
                      }
                    >
                      {role?.data?.archivedAt ? "Restore" : "Delete"}
                    </Button>
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Button
                  type="primary"
                  className="bg-primary shadow-none rounded flex items-center"
                  htmlType="submit"
                  loading={
                    editMode === "new"
                      ? createResponse?.isLoading
                      : updateResponse?.isLoading
                  }
                  icon={<SaveOutlined />}
                >
                  {editMode === "new" ? "Save" : "Update"}
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Spin>
    </Card>
  );
}
