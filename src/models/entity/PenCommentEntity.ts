import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";
import type { PenEntity } from "./PenEntity";

export interface PenCommentEntity extends BaseEntity {
  content: string;
  userId?: string;
  user?: ApplicationUserEntity;
  penId?: number;
  pen?: PenEntity;
}
