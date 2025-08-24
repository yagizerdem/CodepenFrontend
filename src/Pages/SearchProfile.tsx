import { useEffect, useState } from "react";
import { useDebounce } from "../hook/useDebounce";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { useAppContext } from "../context/AppContext";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import SubframeCore, {
  FeatherChevronDown,
  FeatherMail,
  FeatherPlus,
  FeatherUser,
  FeatherUserCheck,
} from "@subframe/core";
import { DropdownMenu } from "../ui/components/DropdownMenu";
import { Button } from "../ui";
import ProfileImageContainer from "../components/common/ProfileImageContainer";

type SearchMode = "UserName" | "FullName" | "Email";
const limit = 50;

function SearchProfilePage() {
  const { setIsLoading } = useAppContext();
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 300);
  const [searchMode, setSearchMode] = useState<SearchMode>("UserName");
  const [profiles, setProfiles] = useState<ApplicationUserEntity[]>([]);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setProfiles([]);
      setPage(1);
      fetchProfile(limit, 1);
    }
  }, [debouncedQuery]);

  async function fetchProfile(limit: number, page: number) {
    try {
      setIsLoading(true);
      const _query = debouncedQuery.trim();

      let url = "/client/get-users";
      if (searchMode == "UserName") {
        url += `?userName=${_query}`;
      }
      if (searchMode == "FullName") {
        url += `?fullName=${_query}`;
      }
      if (searchMode == "Email") {
        url += `?email=${_query}`;
      }

      url += `&pageSize=${limit}&page=${page}`;

      const apiResponse: ApiResponse<ApplicationUserEntity[]> = (
        await API.get(url)
      ).data;

      console.log(apiResponse);

      if (!apiResponse.success) {
        showSuccessToast(apiResponse.message || "Fetch failed");
        return;
      }

      setProfiles((prev) => [...prev, ...apiResponse.data]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMore() {
    if (profiles.length > 0) {
      await fetchProfile(limit, page + 1);
      setPage((prev) => prev + 1);
    } else {
      showErrorToast("Enter text to fetch more profiles");
    }
  }

  async function refresh() {
    setQuery("");
    setProfiles([]);
    setPage(1);
  }

  return (
    <div className="flex flex-1 bg-[#272822] w-full h-full flex-col">
      <div className=" mx-auto my-4 flex flex-row h-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter text..."
          className="block w-96! rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
           focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <div className="mx-3.5">
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                variant="neutral-secondary"
                iconRight={<FeatherChevronDown />}
              >
                {searchMode ? (
                  <span>{searchMode}</span>
                ) : (
                  <span>Select Field</span>
                )}
              </Button>
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="start"
                sideOffset={4}
                asChild={true}
              >
                <DropdownMenu>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherUser />}
                    onSelect={() => {
                      setSearchMode("UserName");
                      refresh();
                    }}
                  >
                    Username
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherUserCheck />}
                    onSelect={() => {
                      setSearchMode("FullName");
                      refresh();
                    }}
                  >
                    Full Name
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherMail />}
                    onSelect={() => {
                      setSearchMode("Email");
                      refresh();
                    }}
                  >
                    Email
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>

      <ul className="flex flex-1 overflow-y-scroll flex-col ">
        {profiles.map((user) => (
          <UserListItem key={user.id} user={user} />
        ))}
      </ul>

      <Button
        icon={<FeatherPlus />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          loadMore();
        }}
      >
        Load More
      </Button>
    </div>
  );
}

export { SearchProfilePage };

type Props = {
  user: ApplicationUserEntity;
};

const UserListItem: React.FC<Props> = ({ user }) => {
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
          <p className="text-sm font-medium text-gray-900 truncate">
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
    </div>
  );
};
