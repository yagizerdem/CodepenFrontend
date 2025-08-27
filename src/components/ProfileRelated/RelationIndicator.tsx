import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../../context/AppContext";
import { useEffect, useState } from "react";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import { API } from "../../utils/API";
import Popup from "reactjs-popup";
import { showErrorToast } from "../../utils/Toaster";
import { Button } from "../../ui";
import { FeatherUser } from "@subframe/core";
import ProfileImageContainer from "../common/ProfileImageContainer";
import { useNavigate } from "react-router";
import type { ApplicationUserEntity } from "../../models/entity/ApplicationUserEntity";

const limit = 50;

function RelationIndicator({ userId }: { userId: string }) {
  const { setIsLoading } = useAppContext();

  // following realted
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [showFollowingPopup, setShowFollowingPopup] = useState<boolean>(false);
  const [followingPage, setFollowingPage] = useState<number>(1);
  const [followings, setFollowings] = useState<ApplicationUserEntity[]>([]);
  const [followingsFullyFetched, setFollowingsFullyFetched] =
    useState<boolean>(false);

  // follower realted
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [showFollowerPopup, setShowFollowerPopup] = useState<boolean>(false);
  const [followerPage, setFollowerPage] = useState<number>(1);
  const [followers, setFollowers] = useState<ApplicationUserEntity[]>([]);
  const [followersFullyFetched, setFollowersFullyFetched] =
    useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      fetchFollowerAndFollowingCount();
    }
  }, [userId]);

  async function fetchFollowerAndFollowingCount() {
    try {
      const apiResponse: ApiResponse<object> = (
        await API.get(`/client/get-follower-following-count/${userId}`)
      ).data;

      if (!apiResponse.success) {
        return;
      }

      const { followerCount, followingCount } = apiResponse.data as {
        followerCount: number;
        followingCount: number;
      };

      setFollowerCount(followerCount);
      setFollowingCount(followingCount);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchFollowers() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<ApplicationUserEntity[]> = (
        await API.get(
          `/relation/get-followers/${userId}?page=${followerPage}&pageSize=${limit}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(
          apiResponse.message ||
            "unknown error occured while fetching followers"
        );
        return;
      }

      setFollowersFullyFetched(apiResponse.data.length < limit);
      setFollowers((prev) => [...prev, ...apiResponse.data]);
      setFollowerPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured while fetching followers");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFollowings() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<ApplicationUserEntity[]> = (
        await API.get(
          `/relation/get-followings/${userId}?page=${followingPage}&pageSize=${limit}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(
          apiResponse.message ||
            "unknown error occured while fetching followings"
        );
        return;
      }

      console.log(apiResponse, "follwings fetch");

      setFollowingsFullyFetched(apiResponse.data.length < limit);
      setFollowings((prev) => [...prev, ...apiResponse.data]);
      setFollowingPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured while fetching followings");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      {/* follower popup  */}
      <Popup
        open={showFollowerPopup}
        onClose={() => {
          setShowFollowerPopup(false);
          setFollowerPage(1);
          setFollowers([]);
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
        <div className="max-h-100 overflow-y-auto ">
          <ul>
            {followers.map((follower) => (
              <UserListItem key={follower.id} user={follower} />
            ))}
          </ul>
        </div>
        {!followersFullyFetched && (
          <Button
            icon={<FeatherUser />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              fetchFollowers();
            }}
            style={{
              margin: "auto",
              marginTop: "2rem",
            }}
          >
            Load More
          </Button>
        )}
      </Popup>

      {/* following popup */}

      <Popup
        open={showFollowingPopup}
        onClose={() => {
          setShowFollowingPopup(false);
          setFollowingPage(1);
          setFollowings([]);
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
        <div className="max-h-100 overflow-y-auto ">
          <ul>
            {followings.map((following) => (
              <UserListItem key={following.id} user={following} />
            ))}
          </ul>
        </div>
        {!followingsFullyFetched && (
          <Button
            icon={<FeatherUser />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              fetchFollowings();
            }}
            style={{
              margin: "auto",
              marginTop: "2rem",
            }}
          >
            Load More
          </Button>
        )}
      </Popup>

      <div className="flex flex-row gap-4 text-white">
        <div>
          <span className="font-bold">{followerCount}</span>
          <span
            className="cursor-pointer"
            onMouseUp={() => {
              setShowFollowerPopup(true);
              fetchFollowers();
            }}
          >
            {" "}
            Followers
          </span>
        </div>
        <div>
          <span className="font-bold">{followingCount}</span>
          <span
            className="cursor-pointer"
            onMouseUp={() => {
              setShowFollowingPopup(true);
              fetchFollowings();
            }}
          >
            {" "}
            Following
          </span>
        </div>
      </div>
    </Fragment>
  );
}

const UserListItem: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <ProfileImageContainer
        customStyle={{
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          overflow: "hidden",
        }}
        profileImagePath={`${
          user?.id ? import.meta.env.VITE_API_BASE_URL : "/default-profile.png"
        }/client/get-profile-image/${user?.id}`}
        expandOnClick={true}
      />

      {/* Right side user info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-400 truncate ">
            {user.fullName}
          </p>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              user.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.status}
          </span>
        </div>

        <p className="text-sm text-gray-500 truncate">
          @{user.userName ?? "no-username"}
        </p>
        <p className="text-sm text-gray-500 truncate">{user.email}</p>
      </div>

      <Button
        variant="brand-secondary"
        icon={<FeatherUser />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          navigate(`/home/others-profile/${user.id}`);
        }}
      >
        Profile
      </Button>
    </div>
  );
};

export { RelationIndicator };
