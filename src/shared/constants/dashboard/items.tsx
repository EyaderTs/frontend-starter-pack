import {
  MdOutlinePersonOutline,
  MdOutlinePerson3,
  MdOutlineAdminPanelSettings,
} from "react-icons/md";
import { LuSchool } from "react-icons/lu";
import { NavigateFunction } from "react-router-dom";
import { EnumRoles } from "../enum/app.enum";
export const getMenuItems = (
  navigate: NavigateFunction,
  selectedKey: string
) => {
  const iconSize = 18; // Increased icon size (default is usually around 14-16px)

  return [
    {
      key: "School",
      icon: <LuSchool size={iconSize} />,
      label: "School",
      roles: [EnumRoles.SuperAdmin],
      onClick: () => {
        navigate("schools");
      },
      className: selectedKey === "school" ? "bg-primary text-white" : "",
    },
    {
      key: "User Management",
      icon: <MdOutlinePerson3 size={iconSize} />,
      label: "User Management",
      roles: [EnumRoles.SuperAdmin],
      children: [
        {
          key: "users",
          icon: <MdOutlinePersonOutline size={iconSize} />,
          label: "Users",
          roles: [EnumRoles.SuperAdmin],
          onClick: () => {
            navigate("users");
          },
        },
        {
          key: "roles",
          icon: <MdOutlineAdminPanelSettings size={iconSize} />,
          label: "Roles",
          roles: [EnumRoles.SuperAdmin],
          onClick: () => {
            navigate("roles");
          },
        },
      ],
    },
  ];
};
