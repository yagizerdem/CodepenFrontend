import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { useAppContext } from "./context/AppContext";
import { Spinner } from "./components/common/Spinner";
import { Fragment } from "react/jsx-runtime";

function App() {
  const { isLoading } = useAppContext();

  return (
    <Fragment>
      {isLoading && (
        <div className="w-screen absolute h-screen flex justify-center items-center z-10">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-80 w-screen h-screen"></div>
          <Spinner />
        </div>
      )}
      <RouterProvider router={router} />
    </Fragment>
  );
}

export default App;
