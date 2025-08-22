import type { PenEntity } from "./PenEntity";
import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";

export interface PenLikeEntity extends BaseEntity {
  PenId?: number;
  Pen?: PenEntity;
  UserId?: string;
  User?: ApplicationUserEntity;
}
