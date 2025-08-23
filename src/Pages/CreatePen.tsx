import { useEffect } from "react";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useAppContext } from "../context/AppContext";
import { CodeEditor } from "../components/editorRelated/CodeEditor";

function CreatePenPage() {
  const { setIsLoading } = useAppContext();

  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: true,
  });

  useEffect(() => {
    setIsLoading(loggedInLoader);
  }, [loggedInLoader, setIsLoading]);

  return <CodeEditor />;
}

export { CreatePenPage };
