import { FeatherDownload } from "@subframe/core";
import { Button } from "../../ui";

function ExportButton({
  htmlValue,
  cssValue,
  jsValue,
}: {
  htmlValue: string;
  cssValue: string;
  jsValue: string;
}) {
  function downloadFile(url: string, filename: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
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
  );
}

export { ExportButton };
