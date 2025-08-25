import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { PenEntity } from "../models/entity/PenEntity";
import { useAppContext } from "../context/AppContext";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { API } from "../utils/API";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { CodeEditor } from "../components/editorRelated/CodeEditor";
import { ExportButton } from "../components/update-penRelated/ExportButton";
import { ImportButton } from "../components/update-penRelated/ImportButton";
import { UpdateButton } from "../components/update-penRelated/UpdateButton";
import { MigrateButton } from "../components/update-penRelated/MigrateButton";

function UpdatePen() {
  const { setIsLoading } = useAppContext();
  const { penId } = useParams<{ penId: string }>();
  const [pen, setPen] = useState<PenEntity | null>(null);

  useEffect(() => {
    if (penId) {
      fetchPen(parseInt(penId));
    }
  }, [penId]);

  async function fetchPen(id: number) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<PenEntity> = (
        await API.get(`/pen/get-pen-byid/${id}`)
      ).data;

      if (!apiResponse.data) {
        showErrorToast(apiResponse.message || "Failed to fetch pen");
        return;
      }
      setPen(apiResponse.data);
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuccessfulUpdate() {
    if (penId) {
      fetchPen(parseInt(penId));
    }
  }

  function handleSuccessfulMigration() {
    if (penId) {
      fetchPen(parseInt(penId));
    }
  }

  return (
    <div className="flex flex-1 w-full h-full flex-col">
      <div
        className="flex flex-row h-fit w-full justify-end flew-wrap gap-2 p-2    "
        style={{ background: "rgb(39 40 34)" }}
      >
        <ExportButton
          htmlValue={pen?.html ?? ""}
          cssValue={pen?.css ?? ""}
          jsValue={pen?.js ?? ""}
        />
        <ImportButton
          setHtmlValue={(newHtml) =>
            setPen((p) => (p ? { ...p, html: newHtml as string } : p))
          }
          setCssValue={(newCss) =>
            setPen((p) => (p ? { ...p, css: newCss as string } : p))
          }
          setJsValue={(newJs) =>
            setPen((p) => (p ? { ...p, js: newJs as string } : p))
          }
        />
        <UpdateButton pen={pen} onSuccessfulUpdate={handleSuccessfulUpdate} />
        <MigrateButton
          pen={pen}
          onSuccessfullMigration={handleSuccessfulMigration}
        />
      </div>
      <div className="flex-1 w-full h-full">
        <CodeEditor
          css={pen?.css ?? ""}
          html={pen?.html ?? ""}
          js={pen?.js ?? ""}
          onCssChange={(newCss) =>
            setPen((prev) => (prev ? { ...prev, css: newCss } : prev))
          }
          onHtmlChange={(newHtml) =>
            setPen((prev) => (prev ? { ...prev, html: newHtml } : prev))
          }
          onJsChange={(newJs) =>
            setPen((prev) => (prev ? { ...prev, js: newJs } : prev))
          }
          onUserEdit={() => {}}
        />
      </div>
    </div>
  );
}

export { UpdatePen };
