import { FeatherUpload } from "@subframe/core";
import { Button } from "../../ui";
import { Fragment, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Popup from "reactjs-popup";
import type { PenEntity } from "../../models/entity/PenEntity";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import { API } from "../../utils/API";

function MigrateButton({
  pen,
  onSuccessfullMigration,
}: {
  pen: PenEntity | null;
  onSuccessfullMigration: () => void;
}) {
  const { setIsLoading } = useAppContext();
  const [showPopup, setShowPopup] = useState(false);

  async function handleMigration() {
    try {
      setIsLoading(true);
      if (!pen) {
        showErrorToast("No pen found");
        return;
      }

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/pen/migrate-version/${pen.id}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occrued");
        return;
      }

      showSuccessToast(apiResponse.message || "Migration successful");
      onSuccessfullMigration();
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <Popup
        open={showPopup}
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
            Migrate to new version {pen?.version + 1}
          </h3>
          <p>Current version is : {pen?.version}</p>

          <hr style={{ marginBottom: "1rem", borderColor: "#444" }} />

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
                handleMigration();
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "white",
                borderRadius: "0.375rem",
                cursor: "pointer",
              }}
            >
              Migrate
            </button>
          </div>
        </div>
      </Popup>

      <Button
        icon={<FeatherUpload />}
        onMouseUp={(event: React.MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          setShowPopup(true);
        }}
      >
        Migrate to new version
      </Button>
    </Fragment>
  );
}

export { MigrateButton };
