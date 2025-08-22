export interface BaseEntity {
  Id: number;
  CreatedAt: string; // ISO date string
  UpdatedAt: string; // ISO date string
  Status: string; // maps to EntityStatus enum
}
