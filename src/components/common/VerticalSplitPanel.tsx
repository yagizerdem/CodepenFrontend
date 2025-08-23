import { useRef, useEffect, Fragment } from "react";
import type { ReactNode } from "react";
import "./verticalSplitPanel.css";

type VerticalSplitPanelProps = {
  sections: ReactNode[];
};

export const VerticalSplitPanel: React.FC<VerticalSplitPanelProps> = ({
  sections,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragIndex = useRef<number | null>(null);
  const startY = useRef<number>(0);
  const startTopHeight = useRef<number>(0);
  const startBottomHeight = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || dragIndex.current === null) return;
      const container = containerRef.current;
      if (!container) return;

      const panels = container.querySelectorAll(
        ".vertical-split-section"
      ) as NodeListOf<HTMLDivElement>;

      const top = panels[dragIndex.current];
      const bottom = panels[dragIndex.current + 1];
      if (!top || !bottom) return;

      const deltaY = e.clientY - startY.current;
      const newTop = startTopHeight.current + deltaY;
      const newBottom = startBottomHeight.current - deltaY;

      if (newTop < 100 || newBottom < 100) return;

      top.style.flex = `0 0 ${newTop}px`;
      bottom.style.flex = `0 0 ${newBottom}px`;
    };

    const onMouseUp = () => {
      isDragging.current = false;
      dragIndex.current = null;
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="vertical-split" ref={containerRef}>
      {sections.map((section, index) => (
        <Fragment key={index}>
          <div className="vertical-split-section">{section}</div>
          {index < sections.length - 1 && (
            <div
              className="v-separator"
              onMouseDown={(e) => {
                isDragging.current = true;
                dragIndex.current = index;
                startY.current = e.clientY;

                const container = containerRef.current;
                if (container) {
                  const panels = container.querySelectorAll(
                    ".vertical-split-section"
                  ) as NodeListOf<HTMLDivElement>;
                  const top = panels[index];
                  const bottom = panels[index + 1];
                  if (top && bottom) {
                    startTopHeight.current = top.getBoundingClientRect().height;
                    startBottomHeight.current =
                      bottom.getBoundingClientRect().height;
                  }
                }
                document.body.style.userSelect = "none";
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};
