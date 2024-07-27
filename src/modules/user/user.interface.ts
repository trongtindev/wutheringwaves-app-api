export interface IUser {
  id: string;
  name: string;
  photoUrl: string;
}

export const userRoles = ['Owner', 'Manager', 'Member'];
export enum UserRoleId {
  Owner = '1249779703682826251',
  Manager = '1266784388084142150',
  Member = '1249779112583888987'
}
