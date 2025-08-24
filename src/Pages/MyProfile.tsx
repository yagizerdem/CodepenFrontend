import { useEffect } from "react";
import { MyProfileHeader } from "../components/ProfileRelated/MyProfileHeader";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useEnsureProfileFetched } from "../hook/ensureProfileFetched";
import { useAppContext } from "../context/AppContext";

function MyProfile() {
  const { setIsLoading, profile } = useAppContext();
  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: false,
  });
  const { isLoading: profileLoader } = useEnsureProfileFetched({
    showErrorMessage: false,
  });

  useEffect(() => {
    const _isLoading = loggedInLoader || profileLoader;
    setIsLoading(_isLoading);
  }, [loggedInLoader, profileLoader, setIsLoading]);

  return (
    <div className="flex flex-1  bg-[#272822] h-full w-full">
      <MyProfileHeader />
    </div>
  );
}

export { MyProfile };
