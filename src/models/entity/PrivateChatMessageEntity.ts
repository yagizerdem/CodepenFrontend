import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { BaseEntity } from "./BaseEntity";
import type { MediaWrapper } from "./MediaWrapper";

export interface PrivateChatMessageEntity extends BaseEntity {
  id: number;

  senderId: string;
  sender: ApplicationUserEntity;

  receiverId: string;
  receiver: ApplicationUserEntity;

  message: string;

  media?: MediaWrapper[];
}
