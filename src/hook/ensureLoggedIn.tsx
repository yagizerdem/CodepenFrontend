import { useEffect, useRef } from "react";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import { API } from "../utils/API";
import { showErrorToast } from "../utils/Toaster";
import { useAppContext } from "../context/AppContext";

export default function useEnsureLoggedIn({
  showErrorMessage,
}: {
  showErrorMessage: boolean;
}) {
  const { isLoggedIn, setIsLoading, setIsLoggedIn } = useAppContext();
  const guardRef = useRef<number>(0);

  useEffect(() => {
    if (!isLoggedIn) {
      if (guardRef.current > 0) return; //ensure hit only once
      initilize();
    }

    async function initilize() {
      try {
        guardRef.current++;
        setIsLoading(true);
        const response: ApiResponse<ApplicationUserEntity> = (
          await API.get("/client/is-loggedin")
        ).data;

        console.log(response);

        if (!response.success) {
          if (showErrorMessage)
            showErrorToast(response.message || "Unknown error occurred");
          return;
        }

        setIsLoggedIn(true);
      } catch (error) {
        console.log(error);
        showErrorToast("Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, setIsLoading, setIsLoggedIn]);
}
