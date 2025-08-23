import { Fragment } from "react/jsx-runtime";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

type IconHandler = {
  icon: React.ReactNode;
  callback: () => void;
};

export type ProfileImageContainerHandle = {
  expand: () => void;
  collapse: () => void;
};

export default function ProfileImageContainer({
  profileImagePath,
  customStyle = {},
  expandOnClick = true,
  onClickHandlers = [],
  ref = null as React.ForwardedRef<ProfileImageContainerHandle>,
}: {
  profileImagePath?: string | null;
  customStyle?: React.CSSProperties;
  expandOnClick?: boolean;
  onClickHandlers?: IconHandler[];
  ref?: React.ForwardedRef<ProfileImageContainerHandle>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const originalImageRef = useRef<HTMLImageElement>(null);
  const [secondImageProperties, setSecondImageProperties] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    borderRadius: "",
  });
  const [isExpandAnimationDone, setIsExpandAnimationDone] = useState(false);

  const animationLoopRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    expand: expandImage,
    collapse: closeExpandedImage,
  }));

  useEffect(() => {
    const img = originalImageRef.current;

    if (!img) return;

    const update = () => {
      const rect = img.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(img);

      setSecondImageProperties({
        width: rect.width,
        height: rect.height,
        top: rect.top + window.scrollY, // absolute Y position
        left: rect.left + window.scrollX, // absolute X position
        borderRadius: computedStyle.borderRadius,
      });
    };

    if (img.complete) {
      update(); // for cached images
    } else {
      img.onload = update; // for images loading
    }

    return () => {
      if (img) img.onload = null;
    };
  }, []); // only on mount

  function expandImage() {
    if (!expandOnClick) return;
    setIsExpanded(true);
    setIsExpandAnimationDone(false);
    startAnimation();
  }

  function closeExpandedImage() {
    setIsExpanded(false);
    setIsExpandAnimationDone(false);
    clearInterval(animationLoopRef.current!);
    if (originalImageRef.current) {
      const img = originalImageRef.current;
      // Reset the second image properties to initial state
      const update = () => {
        const rect = img.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(img);

        setSecondImageProperties({
          width: rect.width,
          height: rect.height,
          top: rect.top + window.scrollY, // absolute Y position
          left: rect.left + window.scrollX, // absolute X position
          borderRadius: computedStyle.borderRadius,
        });
      };
      update();
    }
  }

  function startAnimation() {
    const centerOfScreen = {
      h: window.innerHeight / 2,
      w: window.innerWidth / 2,
    };

    const duration = 200; // in ms
    const fps = 60;
    const interval = 1000 / fps;
    const stepCount = duration / interval; // ~24 steps

    const initial = secondImageProperties;

    const centerOfImage = {
      h: initial.top + initial.height / 2,
      w: initial.left + initial.width / 2,
    };

    const targetWidth = 384;
    const targetHeight = 384;
    const targetBorderRadius = 0;

    const finalTop = centerOfScreen.h - targetHeight / 2;
    const finalLeft = centerOfScreen.w - targetWidth / 2;

    const totalDistance = {
      top: finalTop - initial.top,
      left: finalLeft - initial.left,
      width: targetWidth - initial.width,
      height: targetHeight - initial.height,
      borderRadius:
        targetBorderRadius - parseFloat(initial.borderRadius || "0"),
    };

    const perStep = {
      top: totalDistance.top / stepCount,
      left: totalDistance.left / stepCount,
      width: totalDistance.width / stepCount,
      height: totalDistance.height / stepCount,
      borderRadius: totalDistance.borderRadius / stepCount,
    };

    let step = 0;
    animationLoopRef.current = setInterval(() => {
      setSecondImageProperties((prev) => {
        step++;
        const newRadius =
          parseFloat(prev.borderRadius || "0") + perStep.borderRadius;

        if (step >= stepCount) {
          clearInterval(animationLoopRef.current!);
          setIsExpandAnimationDone(true);
          return {
            top: initial.top + totalDistance.top,
            left: initial.left + totalDistance.left,
            width: targetWidth,
            height: targetHeight,
            borderRadius: `${targetBorderRadius}px`,
          };
        }

        return {
          top: prev.top + perStep.top,
          left: prev.left + perStep.left,
          width: prev.width + perStep.width,
          height: prev.height + perStep.height,
          borderRadius: `${newRadius}px`,
        };
      });
    }, interval);
  }

  return (
    <Fragment>
      <div
        className=" rounded-full overflow-hidden bg-gray-300 flex items-center justify-center cursor-pointer"
        onClick={expandImage}
      >
        <img
          src={profileImagePath || ""}
          alt="Profile"
          className="w-full h-full rounded-full object-cover "
          style={customStyle}
          ref={originalImageRef}
        />
      </div>

      {isExpanded && (
        <Fragment>
          {/* Overlay */}
          <div
            className="fixed w-screen h-screen top-0 left-0 inset-0 bg-white opacity-90 z-40"
            onClick={closeExpandedImage}
          />

          {/* Absolute Positioned Container */}
          <div
            className="fixed z-50"
            style={{
              left: secondImageProperties.left,
              top: secondImageProperties.top,
              width: secondImageProperties.width,
              height: secondImageProperties.height,
            }}
          >
            <img
              src={profileImagePath}
              alt="Profile"
              className="w-full h-full object-cover"
              style={{
                borderRadius: secondImageProperties.borderRadius,
              }}
            />
            {isExpandAnimationDone && (
              <div className="w-full h-8! bg-white flex flex-row items-center justify-around align-middle">
                {onClickHandlers.map((handler, index) => {
                  return (
                    <span key={index} onClick={handler.callback}>
                      {handler.icon}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}
