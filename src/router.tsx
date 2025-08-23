import { createBrowserRouter } from "react-router";
import { RegisterPage } from "./Pages/Register";
import { LoginPage } from "./Pages/Login";
import { HomePage } from "./Pages/Home";
import { CreatePenPage } from "./Pages/CreatePen";
import { SearchProfilePage } from "./Pages/SearchProfile";

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
    ],
  },
  {
    path: "/",
    element: <RegisterPage />,
  },
]);

export { router };
