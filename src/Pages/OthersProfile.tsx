import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Fragment } from "react/jsx-runtime";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { useAppContext } from "../context/AppContext";
import ProfileImageContainer from "../components/common/ProfileImageContainer";
import { RelationIndicator } from "../components/ProfileRelated/RelationIndicator";
import { Button } from "../ui";
import type { FollowRequest } from "../models/entity/FollowRequest";

function OthersProfile() {
  const { setIsLoading } = useAppContext();
  const { userId } = useParams();
  const [profile, setProfiles] = useState<ApplicationUserEntity | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  useEffect(() => {
    setIsLoading(isLoadingProfile);
  }, [isLoadingProfile]);

  async function fetchProfile(userId: string) {
    try {
      setIsLoadingProfile(true);

      const apiResponse: ApiResponse<ApplicationUserEntity> = (
        await API.get(`/client/get-user-by-id/${userId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occured");
        return;
      }

      setProfiles(apiResponse.data);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function SendFollowRequest() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<FollowRequest> = (
        await API.post(`/relation/send-follow-request/${userId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occured");
        return;
      }

      showSuccessToast(
        apiResponse.message || "Follow request sent successfully"
      );
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured while sending follow request");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div className=" w-full h-full bg-[#272822]">
        <div className="flex flex-row items-center gap-4 p-4 border-b border-gray-700 ">
          {/* Profile picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-[65px] h-[65px]">
              <ProfileImageContainer
                customStyle={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
                profileImagePath={profile?.profileImagePath}
                expandOnClick
              />
            </div>
          </div>

          {/* User info */}
          <div className="flex flex-col min-w-0">
            <span
              className="text-white text-lg font-semibold truncate"
              title={profile?.fullName}
            >
              {profile?.fullName}
            </span>
            <span
              className="text-gray-400 text-sm truncate"
              title={profile?.userName}
            >
              @{profile?.userName}
            </span>
            <span
              className="text-gray-400 text-sm truncate"
              title={profile?.email}
            >
              {profile?.email}
            </span>
          </div>
          <RelationIndicator userId={profile?.id ?? ""} />

          {/* send follow request button */}
          <Button
            className="bg-brand-primary text-white px-6 py-1.5 rounded-lg font-medium text-sm border-0"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              SendFollowRequest();
            }}
          >
            Follow
          </Button>
        </div>
      </div>
    </Fragment>
  );
}

export { OthersProfile };
