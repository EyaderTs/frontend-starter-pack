import NewRoleComponent from "@/features/role/component/new-role-component";
import RoleListPage from "@/features/role/page/role-list-page";
import RoleDetailComponent from "../component/role-detail-component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

// eslint-disable-next-line import/prefer-default-export
export const RoleRoute = {
  path: "roles",
  element: (
    <ItemGuard roles={[EnumRoles.SuperAdmin]}>
      <RoleListPage />
    </ItemGuard>
  ),
  children: [
    { path: "edit/:id", element: <NewRoleComponent editMode="detail" /> },
    { path: ":id", element: <NewRoleComponent editMode="new" /> },
    { path: "detail/:id", element: <RoleDetailComponent /> },
  ],
};
