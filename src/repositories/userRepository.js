import { User } from '../models/User.js';

const normalize = (value) => (typeof value === 'string' ? value.toLowerCase() : value);

export const userRepository = {
  findByEmailOrUsername(email, username) {
    return User.findOne({
      $or: [
        ...(email ? [{ email: normalize(email) }] : []),
        ...(username ? [{ username: normalize(username) }] : []),
      ],
    });
  },

  findByEmailWithPassword(email) {
    return User.findOne({ email: normalize(email) }).select('+password');
  },

  findByAuth0EmailOrUsername(auth0Id, email, username) {
    return User.findOne({
      $or: [
        ...(auth0Id ? [{ auth0Id }] : []),
        ...(email ? [{ email: normalize(email) }] : []),
        ...(username ? [{ username: normalize(username) }] : []),
      ],
    });
  },

  create(data) {
    return User.create(data);
  },

  findByAuth0Id(auth0Id) {
    return User.findByAuth0Id(auth0Id);
  },

  findById(userId) {
    return User.findById(userId);
  },

  findByIdLean(userId) {
    return User.findById(userId).select('-__v').lean();
  },
};
