import { Fragment, useEffect, useState } from "react";
import { useEnsureLoggedIn } from "../hook/ensureLoggedIn";
import { useAppContext } from "../context/AppContext";
import { CodeEditor } from "../components/editorRelated/CodeEditor";
import Popup from "reactjs-popup";
import { Button } from "../ui";
import {
  FeatherDownload,
  FeatherRefreshCw,
  FeatherSave,
  FeatherUpload,
  FeatherX,
} from "@subframe/core";
import type { CreatePenDTO } from "../models/dto/CreatePenDTO";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { PenEntity } from "../models/entity/PenEntity";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { API } from "../utils/API";

function CreatePenPage() {
  const { setIsLoading } = useAppContext();

  const { isLoading: loggedInLoader } = useEnsureLoggedIn({
    showErrorMessage: true,
  });

  const [openLoadPopup, setOpenLoadPopup] = useState(false);
  const [clearCodePopup, setClearCodePopup] = useState(false);
  const [savePenPopup, setSavePenPopup] = useState(false);

  const [penTitle, setPenTitle] = useState("");
  const [penDescription, setPenDescription] = useState("");

  const [htmlValue, setHtmlValue] = useState("");
  const [jsValue, setJsValue] = useState("");
  const [cssValue, setCssValue] = useState("");

  function saveCodeToLocalStorage(html, css, js, saveEmpty = false) {
    setTimeout(() => {
      if (html || saveEmpty)
        window.localStorage.setItem("createpen-html", html);
      if (css || saveEmpty) window.localStorage.setItem("createpen-css", css);
      if (js || saveEmpty) window.localStorage.setItem("createpen-js", js);
    }, 500);
  }

  function loadFromLocalStorage() {
    const savedHtml = window.localStorage.getItem("createpen-html");
    const savedCss = window.localStorage.getItem("createpen-css");
    const savedJs = window.localStorage.getItem("createpen-js");

    if (savedHtml !== null) setHtmlValue(savedHtml);
    if (savedCss !== null) setCssValue(savedCss);
    if (savedJs !== null) setJsValue(savedJs);
  }

  function hardRefresh() {
    window.location.reload();
  }

  function exportCode() {
    const htmlBlob = new Blob([htmlValue], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    downloadFile(htmlUrl, "index.html");

    const cssBlob = new Blob([cssValue], { type: "text/css" });
    const cssUrl = URL.createObjectURL(cssBlob);
    downloadFile(cssUrl, "style.css");

    const jsBlob = new Blob([jsValue], { type: "application/javascript" });
    const jsUrl = URL.createObjectURL(jsBlob);
    downloadFile(jsUrl, "script.js");
  }
  function downloadFile(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importCode() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".html,.css,.js";

    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files) return;

      const files = Array.from(target.files);

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;

          if (file.name.endsWith(".html")) {
            setHtmlValue(content);
            saveCodeToLocalStorage(content, "", "", false);
          } else if (file.name.endsWith(".css")) {
            setCssValue(content);
            saveCodeToLocalStorage("", content, "", false);
          } else if (file.name.endsWith(".js")) {
            setJsValue(content);
            saveCodeToLocalStorage("", "", content, false);
          }
        };
        reader.readAsText(file);
      }
      // save local storage
    };

    input.click();
  }

  function clearCode() {
    setHtmlValue("");
    setCssValue("");
    setJsValue("");

    localStorage.removeItem("createpen-html");
    localStorage.removeItem("createpen-css");
    localStorage.removeItem("createpen-js");

    setClearCodePopup(false);
  }

  async function savePen() {
    try {
      setIsLoading(true);
      const payload: CreatePenDTO = {
        html: htmlValue,
        css: cssValue,
        js: jsValue,
        title: penTitle,
        description: penDescription,
      };

      const apiResponse: ApiResponse<PenEntity> = (
        await API.post("/pen/create", payload)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error");
        showErrorToast(
          apiResponse.errors.join("\n")
            ? apiResponse.errors.join("\n")
            : "unknown error"
        );
        return;
      }

      showSuccessToast(apiResponse.message || "Pen saved successfully!");
      localStorage.removeItem("createpen-html");
      localStorage.removeItem("createpen-css");
      localStorage.removeItem("createpen-js");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  // initial: varsa local storage’ı sor
  useEffect(() => {
    const savedHtml = window.localStorage.getItem("createpen-html");
    const savedCss = window.localStorage.getItem("createpen-css");
    const savedJs = window.localStorage.getItem("createpen-js");
    if (savedHtml || savedCss || savedJs) setOpenLoadPopup(true);
  }, []);

  // loader state
  useEffect(() => {
    setIsLoading(loggedInLoader);
  }, [loggedInLoader, setIsLoading]);

  return (
    <Fragment>
      {/* Toolbar */}
      <div
        className="w-full h-10 flex justify-end items-center border-b border-gray-200 px-2 gap-2"
        style={{ background: "rgb(39 40 34)" }}
      >
        <Button icon={<FeatherRefreshCw />} onClick={hardRefresh}>
          Refresh
        </Button>
        <Button
          variant="brand-secondary"
          icon={<FeatherUpload />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            importCode();
          }}
        >
          Import
        </Button>
        <Button
          variant="brand-secondary"
          icon={<FeatherDownload />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            exportCode();
          }}
        >
          Export
        </Button>
        <Button
          variant="destructive-primary"
          icon={<FeatherX />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setClearCodePopup(true);
          }}
        >
          Clear
        </Button>

        <Button
          className="hover:border-success-700:hover hover:bg-success-700:hover bg-success-600 border-success-600"
          icon={<FeatherSave />}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setSavePenPopup(true);
          }}
        >
          Save
        </Button>
      </div>

      {/* Load popup */}
      <Popup
        open={openLoadPopup}
        onClose={() => setOpenLoadPopup(false)}
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
            Saved code found
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => {
                loadFromLocalStorage();
                setOpenLoadPopup(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#16a34a",
                color: "white",
                borderRadius: "0.375rem",
              }}
            >
              Load
            </button>
            <button
              onClick={() => setOpenLoadPopup(false)}
              style={{
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "white",
                borderRadius: "0.375rem",
              }}
            >
              Skip
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("createpen-html");
                localStorage.removeItem("createpen-css");
                localStorage.removeItem("createpen-js");
                setOpenLoadPopup(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.375rem",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Popup>

      {/* Clear popup */}
      <Popup
        open={clearCodePopup}
        onClose={() => setClearCodePopup(false)}
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
              onClick={clearCode}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
              }}
            >
              Clear Code
            </button>
          </div>
        </div>
      </Popup>

      {/* Save popup */}
      <Popup
        open={savePenPopup}
        onClose={() => setSavePenPopup(false)}
        modal
        nested
        lockScroll
        contentStyle={{
          background: "#1e1e1e",
          color: "#f1f1f1",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          boxShadow: "0 8px 25px rgba(0,0,0,0.6)",
          width: "400px",
          maxWidth: "90%",
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
            Save Pen
          </h3>

          <input
            type="text"
            placeholder="Title"
            value={penTitle}
            onChange={(e) => setPenTitle(e.target.value)}
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
            value={penDescription}
            onChange={(e) => setPenDescription(e.target.value)}
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
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            <button
              onClick={() => setSavePenPopup(false)}
              style={{
                padding: "0.5rem 1rem",
                background: "#374151",
                color: "white",
                borderRadius: "0.375rem",
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                savePen();
                setSavePenPopup(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#16a34a",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Popup>

      <CodeEditor
        html={htmlValue}
        css={cssValue}
        js={jsValue}
        onUserEdit={(html, css, js) => {
          saveCodeToLocalStorage(html, css, js, true);
        }}
        onHtmlChange={setHtmlValue}
        onCssChange={setCssValue}
        onJsChange={setJsValue}
      />
    </Fragment>
  );
}

export { CreatePenPage };
