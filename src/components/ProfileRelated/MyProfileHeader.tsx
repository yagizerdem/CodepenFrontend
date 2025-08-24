import { useRef } from "react";
import { useAppContext } from "../../context/AppContext";
import ProfileImageContainer from "../common/ProfileImageContainer";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import { API } from "../../utils/API";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";

function MyProfileHeader() {
  const { profile, setIsLoading, setProfile } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fullName =
    profile?.fullName?.trim() ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    profile?.userName ||
    "Unknown";

  const userName = profile?.userName || "—";
  const email = profile?.email || "—";

  const profileImagePath =
    profile?.id && profile?.profilePictureId
      ? `${import.meta.env.VITE_API_BASE_URL}/client/get-profile-image/${
          profile.id
        }`
      : "/default-profile.png";

  // Handler: open file picker
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handler: file selected
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Uploading image:", file);
      // TODO: call your upload API here
    }
  };

  // Handler: remove current profile picture
  const handleRemoveClick = async () => {
    console.log("Removing current profile picture");
    try {
      setIsLoading(true);
      const response: ApiResponse<unknown> = (
        await API.post("/client/remove-profile-image")
      ).data;

      if (!response.success) {
        showErrorToast(response.message || "unknown error occured");
        return;
      }

      if (profile) {
        setProfile({
          ...profile,
          profilePicture: null,
          profilePictureId: null,
        });
      }

      showSuccessToast("Profile picture removed successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-fit p-7 flex items-center gap-6">
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
            profileImagePath={profileImagePath}
            expandOnClick
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            className="px-3 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
          >
            Upload
          </button>
          <button
            onClick={handleRemoveClick}
            className="px-3 py-1 text-sm rounded bg-red-500 hover:bg-red-600 text-white cursor-pointer"
          >
            Remove
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* User info */}
      <div className="flex flex-col min-w-0">
        <span
          className="text-white text-lg font-semibold truncate"
          title={fullName}
        >
          {fullName}
        </span>
        <span className="text-gray-400 text-sm truncate" title={userName}>
          @{userName}
        </span>
        <span className="text-gray-400 text-sm truncate" title={email}>
          {email}
        </span>
      </div>
    </div>
  );
}

export { MyProfileHeader };
