import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';
import { env } from '../../config';

export const roles = ['client', 'service', 'admin'];

const userSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  name: {
    type: String,
    index: true,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'client',
  },
  picture: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

userSchema.path('email').set(function (email) {
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex');
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1');
  }

  return email;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  /* istanbul ignore next */
  const rounds = env === 'test' ? 1 : 9;

  bcrypt.hash(this.password, rounds).then((hash) => {
    this.password = hash;
    next();
  }).catch(next);
});

userSchema.methods = {
  view(full) {
    const view = {};
    let fields = ['id', 'name', 'picture'];

    if (full) {
      fields = [...fields, 'email', 'createdAt'];
    }

    fields.forEach((field) => { view[field] = this[field]; });

    return view;
  },

  authenticate(password) {
    return bcrypt.compare(password, this.password).then(valid => (valid ? this : false));
  },
};

export const view = (user, full) => {
  const viewObject = {};
  let fields = ['id', 'name', 'picture'];

  if (full) {
    fields = [...fields, 'email', 'createdAt'];
  }

  fields.forEach((field) => { viewObject[field] = user[field]; });

  return viewObject;
};

userSchema.statics = {
  roles,
};

const model = mongoose.model('User', userSchema);

export const schema = model.schema;
export default model;
