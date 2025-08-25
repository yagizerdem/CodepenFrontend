import { useEffect } from "react";
import { MyProfileHeader } from "../components/ProfileRelated/MyProfileHeader";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useEnsureProfileFetched } from "../hook/ensureProfileFetched";
import { useAppContext } from "../context/AppContext";
import { MyPens } from "../components/ProfileRelated/MyPens";

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
    <div className="flex flex-1 flex-col  bg-[#272822] h-full w-full">
      <MyProfileHeader />
      <MyPens />
    </div>
  );
}

export { MyProfile };
