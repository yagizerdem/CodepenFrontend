import { FeatherUpload } from "@subframe/core";
import type { PenEntity } from "../../models/entity/PenEntity";
import { Button } from "../../ui";
import { useAppContext } from "../../context/AppContext";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";
import { Fragment, useEffect, useState } from "react";
import Popup from "reactjs-popup";
import { API } from "../../utils/API";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import type { UpdatePenDTO } from "../../models/dto/UpdatePenDTO";

function UpdateButton({
  pen,
  onSuccessfulUpdate,
}: {
  pen: PenEntity | null;
  onSuccessfulUpdate: () => void;
}) {
  const { setIsLoading } = useAppContext();
  const [showPopUp, setShowPopup] = useState(false);
  const [title, setTitle] = useState<string>(pen?.title || "");
  const [description, setDescription] = useState<string>(
    pen?.description || ""
  );

  async function handleUpdate() {
    try {
      setIsLoading(true);
      if (!pen) {
        showErrorToast("No pen selected");
        return;
      }

      const dto: UpdatePenDTO = {
        description: description || pen.description,
        title: title || pen.title,
        html: pen.html,
        css: pen.css,
        js: pen.js,
      };

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/pen/update/${pen.id}`, dto)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occurred");
        return;
      }

      onSuccessfulUpdate();
      showSuccessToast(apiResponse.message || "Pen updated successfully");
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occurred");
    } finally {
      setIsLoading(false);
    }
    if (!pen) return;
    console.log("Updating pen:", pen);
  }

  useEffect(() => {
    setTitle(pen?.title || "");
    setDescription(pen?.description || "");
  }, [pen]);

  return (
    <Fragment>
      <Popup
        open={showPopUp}
        onClose={() => setShowPopup(false)}
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
              marginBottom: "1rem",
            }}
          >
            Update Pen
          </h3>

          <hr style={{ marginBottom: "1rem", borderColor: "#444" }} />

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid #444",
              background: "#111",
              color: "#f1f1f1",
            }}
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              height: "80px",
              marginBottom: "1rem",
              borderRadius: "0.375rem",
              border: "1px solid #444",
              background: "#111",
              color: "#f1f1f1",
              resize: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              onMouseUp={() => {
                setShowPopup(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onMouseUp={() => {
                setShowPopup(false);
                handleUpdate();
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "white",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Update{" "}
            </button>
          </div>
        </div>
      </Popup>
      <Button
        className="hover:bg-yellow-600:hover bg-yellow-500 text-white"
        icon={<FeatherUpload />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          setShowPopup(true);
        }}
      >
        Update
      </Button>
    </Fragment>
  );
}

export { UpdateButton };
