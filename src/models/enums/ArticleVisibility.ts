export const ArticleVisibility = {
  Public: 0,
  Private: 1,
  OnlyFollowers: 2,
};

export type ArticleVisibility =
  (typeof ArticleVisibility)[keyof typeof ArticleVisibility];
