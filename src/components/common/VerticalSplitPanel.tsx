import { useRef, useEffect, Fragment, useState } from "react";
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
  const rafId = useRef<number | null>(null);

  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || dragIndex.current === null) return;
      if (rafId.current != null) return; // throttle
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null;

        const container = containerRef.current;
        if (!container) return;

        const panels = container.querySelectorAll(
          ".vertical-split-section"
        ) as NodeListOf<HTMLDivElement>;

        const top = panels[dragIndex.current!];
        const bottom = panels[dragIndex.current! + 1];
        if (!top || !bottom) return;

        const deltaY = e.clientY - startY.current;
        let newTop = startTopHeight.current + deltaY;
        let newBottom = startBottomHeight.current - deltaY;

        const MIN = 100;
        if (newTop < MIN) {
          newBottom -= MIN - newTop;
          newTop = MIN;
        }
        if (newBottom < MIN) {
          newTop -= MIN - newBottom;
          newBottom = MIN;
        }
        if (newTop < MIN || newBottom < MIN) return;

        top.style.flex = `0 0 ${newTop}px`;
        bottom.style.flex = `0 0 ${newBottom}px`;
      });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      dragIndex.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setShowOverlay(false);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
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
      {showOverlay && <div className="v-drag-overlay" />}
      {sections.map((section, index) => (
        <Fragment key={index}>
          <div className="vertical-split-section">
            <div className="vertical-scroll" style={{ width: "100%" }}>
              {section}
            </div>
          </div>

          {index < sections.length - 1 && (
            <div
              className="v-separator"
              onMouseDown={(e) => {
                e.preventDefault();
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
                document.body.style.cursor = "row-resize";
                setShowOverlay(true);
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};
