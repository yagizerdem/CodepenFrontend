import type { MediaWrapper } from "./MediaWrapper";
import type { PenEntity } from "./PenEntity";
import type { PenLikeEntity } from "./PenLikeEntity";
import type { PenCommentEntity } from "./PenCommentEntity";
import type { FollowRequest } from "./FollowRequest";
import type { RelationEntity } from "./RelationEntity";

export interface ApplicationUserEntity {
  id: string; // IdentityUser primary key (string GUID)
  userName?: string;
  normalizedUserName?: string;
  email?: string;
  normalizedEmail?: string;
  emailConfirmed: boolean;
  passwordHash?: string;
  securityStamp?: string;
  concurrencyStamp?: string;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;

  firstName: string;
  lastName: string;
  fullName: string;

  profilePictureId?: number;
  profilePicture?: MediaWrapper;

  createdAt: string;
  updatedAt: string;
  status: string;

  pens: PenEntity[];
  likes: PenLikeEntity[];
  comments: PenCommentEntity[];
  sentFollowRequests: FollowRequest[];
  receivedFollowRequests: FollowRequest[];
  followers: RelationEntity[];
  following: RelationEntity[];
}
