import { Fragment, useEffect, useReducer, useState } from "react";
import { useParams } from "react-router";
import type { OldVersionNameDTO } from "../models/dto/OldVersionNameDTO";
import { useAppContext } from "../context/AppContext";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { API } from "../utils/API";
import { CodeEditor } from "../components/editorRelated/CodeEditor";

import { Button } from "../ui/components/Button";
import { DropdownMenu } from "../ui/components/DropdownMenu";
import { FeatherChevronDown } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import type { OldPenVersionsEntity } from "../models/entity/OldPenVersionsEntity";
import Popup from "reactjs-popup";

function codeReducer(
  state: { html: string; css: string; js: string },
  action: { type: "html" | "css" | "js"; payload: string }
) {
  switch (action.type) {
    case "html":
      return { ...state, html: action.payload };
    case "css":
      return { ...state, css: action.payload };
    case "js":
      return { ...state, js: action.payload };
    default:
      return state;
  }
}

function MyOldPenVersion() {
  const { setIsLoading } = useAppContext();
  const { penId } = useParams<{ penId: string }>();
  const [oldVersions, setOldVersions] = useState<OldVersionNameDTO[]>([]);
  const [codes, dispatchCodes] = useReducer(codeReducer, {
    html: "",
    css: "",
    js: "",
  });
  const [isAscending, setIsAscending] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    if (penId) {
      fetchOldVersions();
    }
  }, [penId]);

  useEffect(() => {
    if (selectedVersion != null) {
      fetchOldVersion(selectedVersion);
    }
  }, [selectedVersion]);

  function sortVersions(isAscending: boolean) {
    if (oldVersions.length > 0) {
      const sortedVersions = [...oldVersions].sort((a, b) => {
        if (isAscending) {
          return parseInt(a.version) - parseInt(b.version);
        } else {
          return parseInt(b.version) - parseInt(a.version);
        }
      });
      setOldVersions(sortedVersions);
    }
  }

  async function fetchOldVersions() {
    try {
      if (penId) {
        setIsLoading(true);
        const response: ApiResponse<OldVersionNameDTO[]> = (
          await API.get(`/pen/get-old-versionnames/${penId}`)
        ).data;

        if (!response.success) {
          showErrorToast(response.message || "unknown error occured");
          return;
        }

        setOldVersions((prev) => [...prev, ...response.data]);
      }
    } catch (error) {
      console.error("Failed to fetch old versions", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchOldVersion(version: number) {
    try {
      setIsLoading(true);

      const apiResponse: ApiResponse<OldPenVersionsEntity[]> = (
        await API.get(`/pen/get-old-versions/${penId}?Version=${version}`)
      ).data;

      if (apiResponse.success === false) {
        showErrorToast(apiResponse.message || "unknown error occured");
        return;
      }

      const oldVersion: OldPenVersionsEntity = apiResponse.data.at(0);

      dispatchCodes({ type: "html", payload: oldVersion.html as string });
      dispatchCodes({ type: "css", payload: oldVersion.css as string });
      dispatchCodes({ type: "js", payload: oldVersion.js as string });
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
    }
  }

  async function DeleteOldVersion(version: number) {
    try {
      setIsLoading(true);

      const oldVersion = oldVersions.find((v) => v.version == version);

      console.log(oldVersion);

      const apiResponse: ApiResponse<unknown> = (
        await API.post(`/pen/remove-oldversion/${oldVersion?.id}`)
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occured");
        return;
      }

      setOldVersions((prev) => prev.filter((v) => v.version !== version));
      setSelectedVersion(null);
      dispatchCodes({ type: "html", payload: "" });
      dispatchCodes({ type: "css", payload: "" });
      dispatchCodes({ type: "js", payload: "" });
      setShowDeletePopup(false);

      showSuccessToast("Old version deleted successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      {/* Clear popup */}
      <Popup
        open={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
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
              color: "#f87171",
            }}
          >
            This action is not retrievable
          </h3>
          <p style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
            This action will permanently delete your code.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <button
              style={{
                padding: "0.5rem 1.25rem",
                background: "green",
                margin: "0px 10px",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseUp={() => {
                setShowDeletePopup(false);
              }}
            >
              Cancel
            </button>

            <button
              style={{
                padding: "0.5rem 1.25rem",
                background: "#dc2626",
                color: "white",
                borderRadius: "0.375rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onMouseUp={() => DeleteOldVersion(selectedVersion as number)}
            >
              Delete Version {selectedVersion}
            </button>
          </div>
        </div>
      </Popup>

      <div className="flex flex-1 w-full h-full flex-col">
        <div
          className="flex flex-row w-full h-fit p-2 justify-end align-middle items-center"
          style={{ background: "rgb(39 40 34)" }}
        >
          <Button
            variant="destructive-primary"
            style={{ marginRight: "18px" }}
            icon={<SubframeCore.FeatherTrash />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              if (selectedVersion == null) {
                showErrorToast("No version selected");
                return;
              }
              setShowDeletePopup(true);
            }}
          >
            Delete Version
          </Button>

          <div className="flex flex-row items-center justify-center align-middle w-fit text-white">
            {isAscending && <label>Sort Asc</label>}
            {!isAscending && <label> Sort Desc</label>}

            <input
              type="checkbox"
              className="w-4 h-4 border-2 border-gray-50 mx-4 cursor-pointer rounded-xl"
              checked={isAscending}
              onMouseUp={() => {
                setIsAscending(!isAscending);
                sortVersions(!isAscending);
              }}
            />
          </div>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                variant="neutral-secondary"
                iconRight={<FeatherChevronDown />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  event.preventDefault();
                }}
              >
                {selectedVersion == null && <label>Select Version</label>}
                {selectedVersion != null && (
                  <label>Version {selectedVersion}</label>
                )}
              </Button>
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content
                side="bottom"
                align="start"
                sideOffset={4}
                asChild={true}
                style={{
                  maxHeight: "300px",
                  overflowY: "scroll",
                }}
              >
                <DropdownMenu>
                  {oldVersions.map((version, i) => (
                    <DropdownMenu.DropdownItem
                      key={i}
                      onMouseUp={() => setSelectedVersion(version.version)}
                    >
                      {version.version}
                    </DropdownMenu.DropdownItem>
                  ))}
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>

        <div className="flex-1 w-full h-full">
          <CodeEditor
            css={codes.css}
            html={codes.html}
            js={codes.js}
            onCssChange={(newCss) =>
              dispatchCodes({ type: "css", payload: newCss })
            }
            onHtmlChange={(newHtml) =>
              dispatchCodes({ type: "html", payload: newHtml })
            }
            onJsChange={(newJs) =>
              dispatchCodes({ type: "js", payload: newJs })
            }
            onUserEdit={() => {}}
          />
        </div>
      </div>
    </Fragment>
  );
}

export { MyOldPenVersion };
