import type { PenEntity } from "../entity/PenEntity";

export interface GetPensRespnose {
  totalHits: number;
  pens: PenEntity[];
}
