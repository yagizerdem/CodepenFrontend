import React from "react";
import { Avatar } from "../../ui/components/Avatar";
import { Button } from "../../ui/components/Button";
import { FeatherPlusCircle } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherLogOut } from "@subframe/core";
import { useNavigate } from "react-router";
import { FeatherHome } from "@subframe/core";
import { FeatherEdit } from "@subframe/core";

function Sidepanel() {
  const navigation = useNavigate();

  return (
    <div className="flex w-64 h-full flex-none flex-col items-start gap-6 self-stretch border-r border-solid border-neutral-border bg-default-background px-4 py-6">
      <div className="flex w-full items-center gap-4 border-b border-solid border-neutral-border pb-6">
        <Avatar
          size="large"
          image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        >
          J
        </Avatar>
        <div className="flex grow shrink-0 basis-0 flex-col items-start">
          <span className="text-body-bold font-body-bold text-default-font">
            John Smith
          </span>
          <span className="text-caption font-caption text-subtext-color">
            @johnsmith
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-2">
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherHome />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            navigation("/home");
          }}
        >
          Home
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherPlusCircle />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            navigation("/home/create-pen");
          }}
        >
          Create Pen
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherSearch />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          Search Pens
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherUsers />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          Search Users
        </Button>
      </div>
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2">
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherUser />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          Profile
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherSettings />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
        >
          Settings
        </Button>
        <Button
          className="h-8 w-full flex-none"
          variant="neutral-tertiary"
          icon={<FeatherEdit />}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            navigation("/register");
          }}
        >
          Register
        </Button>
      </div>
      <Button
        className="h-8 w-full flex-none"
        variant="neutral-tertiary"
        icon={<FeatherLogOut />}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
      >
        Log out
      </Button>
    </div>
  );
}

export { Sidepanel };
