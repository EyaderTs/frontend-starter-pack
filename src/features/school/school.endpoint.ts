export const SCHOOL_ENDPOINT = {
  list: `${import.meta.env.VITE_API}/schools/get-schools`,
  detail: `${import.meta.env.VITE_API}/schools/get-school`,
  create: `${import.meta.env.VITE_API}/schools/create-school`,
  update: `${import.meta.env.VITE_API}/schools/update-school`,
  delete: `${import.meta.env.VITE_API}/schools/delete-school`,
  archive: `${import.meta.env.VITE_API}/schools/archive-school`,
  restore: `${import.meta.env.VITE_API}/schools/restore-school`,
}; 