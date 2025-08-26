import type { BaseEntity } from "./BaseEntity";
import type { PenEntity } from "./PenEntity";

export interface OldPenVersionsEntity extends BaseEntity {
  html?: string;
  css?: string;
  js?: string;
  version: number;
  penId?: number;
  pen?: PenEntity;
}
