import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";

export interface RelationEntity extends BaseEntity {
  FollowerId?: string;
  Follower?: ApplicationUserEntity;
  FollowingId?: string;
  Following?: ApplicationUserEntity;
}
