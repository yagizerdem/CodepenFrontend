import { useEffect } from "react";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useAppContext } from "../context/AppContext";
import { HorizontalSplitPanel } from "../components/common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../components/common/VerticalSplitPanel";

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
      <VerticalSplitPanel
        sections={[
          <div>Top Panel</div>,
          <HorizontalSplitPanel
            sections={[<div>Html</div>, <div>CSS</div>, <div>JavaScript</div>]}
          />,
        ]}
      />
    </div>
  );
}

export { CreatePenPage };
