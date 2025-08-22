import { useEffect } from "react";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useAppContext } from "../context/AppContext";

function CreatePenPage() {
  const { setIsLoading } = useAppContext();

  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: true,
  });

  useEffect(() => {
    setIsLoading(loggedInLoader);
  }, [loggedInLoader, setIsLoading]);

  return (
    <div className="w-full h-full bg-red-400">
      <div>create pen</div>
    </div>
  );
}

export { CreatePenPage };
