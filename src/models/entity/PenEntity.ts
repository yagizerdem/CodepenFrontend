import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { OldPenVersionsEntity } from "./OldPenVersionsEntity";
import type { PenLikeEntity } from "./PenLikeEntity";
import type { PenCommentEntity } from "./PenCommentEntity";
import type { BaseEntity } from "./BaseEntity";

export interface PenEntity extends BaseEntity {
  html?: string;
  css?: string;
  js?: string;
  title: string;
  description?: string;

  authorId?: string;
  author: ApplicationUserEntity;
  version: number;

  oldVersions: OldPenVersionsEntity[];
  likes: PenLikeEntity[];
  comments: PenCommentEntity[];
}
