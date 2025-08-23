import { Fragment, useEffect, useRef, useState } from "react";
import { HorizontalSplitPanel } from "../common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../common/VerticalSplitPanel";
import { CssEditor, HtmlEditor, JavascriptEditor } from "./Editors";
import { useDebounce } from "../../hook/useDebounce";
import "./previewIframe.css";

type Props = {
  html: string;
  css: string;
  js: string;
  onUserEdit: (html: string, css: string, js: string) => void;
  onHtmlChange: (html: string) => void;
  onCssChange: (css: string) => void;
  onJsChange: (js: string) => void;
};

function CodeEditor({
  html,
  css,
  js,
  onUserEdit,
  onHtmlChange,
  onCssChange,
  onJsChange,
}: Props) {
  const [outputValue, setOutputValue] = useState("");

  const [frameKey, setFrameKey] = useState(0);
  const frameKeyRef = useRef(0);

  // PREVIEW için geciktirilmiş değerler (editör ham state ile çalışır)
  const dHtml = useDebounce(html, 600);
  const dCss = useDebounce(css, 600);
  const dJs = useDebounce(js, 600);

  useEffect(() => {
    runPreview(dHtml, dCss, dJs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dHtml, dCss, dJs]);

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

  function addLoopGuards(code: string, maxMs = 800) {
    const header = `
      const __deadline = Date.now() + ${maxMs};
      function __guard(){ if (Date.now() > __deadline) { throw new Error("Time limit exceeded"); } }
    `;

    // regex’ler düzeltilmiş (gereksiz kaçış yok)
    const guarded = code
      .replace(/for\s*\([^)]*\)\s*\{/g, (m) => m + "\n__guard();")
      .replace(/while\s*\([^)]*\)\s*\{/g, (m) => m + "\n__guard();")
      .replace(/do\s*\{/g, (m) => m + "\n__guard();");

    return `${header}\ntry {\n${guarded}\n} catch (e) { console.error(e && e.message ? e.message : e); }`;
  }

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
      try { parent.postMessage({ type: "BOOT_OK", key: ${key} }, "*"); } catch(e) {}
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

  return (
    <Fragment>
      <div className="flex-1 w-full h-full flex flex-col min-h-0">
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
                    value={html}
                    onChange={(value: string) => {
                      onUserEdit(value, css, js);
                      onHtmlChange(value);
                    }}
                  />,
                  <CssEditor
                    value={css}
                    onChange={(value: string) => {
                      onUserEdit(html, value, js);
                      onCssChange(value);
                    }}
                  />,
                  <JavascriptEditor
                    value={js}
                    onChange={(value: string) => {
                      onUserEdit(html, css, value);
                      onJsChange(value);
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
