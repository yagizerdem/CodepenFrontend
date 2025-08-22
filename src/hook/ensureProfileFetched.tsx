import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import { API } from "../utils/API";
import { showErrorToast } from "../utils/Toaster";

function useEnsureProfileFetched({
  showErrorMessage,
}: {
  showErrorMessage: boolean;
}) {
  const { isLoggedIn, setProfile } = useAppContext();
  const guardRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn && guardRef.current === 0) {
      fetchProfile();
    }

    async function fetchProfile() {
      try {
        guardRef.current++;
        setIsLoading(true);

        const apiResponse: ApiResponse<ApplicationUserEntity> = (
          await API.get("/client/get-me")
        ).data;

        if (!apiResponse.success) {
          if (showErrorMessage)
            showErrorToast(apiResponse.message || "Failed to fetch profile");
          return;
        }

        setProfile(apiResponse.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoggedIn, setProfile, showErrorMessage]);

  return { isLoading };
}

export { useEnsureProfileFetched };
