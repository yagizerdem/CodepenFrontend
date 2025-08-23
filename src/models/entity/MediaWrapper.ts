import type { BaseEntity } from "./BaseEntity";

export interface MediaWrapper extends BaseEntity {
  size?: number;
  fileName?: string;
  mimeType?: string;
  data?: string; // base64 encoded string if returned from API
}
