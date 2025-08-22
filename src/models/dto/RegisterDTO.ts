export interface RegisterDTO {
  FirstName: string; // required, min 2, max 20
  LastName: string; // required, min 2, max 20
  Email: string; // required, must be email
  Password: string; // required
  UserName: string; // required, min 2, max 20
}
