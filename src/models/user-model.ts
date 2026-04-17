import { School } from "./school-model";

export interface User {
    userId?: string;
    firstName?: string;
    middleName?:string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    schoolId?:string;
    school?:School;
    isActive?: boolean;
    userRoles?:any,
    profilePicture?:string;
    createdBy?:string,
    updatedBy?:string,
    createdAt?: string;
    updatedAt?: string;
    archivedAt?:string;
  }
  