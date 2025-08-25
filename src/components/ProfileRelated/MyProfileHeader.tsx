import { useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import ProfileImageContainer from "../common/ProfileImageContainer";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import { API } from "../../utils/API";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";
import type { ApplicationUserEntity } from "../../models/entity/ApplicationUserEntity";
import Popup from "reactjs-popup";
import { Button } from "../../ui";
import { FeatherCheck, FeatherEdit2, FeatherX } from "@subframe/core";
import { PinturaEditor } from "@pqina/react-pintura";
import { getEditorDefaults } from "@pqina/pintura";
import { flash } from "../../utils/FlashEffect";

function MyProfileHeader() {
  const { profile, setIsLoading, setProfile } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showImgEditor, setShowImgEditor] = useState<boolean>(false);

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
      setSelectedFile(file);
      setShowPreview(true);
    }
    event.target.value = "";
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

  async function uploadProfilePicture(file: File) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("File", file);

      const apiResponse: ApiResponse<ApplicationUserEntity> = (
        await API.post("/client/upload-profile-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;

      console.log(apiResponse);

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occured");
        const errors = apiResponse.errors.join("\n").trim();
        if (errors) showErrorToast(errors);
        return;
      }

      if (profile) {
        setProfile({
          ...profile,
          profilePicture: apiResponse.data.profilePicture,
          profilePictureId: apiResponse.data.profilePictureId,
        });
      }

      showSuccessToast("profile image uploaded successfully");
      setShowPreview(false);
      setSelectedFile(null);
      setShowImgEditor(false);
      setTimeout(() => {
        window.location.reload();
        flash();
      }, 200);
    } catch (error) {
      console.log(error);
      showErrorToast("An error occurred while uploading the profile picture.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-fit p-7 flex items-center gap-6">
      {showImgEditor && selectedFile && (
        <div className="w-screen h-screen bg-white absolute left-0 top-0 z-50">
          <PinturaEditor
            {...getEditorDefaults()}
            src={selectedFile ? URL.createObjectURL(selectedFile) : ""}
            onProcess={({ dest }) => {
              setShowImgEditor(false);
              uploadProfilePicture(dest);
            }}
          />
        </div>
      )}

      <Popup
        open={showPreview}
        onClose={() => {
          setShowPreview(false);
        }}
        modal
        nested
        lockScroll
        contentStyle={{
          background: "#1e1e1e",
          color: "#f1f1f1",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
        overlayStyle={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div className="flex flex-col  gap-4">
          <div className="text-left ">Preview : </div>
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : ""}
            alt="Profile Preview"
            className="mx-auto block w-48 h-48 object-cover rounded-full border-4 border-blue-500"
          />
          <hr className="w-full border-gray-600" />
          <div className="flex flex-row w-96 justify-between gap-4  mx-auto">
            <Button
              className="hover:bg-success-700:hover bg-success-600 text-white"
              icon={<FeatherCheck />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                if (selectedFile) {
                  uploadProfilePicture(selectedFile);
                }
              }}
            >
              Approve
            </Button>
            <Button
              variant="destructive-primary"
              icon={<FeatherX />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                setShowPreview(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              icon={<FeatherEdit2 />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                setShowImgEditor(true);
                setShowPreview(false);
              }}
            >
              Edit
            </Button>
          </div>
        </div>
      </Popup>

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
