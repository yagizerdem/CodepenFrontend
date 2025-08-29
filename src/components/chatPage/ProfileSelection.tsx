import { Fragment } from "react/jsx-runtime";
import type { ApplicationUserEntity } from "../../models/entity/ApplicationUserEntity";
import ProfileImageContainer from "../common/ProfileImageContainer";
import {
  useChatContext,
  type UserListPanelMode,
} from "../../context/ChatContext";
import { useState } from "react";
import { Button } from "../../ui";
import { FeatherMoreHorizontal } from "@subframe/core";
import { useAppContext } from "../../context/AppContext";

function ProfileSelection() {
  const {
    followers,
    following,
    userListPanelMode,
    fetchFollowers,
    fetchFollowing,
  } = useChatContext();
  const { setIsLoading } = useAppContext();

  async function loadMore() {
    try {
      setIsLoading(true);

      if (userListPanelMode === "followers") {
        await fetchFollowers();
      }
      if (userListPanelMode === "following") {
        await fetchFollowing();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div className="w-96 h-full flex flex-col  overflow-y-auto bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 ">
        <SidebarTabs />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {userListPanelMode === "followers" && <UserList users={followers} />}
          {userListPanelMode === "following" && <UserList users={following} />}
        </div>
        {/* Docked button */}
        <div className="p-3 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            className="w-full"
            icon={<FeatherMoreHorizontal />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              loadMore();
            }}
          >
            Load More
          </Button>
        </div>
      </div>
    </Fragment>
  );
}

export { ProfileSelection };

interface FollowersListProps {
  users: ApplicationUserEntity[];
}

function UserList({ users }: FollowersListProps) {
  const { setTargetProfile } = useChatContext();

  return (
    <ul className="space-y-3 w-full flex flex-col flex-1 h-full ">
      {users.length === 0 && <p className="text-gray-500">No followers yet.</p>}

      {users.map((follower) => (
        <li
          key={follower.id}
          className="flex items-center gap-3 p-3 w-full bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700"
        >
          {/* Profile Picture */}
          <ProfileImageContainer
            customStyle={{
              width: "65px",
              height: "65px",
              borderRadius: "50%",
              overflow: "hidden",
            }}
            profileImagePath={`${
              follower?.id
                ? import.meta.env.VITE_API_BASE_URL
                : "/default-profile.png"
            }/client/get-profile-image/${follower?.id}`}
            expandOnClick={true}
          />

          {/* User Info */}
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {follower.fullName}
            </p>
            <p className="text-sm text-gray-500">
              @{follower.userName ?? "no-username"}
            </p>
            <p className="text-sm text-gray-400">
              {follower.email ?? "no-email"}
            </p>
            <span
              onMouseUp={() => setTargetProfile(follower)}
              className="text-blue-200 cursor-pointer underline underline-offset-8 text-sm hover:text-blue-300"
            >
              select profile
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SidebarTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = ["Followers", "Following", "Latest Contacts"];
  const { setUserListPanelMode } = useChatContext();

  return (
    <Fragment>
      <div className="relative flex w-full">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => {
              setActiveIndex(i);
              setUserListPanelMode(tab.toLowerCase() as UserListPanelMode);
            }}
            className={`flex-1 py-2 cursor-pointer text-center hover:text-blue-300 ${
              activeIndex === i ? "text-blue-400 font-semibold" : "text-white"
            }`}
          >
            {tab}
          </button>
        ))}

        <span
          className="absolute bottom-0 h-[2px] bg-blue-400 transition-all duration-300"
          style={{
            width: `${100 / tabs.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
      </div>
    </Fragment>
  );
}
