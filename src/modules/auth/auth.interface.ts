import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export interface AuthData extends DecodedIdToken {}

export interface AuthVerifyEventArgs {
  auth: DecodedIdToken;
  userRecord: UserRecord;
}
