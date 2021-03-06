import { EventEmitter } from 'events';
import mongoose from '../src/services/mongoose';
import { mongo } from '../src/config';

EventEmitter.defaultMaxListeners = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

global.Array = Array;
global.Date = Date;
global.Function = Function;
global.Math = Math;
global.Number = Number;
global.Object = Object;
global.RegExp = RegExp;
global.String = String;
global.Uint8Array = Uint8Array;
global.WeakMap = WeakMap;
global.Set = Set;
global.Error = Error;
global.TypeError = TypeError;
global.parseInt = parseInt;
global.parseFloat = parseFloat;

beforeAll(async () => {
  await mongoose.connect(mongo.uri, (err) => {
    if (err) console.error(err);
  });
});

afterAll(async () => {
  await mongoose.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  const promises = [];
  Object.keys(collections).forEach((collection) => {
    promises.push(collections[collection].remove());
  });
  await Promise.all(promises);
});
