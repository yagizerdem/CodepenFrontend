import type { FC } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/theme-monokai";

import "./editors.css";

// Props type for the generic Editor
type EditorProps = {
  mode: "javascript" | "html" | "css"; // restrict allowed values
  title: string;
  value: string;
  onChange: (value: string) => void; // AceEditor returns string value
};

const Editor: FC<EditorProps> = ({ mode, title, onChange, value }) => {
  return (
    <div className="editorContainer">
      <div className="editorTitle">{title}</div>
      <AceEditor
        mode={mode}
        theme="monokai"
        name={title}
        width="100%"
        height="100%"
        setOptions={{ useWorker: false }}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

// Specific editors with narrowed props
type SpecificEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const JavascriptEditor: FC<SpecificEditorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Editor mode="javascript" title="JS" onChange={onChange} value={value} />
  );
};

export const HtmlEditor: FC<SpecificEditorProps> = ({ value, onChange }) => {
  return <Editor mode="html" title="HTML" onChange={onChange} value={value} />;
};

export const CssEditor: FC<SpecificEditorProps> = ({ value, onChange }) => {
  return <Editor mode="css" title="CSS" onChange={onChange} value={value} />;
};
