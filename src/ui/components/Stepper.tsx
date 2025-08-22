"use client";
/*
 * Documentation:
 * Stepper — https://app.subframe.com/16c8344fcf3d/library?component=Stepper_3c5d47dc-1b1a-45d9-b244-18422d7bfb56
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "completed" | "active";
  firstStep?: boolean;
  lastStep?: boolean;
  stepNumber?: React.ReactNode;
  label?: React.ReactNode;
  className?: string;
}

const Step = React.forwardRef<HTMLDivElement, StepProps>(function Step(
  {
    variant = "default",
    firstStep = false,
    lastStep = false,
    stepNumber,
    label,
    className,
    ...otherProps
  }: StepProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/c1145464 flex w-full cursor-pointer flex-col items-center justify-center gap-1",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-center justify-center gap-2",
          { "flex-row flex-nowrap gap-2": firstStep }
        )}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-300",
            { "bg-transparent": firstStep }
          )}
        />
        <div
          className={SubframeUtils.twClassNames(
            "flex h-7 w-7 flex-none flex-col items-center justify-center gap-2 rounded-full bg-neutral-100",
            { "bg-brand-100": variant === "active" || variant === "completed" }
          )}
        >
          {stepNumber ? (
            <span
              className={SubframeUtils.twClassNames(
                "text-caption-bold font-caption-bold text-subtext-color",
                {
                  "text-brand-700":
                    variant === "active" || variant === "completed",
                }
              )}
            >
              {stepNumber}
            </span>
          ) : null}
        </div>
        <div
          className={SubframeUtils.twClassNames(
            "flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-300",
            { "bg-transparent": lastStep }
          )}
        />
      </div>
      {label ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body font-body text-subtext-color group-hover/c1145464:text-default-font",
            {
              "text-body-bold font-body-bold text-default-font":
                variant === "active",
              "text-subtext-color": variant === "completed",
            }
          )}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
});

interface StepperRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const StepperRoot = React.forwardRef<HTMLDivElement, StepperRootProps>(
  function StepperRoot(
    { children, className, ...otherProps }: StepperRootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full items-start justify-center",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const Stepper = Object.assign(StepperRoot, {
  Step,
});
