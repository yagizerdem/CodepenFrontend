import type { MediaWrapper } from "./MediaWrapper";
import type { PenEntity } from "./PenEntity";
import type { PenLikeEntity } from "./PenLikeEntity";
import type { PenCommentEntity } from "./PenCommentEntity";
import type { FollowRequest } from "./FollowRequest";
import type { RelationEntity } from "./RelationEntity";

export interface ApplicationUserEntity {
  Id: string; // IdentityUser primary key (string GUID)
  UserName?: string;
  NormalizedUserName?: string;
  Email?: string;
  NormalizedEmail?: string;
  EmailConfirmed: boolean;
  PasswordHash?: string;
  SecurityStamp?: string;
  ConcurrencyStamp?: string;
  PhoneNumber?: string;
  PhoneNumberConfirmed: boolean;
  TwoFactorEnabled: boolean;
  LockoutEnd?: string;
  LockoutEnabled: boolean;
  AccessFailedCount: number;

  FirstName: string;
  LastName: string;
  FullName: string;

  ProfilePictureId?: number;
  ProfilePicture?: MediaWrapper;

  CreatedAt: string;
  UpdatedAt: string;
  Status: string;

  Pens: PenEntity[];
  Likes: PenLikeEntity[];
  Comments: PenCommentEntity[];
  SentFollowRequests: FollowRequest[];
  ReceivedFollowRequests: FollowRequest[];
  Followers: RelationEntity[];
  Following: RelationEntity[];
}
