import { createBrowserRouter } from "react-router";
import { RegisterPage } from "./Pages/Register";
import { LoginPage } from "./Pages/Login";
import { HomePage } from "./Pages/Home";
import { CreatePenPage } from "./Pages/CreatePen";
import { SearchProfilePage } from "./Pages/SearchProfile";
import { SearchPenPage } from "./Pages/SearchPen";
import { MyProfile } from "./Pages/MyProfile";
import { UpdatePen } from "./Pages/UpdatePen";
import { MyOldPenVersion } from "./Pages/MyOldPenVersion";
import { DisplayPen } from "./Pages/DisplayPen";
import { OthersProfile } from "./Pages/OthersProfile";
import { FollowRequestsPage } from "./Pages/FollowRequests";
import { CreateArticlePage } from "./Pages/CreateArticle";

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
      {
        path: "my-old-pens/:penId",
        element: <MyOldPenVersion />,
      },
      {
        path: "display-pen/:penId",
        element: <DisplayPen />,
      },
      {
        path: "/home/others-profile/:userId",
        element: <OthersProfile />,
      },
      {
        path: "/home/follow-request",
        element: <FollowRequestsPage />,
      },
      {
        path: "/home/create-article",
        element: <CreateArticlePage />,
      },
    ],
  },
  {
    path: "/",
    element: <RegisterPage />,
  },
]);

export { router };
