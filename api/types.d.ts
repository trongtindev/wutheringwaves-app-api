import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

declare global {
  export interface Request {
    auth: DecodedIdToken;
  }
}

export {};
