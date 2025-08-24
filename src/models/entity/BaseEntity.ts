export interface BaseEntity {
  id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  status: string; // maps to EntityStatus enum
}
