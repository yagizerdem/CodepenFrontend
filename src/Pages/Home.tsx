import { Outlet } from "react-router";
import { Sidepanel } from "../components/common/SidePanel";
import { useLocation } from "react-router";

function HomePage() {
  const location = useLocation();
  const isHome = location.pathname === "/home";

  return (
    <div className="w-screen h-screen  flex flex-row flex-1">
      <Sidepanel />
      <div className="flex-1 flex-grow ">
        {isHome && <HomePageContent />}
        {!isHome && <Outlet />}
      </div>
    </div>
  );
}

function HomePageContent() {
  return <div>hoem page content</div>;
}

export { HomePage };
