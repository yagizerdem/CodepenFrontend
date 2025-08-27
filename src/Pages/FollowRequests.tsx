import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import type { FollowRequest } from "../models/entity/FollowRequest";
import { useAppContext } from "../context/AppContext";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "../utils/Toaster";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { Button } from "../ui";
import {
  FeatherCheck,
  FeatherPlus,
  FeatherUser,
  FeatherX,
} from "@subframe/core";
import ProfileImageContainer from "../components/common/ProfileImageContainer";
import { useNavigate } from "react-router";

const limit = 20;
function FollowRequestsPage() {
  const [page, setPage] = useState(1);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const { setIsLoading, profile } = useAppContext();
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    if (profile) {
      load(); // inital fetch
    }
  }, [profile]);

  async function load() {
    try {
      setIsLoading(true);
      const apiResponse: ApiResponse<FollowRequest[]> = (
        await API.get(
          `/relation/get-pending-follow-requests?pageSize=${limit}&page=${page}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(
          apiResponse.message ||
            "unknown error occured while fetching follow requests"
        );
        return;
      }

      setHasMore(apiResponse.data.length === limit);
      setFollowRequests((prev) => [...prev, ...apiResponse.data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured while loading follow requests");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div
        className="flex flex-1 flex-col bg-gray-400 h-full w-full"
        style={{
          background: "rgb(24 24 24)",
        }}
      >
        <ul className="flex flex-col flex-1 overflow-y-scroll">
          {followRequests.map((request) => (
            <FollowListItem
              key={request.id}
              request={request}
              setFollowRequests={setFollowRequests}
            />
          ))}
        </ul>
        {hasMore && (
          <Button
            icon={<FeatherPlus />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              load();
            }}
          >
            Load More
          </Button>
        )}
      </div>
    </Fragment>
  );
}

export { FollowRequestsPage };

type Props = {
  request: FollowRequest;
  setFollowRequests: React.Dispatch<React.SetStateAction<FollowRequest[]>>;
};

const FollowListItem: React.FC<Props> = ({ request, setFollowRequests }) => {
  const navigate = useNavigate();
  const { setIsLoading } = useAppContext();

  async function Reject() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/relation/reject-follow-request/${request.id}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Unknown error occurred");
        return;
      }
      // update gui
      setFollowRequests((prev) => prev.filter((req) => req.id !== request.id));

      showInfoToast(apiResponse.message || "Follow request rejected");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function Approve() {
    try {
      setIsLoading(true);
      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/relation/accept-follow-request/${request.id}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Unknown error occurred");
        return;
      }
      // update gui
      setFollowRequests((prev) => prev.filter((req) => req.id !== request.id));
      showSuccessToast(apiResponse.message || "Follow request approved");
    } catch (error) {
      console.log(error);
      showErrorToast("unknow error occureed while approving request");
    } finally {
      setIsLoading(false);
    }
  }

  const name = request.sender?.fullName ?? "";
  const email = request.sender?.email ?? "";
  const userName = request.sender?.userName ?? "";
  const initials =
    (name &&
      name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()) ||
    (userName ? userName.slice(0, 2).toUpperCase() : "?");

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
          request?.sender?.id
            ? import.meta.env.VITE_API_BASE_URL
            : "/default-profile.png"
        }/client/get-profile-image/${request?.sender?.id}`}
        expandOnClick={true}
      />

      {/* Right side user info */}
      <div className="flex flex-1 items-start">
        <div
          className="w-96 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-5 shadow-lg backdrop-blur
               hover:border-white/20 transition-colors duration-200"
        >
          {/* Header / Avatar */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-content-center">
              <span className="text-white font-semibold">{initials}</span>
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-slate-100 truncate">
                {name || "—"}
              </div>
              <div className="text-xs text-slate-400">User</div>
            </div>
          </div>

          {/* Body */}
          <div className="mt-4 space-y-2">
            <span className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              {/* <Mail className="h-4 w-4 opacity-70 group-hover:opacity-100" /> */}
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/5 text-xs">
                ✉
              </span>
              <span className="truncate">{email || "—"}</span>
            </span>

            <div className="flex items-center gap-2 text-slate-300">
              {/* <AtSign className="h-4 w-4 opacity-70" /> */}
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/5 text-xs">
                @
              </span>
              <span className="font-mono text-slate-200 truncate">
                {userName ? `@${userName}` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        className="bg-success-600 text-white"
        icon={<FeatherCheck />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          Approve();
        }}
      >
        Approve
      </Button>
      <Button
        variant="destructive-primary"
        icon={<FeatherX />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          Reject();
        }}
      >
        Reject
      </Button>
      <Button
        variant="brand-secondary"
        icon={<FeatherUser />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          navigate(`/home/others-profile/${request.sender?.id}`);
        }}
      >
        Profile
      </Button>
    </div>
  );
};
