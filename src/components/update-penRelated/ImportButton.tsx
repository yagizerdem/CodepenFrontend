import { FeatherUpload } from "@subframe/core";
import { Button } from "../../ui";

function ImportButton({
  setHtmlValue,
  setCssValue,
  setJsValue,
}: {
  setHtmlValue: React.Dispatch<React.SetStateAction<string>>;
  setCssValue: React.Dispatch<React.SetStateAction<string>>;
  setJsValue: React.Dispatch<React.SetStateAction<string>>;
}) {
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

  return (
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
  );
}

export { ImportButton };
