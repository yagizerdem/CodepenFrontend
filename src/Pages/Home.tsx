import { Outlet } from "react-router";
import { Sidepanel } from "../components/common/SidePanel";
import { useLocation } from "react-router";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useEnsureProfileFetched } from "../hook/ensureProfileFetched";
import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";

function HomePage() {
  const { setIsLoading, profile } = useAppContext();
  const location = useLocation();
  const isHome = location.pathname === "/home";

  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: true,
  });
  const { isLoading: profileLoader } = useEnsureProfileFetched({
    showErrorMessage: true,
  });

  useEffect(() => {
    const _isLoading = loggedInLoader || profileLoader;
    setIsLoading(_isLoading);
  }, [loggedInLoader, profileLoader, setIsLoading]);

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
