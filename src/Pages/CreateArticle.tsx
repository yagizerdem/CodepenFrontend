import { Fragment } from "react/jsx-runtime";
import { Editor } from "@tinymce/tinymce-react";
import Flatpickr from "react-flatpickr";
import { useState } from "react";
import { ArticleVisibility } from "../models/enums/ArticleVisibility";
import Select from "react-select";
import { Button } from "../ui";
import { FeatherCheck, FeatherTrash, FeatherUpload } from "@subframe/core";
import { showErrorToast, showSuccessToast } from "../utils/Toaster";
import { useAppContext } from "../context/AppContext";
import type { ApiResponse } from "../models/responsetype/ApiResponse";
import type { ArticleEntity } from "../models/entity/ArticleEntity";
import { API } from "../utils/API";
import { useNavigate } from "react-router";
import { flash } from "../utils/FlashEffect";

function CreateArticlePage() {
  const todayISO = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState<Date[]>([new Date(todayISO)]);
  const [title, setTitle] = useState<string>("");
  const [abstract, setAbstract] = useState<string>("");
  const [fullText, setFullText] = useState<string>("");
  const [visibility, setVisibility] = useState<number>();
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const { setIsLoading } = useAppContext();
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const options = [
    {
      value: ArticleVisibility.Public,
      label: getKeyByValue(ArticleVisibility.Public),
    },
    {
      value: ArticleVisibility.OnlyFollowers,
      label: getKeyByValue(ArticleVisibility.OnlyFollowers),
    },
    {
      value: ArticleVisibility.Private,
      label: getKeyByValue(ArticleVisibility.Private),
    },
  ];

  function getKeyByValue(value: number): string | undefined {
    return Object.keys(ArticleVisibility).find(
      (key) =>
        ArticleVisibility[key as keyof typeof ArticleVisibility] === value
    );
  }

  function selectFile() {
    return new Promise<File | null>((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.style.display = "none";

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
        setCoverImageFile(file);

        document.body.removeChild(input);
      };

      document.body.appendChild(input);
      input.click();
    });
  }

  async function Submit() {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("Title", title.trim());
      formData.append("FullText", fullText.trim());
      formData.append("PlannedPublishDate", date[0].toISOString());
      formData.append("Visibility", visibility?.toString().trim() || "");
      formData.append("Abstract", abstract.trim());
      if (coverImageFile) {
        formData.append("CoverImage", coverImageFile);
      }

      const apiResponse: ApiResponse<ArticleEntity> = (
        await API.post("/article/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      ).data;

      if (!apiResponse.success) {
        showErrorToast(apiResponse.message || "unknown error occured");
        setErrors(apiResponse.errors || []);
        return;
      }

      showSuccessToast(apiResponse.message || "Article created successfully");
      navigate("/home");
      flash();
    } catch (error) {
      console.log(error);
      showErrorToast("unknown error occured");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Fragment>
      <div
        className="flex flex-col w-full h-full overflow-y-auto "
        style={{ background: "rgb(39 40 34)" }}
      >
        <div className="flex flex-col max-w-[1200px]   mx-auto border-gray-300">
          {/* title  */}
          <div className="flex flex-col  my-4">
            <h1 className="text-white font-bold text-sm">Create Article</h1>
            <input
              type="text"
              placeholder="Title"
              className="p-2 border bg-gray-200 border-gray-300 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* abstract */}
          <div className="flex flex-col my-4">
            <h1 className="text-white font-bold text-sm">Abstract</h1>
            <textarea
              placeholder="Abstract"
              className="h-32 p-2 border bg-gray-200 border-gray-300 rounded"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
            />
          </div>

          {/* editor */}
          <div>
            <div className="text-sm font-bold text-white">Full Text </div>
            <Editor
              apiKey="in76kvx2smk1xtrhes6e6yz51o145c07xj56z6wb859z17n7"
              init={{
                plugins:
                  "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                toolbar:
                  "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
              }}
              onEditorChange={(content) => setFullText(content)}
            />
          </div>

          {/* date picker */}
          <div className="my-4">
            <span className="text-white block text-sm font-bold">
              Planned published Date
            </span>
            <Flatpickr
              value={date}
              onChange={(dates) => setDate(dates)}
              options={{
                dateFormat: "Y-m-d",
                minDate: "today",
                locale: "en", // DİLİ ZORLA
              }}
              className="w-63 my-2 p-2 border bg-gray-200 border-gray-300 rounded"
            />
          </div>

          {/* visiblity */}
          <div className="my-4 flex-col w-64">
            <div className="text-white block text-sm font-bold">Visibility</div>
            <Select
              options={options}
              onChange={(selectedOption) => {
                setVisibility(selectedOption?.value);
              }}
            />
          </div>

          {/* select cover image  */}
          <Button
            icon={<FeatherUpload />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              selectFile();
            }}
            className="my-8 w-48"
          >
            Upload Cover Image
          </Button>

          {/* preview img */}
          {coverImageFile && (
            <div>
              <div className="text-white font-bold text-sm my-1">Preview</div>
              <div className="flex gap-2">
                <img
                  className="w-24 h-24 object-cover"
                  src={URL.createObjectURL(coverImageFile)}
                  alt="Cover Preview"
                />
                <Button
                  variant="destructive-primary"
                  icon={<FeatherTrash />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    setCoverImageFile(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          <Button
            className="bg-success-600 text-white  w-64 mx-auto my-8"
            icon={<FeatherCheck />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              Submit();
            }}
          >
            Create Article
          </Button>
          <ul className="mx-auto gap-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-500">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Fragment>
  );
}

export { CreateArticlePage };
