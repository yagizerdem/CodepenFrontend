import type { BaseEntity } from "./BaseEntity";
import type { PenEntity } from "./PenEntity";

export interface OldPenVersionsEntity extends BaseEntity {
  HTML?: string;
  CSS?: string;
  JS?: string;
  Version: number;
  PenId?: number;
  Pen?: PenEntity;
}
