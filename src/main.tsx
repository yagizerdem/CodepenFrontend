import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./flash.css";
import "toastify-js/src/toastify.css";
import "reactjs-popup/dist/index.css";
import "@pqina/pintura/pintura.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
