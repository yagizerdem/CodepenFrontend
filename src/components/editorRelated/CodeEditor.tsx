import { useEffect, useRef, useState } from "react";
import { HorizontalSplitPanel } from "../common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../common/VerticalSplitPanel";
import { CssEditor, HtmlEditor, JavascriptEditor } from "./Editors";
import "./previewIframe.css";
import { useDebounce } from "../../hook/useDebounce";
import { FeatherRefreshCw } from "@subframe/core";
import { Button } from "../../ui";

function CodeEditor() {
  const [htmlValue, setHtmlValue] = useState("");
  const [jsValue, setJsValue] = useState("");
  const [cssValue, setCssValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  const [frameKey, setFrameKey] = useState(0);
  const frameKeyRef = useRef(0); // watchdog için current key

  const debouncedHtml = useDebounce(htmlValue, 600);
  const debouncedJs = useDebounce(jsValue, 600);
  const debouncedCss = useDebounce(cssValue, 600);

  useEffect(() => {
    runPreview(debouncedHtml, debouncedCss, debouncedJs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  function runPreview(html: string, css: string, js: string) {
    const key = ++frameKeyRef.current;
    setFrameKey(key);

    const safeJs = addLoopGuards(js, 800); // 800ms bütçe (istersen arttır)

    const doc = buildSrcDoc({ html, css, guardedJs: safeJs, key });
    setOutputValue(doc);

    startWatchdog(key);
  }

  function startWatchdog(key: number) {
    const TIME_LIMIT = 1500; // iframe BOOT_OK dönmezse resetle
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
        // kilitlendi -> öldür ve uyarı yaz
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

    // Kaba ama etkili enjeksiyon (AST kadar temiz değil; pratik çözüm)
    let g = js
      // for (...)
      .replace(/for\\s*\\([^)]*\\)\\s*\\{/g, (m) => m + "\n__guard();")
      // while (...)
      .replace(/while\\s*\\([^)]*\\)\\s*\\{/g, (m) => m + "\n__guard();")
      // do { ... } while(...)
      .replace(/do\\s*\\{/g, (m) => m + "\n__guard();");

    return `${header}\ntry {\n${g}\n} catch (e) { console.error(e && e.message ? e.message : e); }`;
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
    // Tam sayfa yenileme (genelde gerek yok)
    window.location.reload();
  }

  function stopPreview() {
    const killedKey = ++frameKeyRef.current;
    setFrameKey(killedKey);
    setOutputValue("");
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="w-full h-10 flex justify-end items-center border-b border-gray-200 px-2 gap-2">
        <Button icon={<FeatherRefreshCw />} onClick={hardRefresh}>
          Refresh
        </Button>
        <Button onClick={stopPreview}>Stop</Button>
      </div>

      {/* İçerik alanı: kalan tüm yüksekliği kapla */}
      <div className="flex-1 min-h-0">
        <VerticalSplitPanel
          sections={[
            // ÜST: Preview
            <iframe
              key={frameKey}
              srcDoc={outputValue}
              className="previewIframe"
              // güvenlik: same-origin verme; sadece script izinli
              sandbox="allow-scripts"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
            />,

            // ALT: Editörler (yatay bölünmüş)
            <HorizontalSplitPanel
              sections={[
                <HtmlEditor value={htmlValue} onChange={setHtmlValue} />,
                <CssEditor value={cssValue} onChange={setCssValue} />,
                <JavascriptEditor value={jsValue} onChange={setJsValue} />,
              ]}
            />,
          ]}
        />
      </div>
    </div>
  );
}

export { CodeEditor };
