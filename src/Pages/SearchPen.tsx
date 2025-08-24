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
import { showErrorToast } from "../utils/Toaster";
import { PenPreviewBox } from "../components/common/PenPreviewBox";
import { useFetcher } from "react-router";

type SearchMode = "Title" | "Description" | "AuthorUserName";

const limit = 30;

function SearchPenPage() {
  const { setIsLoading } = useAppContext();
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 300);
  const [searchMode, setSearchMode] = useState<SearchMode>("Title");
  const [pens, setPens] = useState<PenEntity[]>([]);
  const [page, setPage] = useState<number>(1);

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

      const response: ApiResponse<PenEntity[]> = (await API.get(url)).data;
      if (!response.success) {
        showErrorToast(response.message || "unknown error");
        return;
      }

      setPens([...pens, ...(response.data || [])]);
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
          <div key={pen.id} className="m-4 w-80">
            <PenPreviewBox pen={pen} />
          </div>
        ))}
      </div>

      <div className="flex  flex-row justify-center align-middle items-center">
        <Button
          variant="neutral-secondary"
          icon={<FeatherChevronLeft />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          style={{
            margin: "0 10px",
          }}
        >
          Previous
        </Button>
        <Button
          variant="neutral-secondary"
          iconRight={<FeatherChevronRight />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
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
