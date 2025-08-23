import { Fragment, useEffect, useRef, useState } from "react";
import { HorizontalSplitPanel } from "../common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../common/VerticalSplitPanel";
import { CssEditor, HtmlEditor, JavascriptEditor } from "./Editors";
import "./previewIframe.css";
import { useDebounce } from "../../hook/useDebounce";
import {
  FeatherCircleStop,
  FeatherDownload,
  FeatherRefreshCw,
  FeatherSave,
  FeatherUpload,
  FeatherX,
} from "@subframe/core";
import { Button } from "../../ui";
import Popup from "reactjs-popup";
import { useAppContext } from "../../context/AppContext";
import type { ApiResponse } from "../../models/responsetype/ApiResponse";
import type { CreatePenDTO } from "../../models/dto/CreatePenDTO";
import type { PenEntity } from "../../models/entity/PenEntity";
import { API } from "../../utils/API";
import { showErrorToast, showSuccessToast } from "../../utils/Toaster";

function CodeEditor() {
  const { setIsLoading } = useAppContext();
  const [htmlValue, setHtmlValue] = useState("");
  const [jsValue, setJsValue] = useState("");
  const [cssValue, setCssValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  const [frameKey, setFrameKey] = useState(0);
  const frameKeyRef = useRef(0);

  const debouncedHtml = useDebounce(htmlValue, 600);
  const debouncedJs = useDebounce(jsValue, 600);
  const debouncedCss = useDebounce(cssValue, 600);

  // indicate that user has edit code in editors
  const [hasUserEdited, setHasUserEdited] = useState(false);

  const [openLoadPopup, setOpenLoadPopup] = useState(false);

  const [clearCodePopup, setClearCodePopup] = useState(false);

  const [savePenPopup, setSavePenPopup] = useState(false);

  const [penTitle, setPenTitle] = useState("");
  const [penDescription, setPenDescription] = useState("");

  useEffect(() => {
    runPreview(debouncedHtml, debouncedCss, debouncedJs);

    if (!hasUserEdited) saveCodeToLocalStorage(false);
    else saveCodeToLocalStorage(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  function runPreview(html: string, css: string, js: string) {
    const key = ++frameKeyRef.current;
    setFrameKey(key);

    const safeJs = addLoopGuards(js, 800);

    const doc = buildSrcDoc({ html, css, guardedJs: safeJs, key });
    setOutputValue(doc);

    startWatchdog(key);
  }

  function startWatchdog(key: number) {
    const TIME_LIMIT = 1500;
    let booted = false;

    function onMsg(ev: MessageEvent) {
      const data = ev.data as any;
      if (data && data.type === "BOOT_OK" && data.key === key) {
        booted = true;
        window.removeEventListener("message", onMsg);
      }
    }
    window.addEventListener("message", onMsg);

    setTimeout(() => {
      if (!booted && frameKeyRef.current === key) {
        const killedKey = ++frameKeyRef.current;
        setFrameKey(killedKey);
        setOutputValue(
          `<html><body style="margin:0;font-family:sans-serif">
             <div style="padding:8px;background:#fee;color:#900;border-bottom:1px solid #fbb">
               Preview killed (script stuck / infinite loop).
             </div>
           </body></html>`
        );
        window.removeEventListener("message", onMsg);
      }
    }, TIME_LIMIT);
  }

  function addLoopGuards(js: string, maxMs = 800) {
    const header = `
      const __deadline = Date.now() + ${maxMs};
      function __guard(){ if (Date.now() > __deadline) { throw new Error("Time limit exceeded"); } }
    `;

    let g = js
      // for (...)
      .replace(/for\\s*\\([^)]*\\)\\s*\\{/g, (m) => m + "\n__guard();")
      // while (...)
      .replace(/while\\s*\\([^)]*\\)\\s*\\{/g, (m) => m + "\n__guard();")
      // do { ... } while(...)
      .replace(/do\\s*\\{/g, (m) => m + "\n__guard();");

    return `${header}\ntry {\n${g}\n} catch (e) { console.error(e && e.message ? e.message : e); }`;
  }

  function saveCodeToLocalStorage(saveEmpty = false) {
    if (htmlValue || saveEmpty)
      window.localStorage.setItem("createpen-html", htmlValue);
    if (cssValue || saveEmpty)
      window.localStorage.setItem("createpen-css", cssValue);
    if (jsValue || saveEmpty)
      window.localStorage.setItem("createpen-js", jsValue);
  }

  function loadFromLocalStorage() {
    const savedHtml = window.localStorage.getItem("createpen-html");
    const savedCss = window.localStorage.getItem("createpen-css");
    const savedJs = window.localStorage.getItem("createpen-js");

    if (savedHtml) setHtmlValue(savedHtml);
    if (savedCss) setCssValue(savedCss);
    if (savedJs) setJsValue(savedJs);
  }

  // run only once on code editor starts
  useEffect(() => {
    // ask user to load unsaved changes from local storage
    const savedHtml = window.localStorage.getItem("createpen-html");
    const savedCss = window.localStorage.getItem("createpen-css");
    const savedJs = window.localStorage.getItem("createpen-js");

    if (savedHtml || savedCss || savedJs) setOpenLoadPopup(true);
  }, []);

  function buildSrcDoc({
    html,
    css,
    guardedJs,
    key,
  }: {
    html: string;
    css: string;
    guardedJs: string;
    key: number;
  }) {
    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html,body{height:100%;margin:0}
      ${css || ""}
    </style>
  </head>
  <body>
    ${html || ""}
    <script>
      // Parent'a "çalışıyorum" sinyali
      try { parent.postMessage({ type: "BOOT_OK", key: ${key} }, "*"); } catch(e) {}
      // UI kilitlemesin diye
      window.alert = () => {};
      window.prompt = () => null;
      window.confirm = () => false;
    </script>
    <script>
      ${guardedJs || ""}
    </script>
  </body>
</html>`;
  }

  function hardRefresh() {
    window.location.reload();
  }

  function stopPreview() {
    const killedKey = ++frameKeyRef.current;
    setFrameKey(killedKey);
    setOutputValue("");
  }
  function exportCode() {
    // HTML file
    const htmlBlob = new Blob([htmlValue], { type: "text/html" });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    downloadFile(htmlUrl, "index.html");

    // CSS file
    const cssBlob = new Blob([cssValue], { type: "text/css" });
    const cssUrl = URL.createObjectURL(cssBlob);
    downloadFile(cssUrl, "style.css");

    // JS file
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
    input.accept = ".html,.css,.js"; // sadece html, css, js dosyaları

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
          } else if (file.name.endsWith(".css")) {
            setCssValue(content);
          } else if (file.name.endsWith(".js")) {
            setJsValue(content);
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  function clearCode() {
    setHtmlValue("");
    setCssValue("");
    setJsValue("");

    // clear local storage
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
        showErrorToast(apiResponse.message || "unknown error ");
        return;
      }

      showSuccessToast(apiResponse.message || "Pen saved successfully!");
      // clear local storage
      localStorage.removeItem("createpen-html");
      localStorage.removeItem("createpen-css");
      localStorage.removeItem("createpen-js");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
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
          textAlign: "center", // center text
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
              justifyContent: "center", // center buttons horizontally
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
              color: "#f87171", // red-400 for warning
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
                clearCode();
              }}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#dc2626", // red-600
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

          {/* Title input */}
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

          {/* Description input */}
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

          {/* Buttons */}
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
                background: "#374151", // gray-700
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
                background: "#16a34a", // green-600
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

      <div className="flex-1 w-full h-full flex flex-col min-h-0">
        {/* Toolbar */}
        <div
          className="w-full h-10 flex justify-end items-center border-b border-gray-200 px-2 gap-2 "
          style={{
            background: "rgb(39 40 34)",
          }}
        >
          <Button icon={<FeatherRefreshCw />} onClick={hardRefresh}>
            Refresh
          </Button>
          <Button icon={<FeatherCircleStop />} onClick={stopPreview}>
            Stop
          </Button>
          <Button
            variant="brand-secondary"
            icon={<FeatherUpload />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              importCode();
            }}
          >
            Import
          </Button>
          <Button
            variant="brand-secondary"
            icon={<FeatherDownload />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              exportCode();
            }}
          >
            Export
          </Button>
          <Button
            variant="destructive-primary"
            icon={<FeatherX />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setClearCodePopup(true);
            }}
          >
            Clear
          </Button>

          <Button
            className="hover:border-success-700:hover hover:bg-success-700:hover bg-success-600 border-success-600"
            icon={<FeatherSave />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setSavePenPopup(true);
            }}
          >
            Save
          </Button>
        </div>

        <div className="flex-1 min-h-0">
          <VerticalSplitPanel
            sections={[
              <iframe
                key={frameKey}
                srcDoc={outputValue}
                className="previewIframe"
                sandbox="allow-scripts"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                }}
              />,

              <HorizontalSplitPanel
                sections={[
                  <HtmlEditor
                    value={htmlValue}
                    onChange={(value: string) => {
                      setHasUserEdited(true);
                      setHtmlValue(value);
                    }}
                  />,
                  <CssEditor
                    value={cssValue}
                    onChange={(value: string) => {
                      setHasUserEdited(true);
                      setCssValue(value);
                    }}
                  />,
                  <JavascriptEditor
                    value={jsValue}
                    onChange={(value: string) => {
                      setHasUserEdited(true);
                      setJsValue(value);
                    }}
                  />,
                ]}
              />,
            ]}
          />
        </div>
      </div>
    </Fragment>
  );
}

export { CodeEditor };
