import { useRef, useEffect, Fragment } from "react";
import type { ReactNode } from "react";
import "./horizontalSplitPanel.css";

type HorizontalSplitPanelProps = {
  sections: ReactNode[];
};

export const HorizontalSplitPanel: React.FC<HorizontalSplitPanelProps> = ({
  sections,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragIndex = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startLeftWidth = useRef<number>(0);
  const startRightWidth = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || dragIndex.current === null) return;
      const container = containerRef.current;
      if (!container) return;

      const panels = container.querySelectorAll(
        ".split-panel-section"
      ) as NodeListOf<HTMLDivElement>;

      const left = panels[dragIndex.current];
      const right = panels[dragIndex.current + 1];
      if (!left || !right) return;

      const deltaX = e.clientX - startX.current;
      const newLeft = startLeftWidth.current + deltaX;
      const newRight = startRightWidth.current - deltaX;

      if (newLeft < 100 || newRight < 100) return;

      left.style.flex = `0 0 ${newLeft}px`;
      right.style.flex = `0 0 ${newRight}px`;
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
    <div className="split-panel" ref={containerRef}>
      {sections.map((section, index) => (
        <Fragment key={index}>
          <div className="split-panel-section">{section}</div>
          {index < sections.length - 1 && (
            <div
              className="separator"
              onMouseDown={(e) => {
                isDragging.current = true;
                dragIndex.current = index;
                startX.current = e.clientX;

                const container = containerRef.current;
                if (container) {
                  const panels = container.querySelectorAll(
                    ".split-panel-section"
                  ) as NodeListOf<HTMLDivElement>;
                  const left = panels[index];
                  const right = panels[index + 1];
                  if (left && right) {
                    startLeftWidth.current = left.getBoundingClientRect().width;
                    startRightWidth.current =
                      right.getBoundingClientRect().width;
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
