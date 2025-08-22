import type { BaseEntity } from "./BaseEntity";

export interface MediaWrapper extends BaseEntity {
  Size?: number;
  FileName?: string;
  MimeType?: string;
  Data?: string; // base64 encoded string if returned from API
}
