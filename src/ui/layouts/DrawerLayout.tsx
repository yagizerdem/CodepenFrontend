"use client";
/*
 * Documentation:
 * Drawer — https://app.subframe.com/16c8344fcf3d/library?component=Drawer_1e71b2cb-8d72-4e67-b368-8805179e9444
 * Drawer Layout — https://app.subframe.com/16c8344fcf3d/library?component=Drawer+Layout_2f6803ed-5ed0-4934-b093-a1a46df2d1d1
 */

import React from "react";
import { Drawer } from "../components/Drawer";
import * as SubframeUtils from "../utils";

interface DrawerLayoutRootProps extends React.ComponentProps<typeof Drawer> {
  children?: React.ReactNode;
  className?: string;
}

const DrawerLayoutRoot = React.forwardRef<
  React.ElementRef<typeof Drawer>,
  DrawerLayoutRootProps
>(function DrawerLayoutRoot(
  { children, className, ...otherProps }: DrawerLayoutRootProps,
  ref
) {
  return (
    <Drawer className={className} ref={ref} {...otherProps}>
      <Drawer.Content>
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-8">
            {children}
          </div>
        ) : null}
      </Drawer.Content>
    </Drawer>
  );
});

export const DrawerLayout = DrawerLayoutRoot;
