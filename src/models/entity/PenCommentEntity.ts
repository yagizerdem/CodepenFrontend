import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";
import type { PenEntity } from "./PenEntity";

export interface PenCommentEntity extends BaseEntity {
  Content: string;
  UserId?: string;
  User?: ApplicationUserEntity;
  PenId?: number;
  Pen?: PenEntity;
}
