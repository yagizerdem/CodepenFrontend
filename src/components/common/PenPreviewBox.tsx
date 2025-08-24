import React, { useEffect, useState, useRef } from "react";
import type { PenEntity } from "../../models/entity/PenEntity";

type Props = {
  pen: PenEntity;
};

const PenPreviewBox: React.FC<Props> = ({ pen }) => {
  const [frameKey, setFrameKey] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");
  const frameKeyRef = useRef(0);

  useEffect(() => {
    runPreview(pen.html ?? "", pen.css ?? "", pen.js ?? "");
  }, [pen]);

  function runPreview(html: string, css: string, js: string) {
    const key = ++frameKeyRef.current;
    setFrameKey(key);

    const safeJs = addLoopGuards(js, 800);
    const doc = buildSrcDoc({ html, css, guardedJs: safeJs, key });
    setSrcDoc(doc);

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
        setSrcDoc(`
          <html><body style="margin:0;font-family:sans-serif">
            <div style="padding:8px;background:#fee;color:#900;border-bottom:1px solid #fbb">
              Preview killed (script stuck / infinite loop).
            </div>
          </body></html>
        `);
        window.removeEventListener("message", onMsg);
      }
    }, TIME_LIMIT);
  }

  function addLoopGuards(code: string, maxMs = 800) {
    const header = `
      const __deadline = Date.now() + ${maxMs};
      function __guard(){ if (Date.now() > __deadline) { throw new Error("Time limit exceeded"); } }
    `;

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
      try { 
        parent.postMessage({ type: "BOOT_OK", key: ${key} }, "*"); 
      } catch(e) {}
      
      // Disable blocking dialogs
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
    <div className="border rounded-lg shadow-md overflow-hidden bg-white">
      {/* Header with title */}
      <div className="px-3 py-2 bg-gray-100 border-b">
        <h2 className="text-sm font-semibold text-gray-800 truncate">
          {pen.Title}
        </h2>
        <p className="text-xs text-gray-500">{pen.Description}</p>
      </div>

      {/* iframe preview - Using srcDoc directly like in your working code */}
      <iframe
        key={frameKey}
        srcDoc={srcDoc}
        className="w-full h-64 border-none"
        sandbox="allow-scripts"
        title={pen.Title}
      />
    </div>
  );
};

export { PenPreviewBox };
