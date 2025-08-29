import type { ArticleVisibility } from "../enums/ArticleVisibility";
import type { ApplicationUserEntity } from "./ApplicationUserEntity";

export interface ArticleEntity {
  id: string; // from BaseEntity
  createdAt: string; // Date in ISO format
  updatedAt?: string; // optional date in ISO format

  title: string; // Min 2, Max 100
  fullText: string; // Max 100000
  abstract: string; // Max 500
  authorId: string;
  author: ApplicationUserEntity;
  plannedPublishDate: string; // ISO string, must be future date
  visibility: ArticleVisibility; // defaults to Public
  coverImage?: string | null; // optional, base64 string if returned
}
