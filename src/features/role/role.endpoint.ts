export const ROLE_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/roles/get-roles`,
  detail: `${import.meta.env.VITE_API}/roles/get-role`,
  create: `${import.meta.env.VITE_API}/roles/create-role`,
  update: `${import.meta.env.VITE_API}/roles/update-role`,
  delete: `${import.meta.env.VITE_API}/roles/delete-role`,
  archive: `${import.meta.env.VITE_API}/roles/archive-role`,
  restore: `${import.meta.env.VITE_API}/roles/restore-role`,
};
