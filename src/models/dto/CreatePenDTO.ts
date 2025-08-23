export interface CreatePenDTO {
  /** HTML code (optional) */
  html?: string | null;

  /** CSS code (optional) */
  css?: string | null;

  /** JS code (optional) */
  js?: string | null;

  /**
   * Title (required)
   * Min length: 3
   * Max length: 100
   */
  title: string;

  /**
   * Description (optional)
   * Max length: 10000
   */
  description?: string | null;
}
