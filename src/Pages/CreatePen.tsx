import useEnsureLoggedIn from "../hook/ensureLoggedIn";

function CreatePenPage() {
  useEnsureLoggedIn({ showErrorMessage: true });

  return (
    <div className="w-full h-full bg-red-400">
      <div>create pen</div>
    </div>
  );
}

export { CreatePenPage };
