import type { ApplicationUserEntity } from "./ApplicationUserEntity";
import type { ArticleEntity } from "./ArticleEntity";
import type { BaseEntity } from "./BaseEntity";

export interface BookMark extends BaseEntity {
  userId: string;
  user: ApplicationUserEntity;
  articleId: string;
  article: ArticleEntity;
}
