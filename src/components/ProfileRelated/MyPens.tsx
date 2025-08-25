import { Fragment, useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import type { PenEntity } from "../../models/entity/PenEntity";
import { API } from "../../utils/API";
import type { GetPensRespnose } from "../../models/responsetype/GetPensRespnose";
import { PaginationIndicator } from "../common/PaginationIndicator";
import { PenPreviewBox } from "../common/PenPreviewBox";
import { FeatherDelete, FeatherEdit } from "@subframe/core";
import { Button } from "../../ui";
import Popup from "reactjs-popup";
import { useNavigate } from "react-router";

const limit = 9;

function MyPens() {
  const { setIsLoading, profile } = useAppContext();
  const [page, setPage] = useState<number>(1);
  const [isPenFetching, setIsPenFetching] = useState<boolean>(false);
  const [pens, setPens] = useState<PenEntity[]>([]);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [showDeletePenPopup, setShowDeletePenPopup] = useState<boolean>(false);
  const [targetPen, setTargetPen] = useState<PenEntity | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.userName) {
      fetch(1, limit);
      setPage((prev) => prev + 1);
    }
  }, [profile?.userName]);

  async function fetch(page: number, limit: number) {
    try {
      setIsPenFetching(true);
      const apiResponse: ApiResponse<GetPensRespnose> = (
        await API.get(
          `/pen/get-pens?pageSize=${limit}&page=${page}&AuthorUserName=${profile?.userName}`
        )
      ).data;

      if (!apiResponse.success) {
        showErrorToast(
          apiResponse.message || "error occured while fetching pens"
        );
        return;
      }

      setPens(apiResponse.data.pens || []);
      setTotalPage(Math.ceil(apiResponse.data.totalHits / limit));
      console.log(Math.ceil(apiResponse.data.totalHits / limit));
    } catch (err) {
      console.log(err);
      showErrorToast("error occured while fetching pens");
    } finally {
      setIsPenFetching(false);
    }
  }

  async function deletePen() {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/pen/remove/${targetPen?.id}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(
          apiResponse.message || "error occured while deleting pen"
        );
        return;
      }

      showSuccessToast("pen deleted successfully");
      setPens((prev) => prev.filter((p) => p.id !== targetPen?.id));
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
      setTargetPen(null);
      setShowDeletePenPopup(false);
    }
  }

  useEffect(() => {
    setIsLoading(isPenFetching);
  }, [isPenFetching, setIsLoading]);

  return (
    <Fragment>
      <Popup
        open={showDeletePenPopup}
        onClose={() => setShowDeletePenPopup(false)}
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
        <div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
              color: "#f87171",
            }}
          >
            This action is not retrievable
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
            Clearing will permanently delete your code.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => {
                setShowDeletePenPopup(false);
                setTargetPen(null);
              }}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#4B5563",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
                cursor: "pointer",
                margin: "0 0.5rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => deletePen()}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Remove Pen
            </button>
          </div>
        </div>
      </Popup>

      <div className="w-full h-full flex flex-col  overflow-y-scroll">
        <div className="flex flex-wrap items-center justify-center align-middle gap-2.5">
          {pens.map((p) => {
            return (
              <div className="relative border border-solid border-gray-50 p-2 rounded-2xl w-96 ">
                <div className="absolute top-0 right-0 w-full flex flex-row justify-end ">
                  <Button
                    className="hover:bg-success-700:hover bg-success-600 text-white mx-1"
                    icon={<FeatherEdit />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      navigate(`/home/update-pen/${p.id}`);
                    }}
                  ></Button>
                  <Button
                    className="hover:bg-success-700:hover bg-red-500 text-white mx-1"
                    icon={<FeatherDelete />}
                    onMouseUp={(event: React.MouseEvent<HTMLButtonElement>) => {
                      setTargetPen(p);
                      setShowDeletePenPopup(true);
                    }}
                  ></Button>
                </div>

                <PenPreviewBox key={p.id} pen={p} />
                <p className="text-white font-bold">{p.title}</p>
                <div className="text-white  text-wrap h-fit break-words">
                  {p.description?.substring(0, 400)}
                  {p.description && p.description.length > 100 && "..."}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center mx-auto">
          <PaginationIndicator
            totalPage={totalPage}
            currentPage={page}
            onSelectPage={(page) => {
              setPage(page);
              fetch(page, limit);
            }}
          />
        </div>
      </div>
    </Fragment>
  );
}

export { MyPens };
