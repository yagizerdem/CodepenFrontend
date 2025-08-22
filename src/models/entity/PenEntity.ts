import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { OldPenVersionsEntity } from "./OldPenVersionsEntity";
import type { PenLikeEntity } from "./PenLikeEntity";
import type { PenCommentEntity } from "./PenCommentEntity";
import type { BaseEntity } from "./BaseEntity";

export interface PenEntity extends BaseEntity {
  HTML?: string;
  CSS?: string;
  JS?: string;
  Title: string;
  Description?: string;

  AuthorId?: string;
  Author: ApplicationUserEntity;
  Version: number;

  OldVersions: OldPenVersionsEntity[];
  Likes: PenLikeEntity[];
  Comments: PenCommentEntity[];
}
