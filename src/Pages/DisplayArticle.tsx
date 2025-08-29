import { useEffect, useState } from "react";
import type { Params } from "react-router";
import { useParams } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { useAppContext } from "../context/AppContext";
import type { ArticleEntity } from "../models/entity/ArticleEntity";
import { showErrorToast } from "../utils/Toaster";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { Calendar, User as UserIcon, Clock } from "lucide-react";

function DisplayArticle() {
  const { articleId }: { articleId: Readonly<Params<string>> } = useParams();
  const [article, setArticle] = useState<ArticleEntity | null>(null);
  const { setIsLoading } = useAppContext();

  useEffect(() => {
    if (articleId) {
      fetchArticleById();
    }
  }, [articleId]);

  async function fetchArticleById() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<ArticleEntity> = (
        await API.get(`article/get-by-id/${articleId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Unknown error occurred");
        return;
      }
      setArticle(apiResponse.data);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div className="flex flex-col min-h-screen w-full h-full bg-neutral-900 text-white p-8 overflow-y-auto">
        {article && (
          <div className="max-w-4xl mx-auto w-full bg-neutral-800 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-indigo-400">
              {article.title}
            </h1>

            {/* Abstract */}
            <p className="text-gray-300 italic">{article.abstract}</p>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />{" "}
                {article.author?.userName ?? "-"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Planned:{" "}
                {new Date(article.plannedPublishDate).toLocaleDateString(
                  "tr-TR"
                )}
              </span>

              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Created:{" "}
                {new Date(article.createdAt).toLocaleDateString("tr-TR")}
              </span>
              {article.updatedAt && (
                <span className="flex items-center gap-2 col-span-2">
                  <Clock className="w-4 h-4" /> Updated:{" "}
                  {new Date(article.updatedAt).toLocaleDateString("tr-TR")}
                </span>
              )}
            </div>

            {/* Full Text (HTML from TinyMCE) */}
            <div className="prose prose-invert max-w-none bg-neutral-700 p-6 rounded-xl border border-neutral-600">
              <div dangerouslySetInnerHTML={{ __html: article.fullText }} />
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}

export { DisplayArticle };
