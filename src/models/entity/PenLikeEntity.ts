import type { PenEntity } from "./PenEntity";
import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";

export interface PenLikeEntity extends BaseEntity {
  penId?: number;
  pen?: PenEntity;
  userId?: string;
  user?: ApplicationUserEntity;
}
