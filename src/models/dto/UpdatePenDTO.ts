export interface UpdatePenDTO {
  html?: string;
  css?: string;
  js?: string;
  title?: string; // must be between 3–100 chars
  description?: string; // max length 10,000 chars
}
