import assert from 'assert';
import mongoose from 'mongoose';

export const mongodb = async () => {
  const { MONGODB_DB, MONGODB_URI } = process.env;
  assert(MONGODB_DB, 'MONGODB_DB is required');
  assert(MONGODB_URI, 'MONGODB_URI is required');

  return await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB,
    autoCreate: true,
    autoIndex: true
  });
};
