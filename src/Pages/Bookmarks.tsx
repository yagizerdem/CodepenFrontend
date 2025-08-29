import { useEffect, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { API } from "../utils/API";
import { useAppContext } from "../context/AppContext";
import { Book, Calendar, Eye, Trash, UserIcon } from "lucide-react";
import { useNavigate } from "react-router";
import type { BookMark } from "../models/entity/BookMark";
import { Button } from "../ui";
import { FeatherMoreHorizontal } from "@subframe/core";

const pageSize = 10;

function Bookmarks() {
  const [bookMarks, setBookMarks] = useState<BookMark[]>([]);
  const { setIsLoading } = useAppContext();
  const [page, setPage] = useState<number>(1);
  const navigate = useNavigate();
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    const run = async () => {
      setPage(1);
      setHasMore(true);
      setBookMarks([]);
      await fetchBookmarkedArticles();
      setIsFirstLoad(false);
    };
    run();
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function fetchBookmarkedArticles() {
    try {
      setIsLoading(true);

      const response: ApiResponse<BookMark[]> = (
        await API.get(
          `/article/get-bookmarks?page=${page}&pageSize=${pageSize}`
        )
      ).data;

      console.log(response);

      if (!response.success) {
        showErrorToast(
          response.message || "Failed to fetch bookmarked articles"
        );
        return;
      }

      setHasMore(response.data.length === pageSize);

      setBookMarks((prev) => [...prev, ...response.data]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fetch bookmarked articles");
    } finally {
      setIsLoading(false);
    }
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

  async function removeBookmark(articleId: string) {
    try {
      setIsLoading(true);
      const response: ApiResponse<void> = (
        await API.post(`article/remove-bookmark/${articleId}`)
      ).data;

      if (!response.success) {
        showErrorToast(response.message || "Failed to remove bookmark");
        return;
      }

      setBookMarks((prev) => prev.filter((b) => b.articleId !== articleId));
      showSuccessToast("bookmarked removed");
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to remove bookmark");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ background: "rgb(39 40 34)" }}
      >
        <ul className="flex-1 overflow-y-auto max-w-4xl mx-auto px-4 pb-8 space-y-4  custom-scrollbar">
          {bookMarks.map((b) => (
            <li
              key={b.id}
              className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-start gap-4">
                {b.article.coverImage && (
                  <img
                    src={b.article.coverImage}
                    alt={b.article.title}
                    className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                  />
                )}

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {b.article.title}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {b.article.abstract}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                      onMouseUp={() =>
                        navigate(`/home/others-profile/${b.article.author?.id}`)
                      }
                    >
                      <UserIcon className="w-4 h-4" />
                      {b.article.author?.userName ?? "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(b.article.plannedPublishDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {visibilityLabel(
                        b.article.visibility as unknown as number
                      )}
                    </span>

                    <span
                      onMouseUp={() =>
                        navigate(`/home/display-article/${b.article.id}`)
                      }
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                    >
                      <Book className="w-4 h-4" />
                      View full text
                    </span>

                    <span
                      onMouseUp={() => removeBookmark(b.article.id)}
                      className="flex items-center gap-1 cursor-pointer hover:underline hover:text-blue-200"
                    >
                      <Trash className="w-4 h-4" />
                      Remove Bookmark
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}

          {/* No results */}
          {!isFirstLoad && bookMarks.length === 0 && (
            <li className="text-center text-gray-300 py-12">
              results not found.
            </li>
          )}
        </ul>

        {hasMore && (
          <Button
            icon={<FeatherMoreHorizontal />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              fetchBookmarkedArticles();
            }}
          >
            Load More
          </Button>
        )}
      </div>
    </Fragment>
  );
}
export { Bookmarks };
