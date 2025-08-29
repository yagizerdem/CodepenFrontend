import { useEffect, useState, Fragment } from "react";
import { useDebounce } from "../hook/useDebounce";
import { useAppContext } from "../context/AppContext";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ArticleEntity } from "../models/entity/ArticleEntity";
import { API } from "../utils/API";

import { Book, Bookmark, Calendar, Eye, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router";

const PAGE_SIZE = 10;

function DiscoverArticlesPage() {
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 500);
  const [page, setPage] = useState<number>(1);
  const { setIsLoading } = useAppContext();
  const [articles, setArticles] = useState<ArticleEntity[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      setPage(1);
      setHasMore(true);
      setArticles([]);
      await fetchArticles(1, debouncedQuery);
      setIsFirstLoad(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  async function fetchArticles(nextPage: number, search: string) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<ArticleEntity[]> = (
        await API.get(
          `/article/get-articles?pageNumber=${nextPage}&pageSize=${PAGE_SIZE}&search=${encodeURIComponent(
            search || ""
          )}&Title=${encodeURIComponent(search || "")}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Unknown error occurred");
        return;
      }

      const newItems = apiResponse.data ?? [];
      setArticles((prev) =>
        nextPage === 1 ? newItems : [...prev, ...newItems]
      );
      setHasMore(newItems.length === PAGE_SIZE);

      if (!isFirstLoad) {
        showSuccessToast(
          apiResponse.message || "Articles fetched successfully"
        );
      }

      setPage(nextPage);
    } catch (error) {
      console.error(error);
      showErrorToast("Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function bookMark(articleId: number) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/article/create-bookmark/${articleId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Unknown error occurred");
        return;
      }

      showSuccessToast(apiResponse.message || "Bookmark created successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function visibilityLabel(v: number) {
    switch (v) {
      case 0:
        return "Public";
      case 1:
        return "Private";
      case 2:
        return "Followers";
      default:
        return String(v);
    }
  }

  return (
    <Fragment>
      <div
        className="flex flex-col min-h-screen w-full"
        style={{ background: "rgb(39 40 34)" }}
      >
        {/* Search bar */}
        <div className="w-full flex justify-center py-4">
          <input
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            placeholder="Search articles…"
            className="bg-white w-96 h-9 rounded-xl px-3 outline-none ring-0 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <ul className="flex-1 overflow-y-auto max-w-4xl mx-auto px-4 pb-8 space-y-4  custom-scrollbar">
          {articles.map((a) => (
            <li
              key={a.id}
              className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                {a.coverImage && (
                  <img
                    src={a.coverImage}
                    alt={a.title}
                    className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                )}

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {a.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {a.abstract}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                      onMouseUp={() =>
                        navigate(`/home/others-profile/${a.author?.id}`)
                      }
                    >
                      <UserIcon className="w-4 h-4" />
                      {a.author?.userName ?? "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(a.plannedPublishDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {visibilityLabel(a.visibility as unknown as number)}
                    </span>
                    <span
                      onMouseUp={() => bookMark(a.id as unknown as number)}
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                    >
                      <Bookmark className="w-4 h-4" />
                      Add to collections
                    </span>
                    <span
                      onMouseUp={() =>
                        navigate(`/home/display-article/${a.id}`)
                      }
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                    >
                      <Book className="w-4 h-4" />
                      View full text
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}

          {/* No results */}
          {!isFirstLoad && articles.length === 0 && (
            <li className="text-center text-gray-300 py-12">
              results not found.
            </li>
          )}
        </ul>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchArticles(page + 1, debouncedQuery)}
              className="block w-full cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export { DiscoverArticlesPage };
