import { Fragment } from "react/jsx-runtime";

function PaginationIndicator({
  totalPage,
  currentPage,
  onSelectPage,
}: {
  totalPage: number;
  currentPage: number;
  onSelectPage?: (page: number) => void;
}) {
  const maxPageToShow = 6;

  const backPageAmount = Math.min(Math.max(currentPage - 1, 0), 3);
  const forwardPageAmount = Math.min(Math.max(totalPage - currentPage, 0), 3);

  return (
    <div className="flex flex-row">
      {Array.from({ length: backPageAmount }, (_, i) => {
        return (
          <div
            key={i}
            className="flex-1 border-2 border-gray-50 w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer"
            onMouseUp={() => onSelectPage?.(currentPage - backPageAmount + i)}
          >
            {currentPage - backPageAmount + i}
          </div>
        );
      })}

      <div className="flex-1 border-2 border-gray-50 w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer">
        {currentPage}
      </div>

      {Array.from({ length: forwardPageAmount }, (_, i) => {
        return (
          <div
            key={i}
            className="flex-1 border-2 border-gray-50 w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer"
            onMouseUp={() => onSelectPage?.(currentPage + i + 1)}
          >
            {currentPage + i + 1}
          </div>
        );
      })}

      {totalPage > currentPage + maxPageToShow / 2 + 1 && (
        <Fragment>
          <div className="flex-1  w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer">
            ....
          </div>
          <div
            className="flex-1 border-2 border-gray-50 w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer"
            onMouseUp={() => onSelectPage?.(totalPage)}
          >
            {totalPage}
          </div>
        </Fragment>
      )}
      {totalPage == currentPage + maxPageToShow / 2 + 1 && (
        <div
          className="flex-1 border-2 border-gray-50 w-8 h-8 text-blue-50 flex items-center justify-center cursor-pointer"
          onMouseUp={() => onSelectPage?.(totalPage)}
        >
          {totalPage}
        </div>
      )}
    </div>
  );
}

export { PaginationIndicator };
