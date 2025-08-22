import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";

export interface FollowRequest extends BaseEntity {
  SenderId?: string;
  Sender?: ApplicationUserEntity;
  ReceiverId?: string;
  Receiver?: ApplicationUserEntity;
  FollowRequestStatus: string; // enum: Pending / Accepted / Rejected
}
