import { useEffect, useState } from "react";
import { useDebounce } from "../hook/useDebounce";
import { useAppContext } from "../context/AppContext";
import SubframeCore, {
  FeatherBook,
  FeatherBookMarked,
  FeatherChevronDown,
  FeatherChevronLeft,
  FeatherChevronRight,
  FeatherMail,
} from "@subframe/core";
import { DropdownMenu } from "../ui/components/DropdownMenu";
import { Button } from "../ui";
import type { PenEntity } from "../models/entity/PenEntity";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { showErrorToast, showInfoToast } from "../utils/Toaster";
import { PenPreviewBox } from "../components/common/PenPreviewBox";
import ProfileImageContainer from "../components/common/ProfileImageContainer";
import type { GetPensRespnose } from "../models/responsetype/GetPensRespnose";

type SearchMode = "Title" | "Description" | "AuthorUserName";

const limit = 30;

function SearchPenPage() {
  const { setIsLoading } = useAppContext();
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 300);
  const [searchMode, setSearchMode] = useState<SearchMode>("Title");
  const [pens, setPens] = useState<PenEntity[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalHits, setTotalHits] = useState<number>(1);

  useEffect(() => {
    if (query.trim()) {
      fetch(1, limit);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    setPage(1);
    setPens([]);
  }, [query]);

  async function fetch(page: number, limit: number) {
    try {
      setIsLoading(true);
      let url = "/pen/get-pens";
      if (searchMode == "Description") {
        url += "?Description=" + encodeURIComponent(query);
      }
      if (searchMode == "AuthorUserName") {
        url += "?AuthorUserName=" + encodeURIComponent(query);
      }
      if (searchMode == "Title") {
        url += "?Title=" + encodeURIComponent(query);
      }
      url += `&page=${page}&pageSize=${limit}`;

      const response: ApiResponse<GetPensRespnose> = (await API.get(url)).data;
      if (!response.success) {
        showErrorToast(response.message || "unknown error");
        return;
      }
      setTotalHits(response.data.totalHits || 0);

      setPens(response.data.pens);
    } catch (error) {
      console.error("Error fetching pens:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function refresh() {
    setQuery("");
    setPens([]);
    setPage(1);
  }

  async function loadPrevPage() {
    if (page > 1) {
      fetch(page - 1, limit);
      setPage((prev) => prev - 1);
    } else {
      showInfoToast("You are on the first page");
    }
  }

  async function loadNextPage() {
    const totalPages = Math.ceil(totalHits / limit);
    if (page < totalPages) {
      fetch(page + 1, limit);
      setPage((prev) => prev + 1);
    } else {
      showInfoToast("You are on the last page");
    }
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
                    icon={<FeatherBookMarked />}
                    onSelect={() => {
                      setSearchMode("Title");
                      refresh();
                    }}
                  >
                    Title
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherBook />}
                    onSelect={() => {
                      setSearchMode("Description");
                      refresh();
                    }}
                  >
                    Description
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem
                    icon={<FeatherMail />}
                    onSelect={() => {
                      setSearchMode("AuthorUserName");
                      refresh();
                    }}
                  >
                    Author Username
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap overflow-y-scroll items-center align-middle justify-center">
        {pens.map((pen: PenEntity) => (
          <div
            key={pen.id}
            className="m-4 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Preview */}
            <div className="bg-gray-50">
              <PenPreviewBox pen={pen} />
            </div>

            {/* Content */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {pen.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">
                {pen.description?.substring(0, 50)}
                {pen.description?.length &&
                  pen.description?.length > 50 &&
                  "..."}
              </p>

              <div className="mt-3 text-xs text-gray-500 space-y-1">
                <p>Created: {new Date(pen.createdAt).toLocaleDateString()}</p>
                <p>Updated: {new Date(pen.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Author Footer */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 border-t">
              {/* Avatar placeholder */}
              {pen.author.profilePictureId && (
                <ProfileImageContainer
                  customStyle={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                  profileImagePath={`${
                    import.meta.env.VITE_API_BASE_URL
                  }/client/get-profile-image/${pen.author?.id}`}
                  expandOnClick={true}
                />
              )}

              {!pen.author.profilePictureId && (
                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                  {pen.author.userName?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {pen.author.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {pen.author.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex  flex-row justify-center align-middle items-center">
        <Button
          variant="neutral-secondary"
          icon={<FeatherChevronLeft />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            loadPrevPage();
          }}
          style={{
            margin: "0 10px",
          }}
        >
          Previous
        </Button>
        <Button
          variant="neutral-secondary"
          iconRight={<FeatherChevronRight />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            loadNextPage();
          }}
          style={{
            margin: "0 10px",
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export { SearchPenPage };
