import React from "react";
import { Button } from "../../ui/components/Button";
import {
  FeatherBookMarked,
  FeatherMail,
  FeatherPen,
  FeatherPlusCircle,
  FeatherText,
} from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { useNavigate } from "react-router";
import { FeatherHome } from "@subframe/core";
import { FeatherEdit } from "@subframe/core";
import { useAppContext } from "../../context/AppContext";
import { showErrorToast } from "../../utils/Toaster";
import { API } from "../../utils/API";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import ProfileImageContainer from "../common/ProfileImageContainer";

function Sidepanel() {
  const navigation = useNavigate();
  const { setIsLoading, setProfile, setIsLoggedIn, profile } = useAppContext();

  async function handleLogout() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<unknown> = (await API.post("/auth/logout"))
        .data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Logout failed");
        return;
      }

      navigation("/login");

      // clear state
      setProfile(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.log(error);
      showErrorToast("Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-64 h-full flex-none flex-col items-start gap-6 self-stretch border-r border-solid border-neutral-border bg-default-background px-4 py-6">
      <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border pb-6">
        <ProfileImageContainer
          customStyle={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            overflow: "hidden",
          }}
          profileImagePath={`${
            profile?.id
              ? import.meta.env.VITE_API_BASE_URL
              : "/default-profile.png"
          }/client/get-profile-image/${profile?.id}`}
          expandOnClick={true}
        />

        <div className="flex grow shrink-0 basis-0 flex-col items-start">
          <span className="text-body-bold font-body-bold text-default-font">
            {profile?.firstName}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            @{profile?.userName}
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherHome />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home");
          }}
        >
          Home
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherPlusCircle />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/create-pen");
          }}
        >
          Create Pen
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherSearch />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/search-pen");
          }}
        >
          Search Pens
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherUsers />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/search-profile");
          }}
        >
          Search Users
        </Button>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherUser />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/my-profile");
          }}
        >
          Profile
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherSettings />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
          }}
        >
          Settings
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherEdit />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            navigation("/register");
          }}
        >
          Register
        </Button>

        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherMail />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/follow-request");
          }}
        >
          Follow Requests
        </Button>

        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherPen />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/create-article");
          }}
        >
          Create Article
        </Button>

        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherSearch />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/discover-articles");
          }}
        >
          Discover Articles
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherBookMarked />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/bookmarks");
          }}
        >
          Bookmarks
        </Button>

        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherText />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            navigation("/home/chat");
          }}
        >
          Chat
        </Button>
      </div>
      <Button
        className="h-8 w-full flex-none"
        variant="neutral-tertiary"
        icon={<FeatherLogOut />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          handleLogout();
        }}
      >
        Log out
      </Button>
    </div>
  );
}

export { Sidepanel };
