import { createBrowserRouter } from "react-router";
import { RegisterPage } from "./Pages/Register";
import { LoginPage } from "./Pages/Login";
import { HomePage } from "./Pages/Home";
import { CreatePenPage } from "./Pages/CreatePen";

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
    ],
  },
  {
    path: "/",
    element: <RegisterPage />,
  },
]);

export { router };
