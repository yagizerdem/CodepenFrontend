import { useEffect, useState } from "react";
import { HorizontalSplitPanel } from "../common/HorizontalSplitPanel";
import { VerticalSplitPanel } from "../common/VerticalSplitPanel";
import { CssEditor, HtmlEditor, JavascriptEditor } from "./Editors";
import "./previewIframe.css";
import { useDebounce } from "../../hook/useDebounce";

function CodeEditor() {
  const [htmlValue, setHtmlValue] = useState("");
  const [jsValue, setJsValue] = useState("");
  const [cssValue, setCssValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  const debouncedHtml = useDebounce(htmlValue, 1000);
  const debouncedJs = useDebounce(jsValue, 1000);
  const debouncedCss = useDebounce(cssValue, 1000);

  useEffect(() => {
    const output = `<html>
                    <style>
                    ${debouncedCss}
                    </style>
                    <body>
                    ${debouncedHtml}
                    <script type="text/javascript">
                    ${debouncedJs}
                    </script>
                    </body>
                  </html>`;
    setOutputValue(output);
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  return (
    <div className="w-full h-full">
      <VerticalSplitPanel
        sections={[
          <iframe
            srcDoc={outputValue}
            className="previewIframe"
            sandbox="allow-scripts"
          />,
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
  );
}

export { CodeEditor };
