import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";

export interface FollowRequest extends BaseEntity {
  senderId?: string;
  sender?: ApplicationUserEntity;
  receiverId?: string;
  receiver?: ApplicationUserEntity;
  followRequestStatus: string; // enum: Pending / Accepted / Rejected
}
