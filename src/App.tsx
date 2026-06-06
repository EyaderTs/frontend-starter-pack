import { ConfigProvider, notification } from "antd";
// import moment from "moment-timezone";
import { Provider } from "react-redux";
import { AuthContextProvider } from "./shared/auth/context/authContext";
import AuthGuard from "./shared/auth/component/auth-guard";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import Dashboard from "./layout/dashboard";
import { Login } from "./shared/auth/component/login";
import NotFound from "./shared/component/not-found/not-found-component";
import { store } from "./store/app.store";
import ResetPasswordPage from "./features/user/page/reset-password-page";

import { RoleRoute } from "./features/role/route/role-route";
import { UserRoute } from "./features/user/route/user-route";
import { SchoolRoute } from "./features/school/route/school-route";

notification.config({
  placement: "bottomRight",
  bottom: 20,
  duration: 3,
  rtl: false,
});

function App() {
  // moment.tz.setDefault("Africa/Addis_Ababa");
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AuthContextProvider>
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        </AuthContextProvider>
      ),
      children: [
        { index: true, element: <Navigate to="schools" replace /> },
        UserRoute,
        RoleRoute,
        SchoolRoute,
        { path: "*", element: <NotFound /> },
      ],
    },
    {
      path: "login",
      element: (
        <AuthContextProvider>
          <Login />
        </AuthContextProvider>
      ),
    },
    {
      path: "reset-password",
      element: (
        <AuthContextProvider>
          <ResetPasswordPage />
        </AuthContextProvider>
      ),
    },
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <Provider store={store}>
        <div className="m-0 bg-gray-50">
          {/* {notification.config({
            placement: "bottomRight",
            bottom: 20,
            duration: 3,
            rtl: false,
          })} */}
          <RouterProvider router={router} />
          {/* <InternetConnectionStatus /> */}
        </div>
      </Provider>
    </ConfigProvider>
  );

}

export default App;
