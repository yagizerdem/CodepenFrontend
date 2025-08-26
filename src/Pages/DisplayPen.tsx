import { useEffect, useReducer, useState } from "react";
import { Await, useParams, type Params } from "react-router";
import { Fragment } from "react/jsx-runtime";
import type { PenEntity } from "../models/entity/PenEntity";
import { useAppContext } from "../context/AppContext";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { API } from "../utils/API";
import { CodeEditor } from "../components/editorRelated/CodeEditor";
import { ExportButton } from "../components/update-penRelated/ExportButton";
import type { ApplicationUserEntity } from "../models/entity/ApplicationUserEntity";
import ProfileImageContainer from "../components/common/ProfileImageContainer";
import { Button } from "../ui";
import {
  FeatherHeart,
  FeatherMessageCircle,
  FeatherMoreHorizontal,
} from "@subframe/core";
import Popup from "reactjs-popup";
import type { PenCommentEntity } from "../models/entity/PenCommentEntity";

const pageSize = 50;

function codeReducer(
  state: { html: string; css: string; js: string },
  action: { type: "html" | "css" | "js"; payload: string }
) {
  switch (action.type) {
    case "html":
      return { ...state, html: action.payload };
    case "css":
      return { ...state, css: action.payload };
    case "js":
      return { ...state, js: action.payload };
    default:
      return state;
  }
}

function DisplayPen() {
  const { penId }: { penId: Readonly<Params<string>> } = useParams();
  const { setIsLoading } = useAppContext();
  const [codes, dispatchCodes] = useReducer(codeReducer, {
    html: "",
    css: "",
    js: "",
  });
  const [author, setAuthor] = useState<ApplicationUserEntity | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<PenCommentEntity[]>([]);
  const [commentsPage, setCommentsPage] = useState<number>(1);
  const [hasMoreComments, setHasMoreComments] = useState<boolean>(true);

  async function fetchPen(penId: number) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<PenEntity> = (
        await API.get(`/pen/get-pen-byid/${penId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error");
        return;
      }

      dispatchCodes({
        type: "html",
        payload: apiResponse.data.html ?? ("" as string),
      });
      dispatchCodes({
        type: "css",
        payload: apiResponse.data.css ?? ("" as string),
      });
      dispatchCodes({
        type: "js",
        payload: apiResponse.data.js ?? ("" as string),
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fetch pen details");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAuthor(penId: number) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<ApplicationUserEntity> = (
        await API.get(`/pen/get-author-bypenid/${penId}`)
      ).data;

      console.log(apiResponse);

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error");
        return;
      }

      setAuthor(apiResponse.data);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fetch author details");
    } finally {
      setIsLoading(false);
    }
  }

  async function LikePen(penId: number) {
    try {
      setIsLoading(true);

      const apiResponse = (await API.post(`/pen/like-pen/${penId}`)).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Failed to like pen");
        return;
      }

      showSuccessToast(apiResponse.message || "Pen liked successfully");
      setTotalLikes((prev) => prev + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function UnlikePen(penId: number) {
    try {
      setIsLoading(true);

      const apiResponse = (await API.post(`/pen/unlike-pen/${penId}`)).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "Failed to unlike pen");
        return;
      }

      showSuccessToast(apiResponse.message || "Pen unliked successfully");
      setTotalLikes((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTotalLikes(penId: number) {
    try {
      setIsLoading(true);
      const apiResponse: ApiResponse<number> = (
        await API.get(`/pen/get-total-likes-ofpen/${penId}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error");
        return;
      }

      setTotalLikes(apiResponse.data);
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fetch total likes");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchComments(penId: number, limit: number, page: number) {
    try {
      if (!hasMoreComments) {
        showErrorToast("No more comments to load");
        return;
      }

      setIsLoading(true);

      const apiResponse: ApiResponse<PenCommentEntity[]> = (
        await API.get(
          `/penComment/get-comments?penId=${penId}&pageSize=${limit}&page=${page}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error");
        return;
      }

      setHasMoreComments(apiResponse.data.length === limit);

      setComments((prev) => [...prev, ...apiResponse.data]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (penId) {
      fetchPen(Number(penId));
      fetchAuthor(Number(penId));
      fetchTotalLikes(Number(penId));
    }
  }, [penId]);

  console.log(comments);

  return (
    <Fragment>
      <Popup
        open={showComments}
        onClose={() => {
          setShowComments(false);
          setComments([]);
          setCommentsPage(1);
          setHasMoreComments(true);
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
          width: "50%",
          minHeight: "700px",
          minWidth: "1200px",
          height: "50%",
        }}
        overlayStyle={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div className="space-y-4 overflow-y-auto flex-1 flex-col h-full">
          {comments.map((comment) => {
            const user = comment.user;
            return (
              <div
                key={comment.id}
                className="flex items-start space-x-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left side: Profile image + user info */}
                <div className="flex-shrink-0">
                  <ProfileImageContainer
                    customStyle={{
                      width: "65px",
                      height: "65px",
                      borderRadius: "50%",
                      overflow: "hidden",
                    }}
                    profileImagePath={`${
                      comment.user?.id
                        ? import.meta.env.VITE_API_BASE_URL
                        : "/default-profile.png"
                    }/client/get-profile-image/${comment.user?.id}`}
                    expandOnClick={true}
                  />
                </div>

                {/* Right side: Username, email, content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800">
                        {user?.userName ?? "Unknown User"}
                      </span>
                      {user?.email && (
                        <span className="ml-2 text-sm text-gray-500">
                          {user.email}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
        {hasMoreComments && (
          <div className="flex items-center justify-center align-middle my-5 mx-auto">
            <Button
              icon={<FeatherMoreHorizontal />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                fetchComments(Number(penId), pageSize, commentsPage + 1);
                setCommentsPage((prev) => prev + 1);
              }}
            >
              Load More
            </Button>
          </div>
        )}
      </Popup>

      <div
        className="w-full h-10 flex  items-center border-b justify-between border-gray-200 px-2 gap-2"
        style={{ background: "rgb(39 40 34)" }}
      >
        <div className="flex flex-row items-center justify-center">
          <ProfileImageContainer
            customStyle={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              overflow: "hidden",
            }}
            profileImagePath={`${
              author?.id
                ? import.meta.env.VITE_API_BASE_URL
                : "/default-profile.png"
            }/client/get-profile-image/${author?.id}`}
            expandOnClick={true}
          />
          <div className="flex flex-col h-full mx-2">
            <div className="text-white" style={{ fontSize: "16px" }}>
              {author?.userName}
            </div>
            <div
              className="text-gray-400 my-[-6px]"
              style={{ fontSize: "8px" }}
            >
              {author?.email}
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-1 text-white">
            <FeatherHeart className="text-body font-body text-[#ef4444ff]" />
            <label>{totalLikes}</label>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-2">
          <Button
            variant="neutral-secondary"
            icon={<FeatherMessageCircle />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setShowComments(true);
              fetchComments(Number(penId), pageSize, 1);
            }}
          >
            Comments
          </Button>

          <Button
            variant="brand-secondary"
            icon={<FeatherHeart />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              LikePen(Number(penId));
            }}
          >
            Like
          </Button>

          <Button
            variant="destructive-primary"
            icon={<FeatherHeart />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              UnlikePen(Number(penId));
            }}
          >
            Unlike
          </Button>

          <ExportButton
            cssValue={codes.css ?? ""}
            htmlValue={codes.html ?? ""}
            jsValue={codes.js ?? ""}
          />
        </div>
      </div>

      <CodeEditor
        html={codes.html}
        css={codes.css}
        js={codes.js}
        onUserEdit={() => {}}
        onHtmlChange={(html) => dispatchCodes({ type: "html", payload: html })}
        onCssChange={(css) => dispatchCodes({ type: "css", payload: css })}
        onJsChange={(js) => dispatchCodes({ type: "js", payload: js })}
      />
    </Fragment>
  );
}

export { DisplayPen };
