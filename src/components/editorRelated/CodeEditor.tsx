import { Fragment, useEffect, useRef, useState } from "react";
import { HorizontalSplitPanel } from "../common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../common/VerticalSplitPanel";
import { CssEditor, HtmlEditor, JavascriptEditor } from "./Editors";
import "./previewIframe.css";
import { useDebounce } from "../../hook/useDebounce";
import { FeatherCircleStop, FeatherRefreshCw } from "@subframe/core";
import { Button } from "../../ui";
import Popup from "reactjs-popup";

function CodeEditor() {
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

  console.log(openLoadPopup);

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

      <div className="flex-1 w-full h-full flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="w-full h-10 flex justify-end items-center border-b border-gray-200 px-2 gap-2">
          <Button icon={<FeatherRefreshCw />} onClick={hardRefresh}>
            Refresh
          </Button>
          <Button icon={<FeatherCircleStop />} onClick={stopPreview}>
            Stop
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
