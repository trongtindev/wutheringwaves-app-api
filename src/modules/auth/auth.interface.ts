import { UserDocument } from '../user/user.schema';

export interface AuthAfterSignInArgs {
  document: UserDocument;
}
