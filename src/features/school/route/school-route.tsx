import NewSchoolComponent from "@/features/school/component/new-school-component";
import SchoolListPage from "@/features/school/page/school-list-page";
import SchoolDetailComponent from "../component/school-detail-component";
import { ItemGuard } from "@/shared/auth/component/auth-guard";
import { EnumRoles } from "@/shared/constants/enum/app.enum";

export const SchoolRoute = {
  path: "schools",
  element: (
    <ItemGuard roles={[EnumRoles.SuperAdmin]}>
      <SchoolListPage />
    </ItemGuard>
  ),
  children: [
    { path: "edit/:id", element: <NewSchoolComponent editMode="detail" /> },
    { path: ":id", element: <NewSchoolComponent editMode="new" /> },
    { path: "detail/:id", element: <SchoolDetailComponent /> },
  ],
};
