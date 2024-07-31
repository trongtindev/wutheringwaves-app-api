export interface IUser {
  id: string;
  name: string;
  photoUrl: string;
}

export const userRoles = [
  'Owner',
  'Manager',
  'Moderator',
  'Content Writer',
  'Contributor',
  'Member',
];

export type UserRole =
  | 'Owner'
  | 'Manager'
  | 'Moderator'
  | 'Content Writer'
  | 'Contributor'
  | 'Member';

export enum UserRoleId {
  Owner = '1249779703682826251',
  Manager = '1266784388084142150',
  Moderator = '1266822268705706125',
  'Content Writer' = '1266821365453815851',
  Contributor = '1249779112583888987',
  Member = '1249779446064484504',
}
