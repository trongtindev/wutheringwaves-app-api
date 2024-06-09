import assert from 'assert';
import * as admin from 'firebase-admin';

export const firebase = async () => {
  const { FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_DATABASE_URL } = process.env;
  assert(
    FIREBASE_SERVICE_ACCOUNT_KEY,
    'FIREBASE_SERVICE_ACCOUNT_KEY is required'
  );
  const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY);

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: FIREBASE_DATABASE_URL,
      storageBucket: 'gs://wuthering-357ea.appspot.com'
    });
  }
};
