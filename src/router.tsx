import { createBrowserRouter } from "react-router";
import { RegisterPage } from "./Pages/Register";
import { LoginPage } from "./Pages/Login";
import { HomePage } from "./Pages/Home";
import { CreatePenPage } from "./Pages/CreatePen";
import { SearchProfilePage } from "./Pages/SearchProfile";
import { SearchPenPage } from "./Pages/SearchPen";
import { MyProfile } from "./Pages/MyProfile";
import { UpdatePen } from "./Pages/UpdatePen";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <HomePage />,
    children: [
      {
        path: "create-pen",
        element: <CreatePenPage />,
      },
      {
        path: "search-profile",
        element: <SearchProfilePage />,
      },
      {
        path: "search-pen",
        element: <SearchPenPage />,
      },
      {
        path: "my-profile",
        element: <MyProfile />,
      },
      {
        path: "update-pen/:penId",
        element: <UpdatePen />,
      },
    ],
  },
  {
    path: "/",
    element: <RegisterPage />,
  },
]);

export { router };
