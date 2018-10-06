import { AsyncStorage } from 'react-native';
import merge from 'deepmerge';

const NS_CREDS = 'credentials';
const NS_PRODS = 'products';

/** Credentials store. */

export async function getCreds(system, otherwise) {
  const key = `${NS_CREDS}:${system}`;
  const curr = await AsyncStorage.getItem(key);
  return JSON.parse(curr) || otherwise;
}

export async function setCreds(system, value) {
  const prev = await getCreds(system, {});
  const curr = { ...prev, ...value };
  const key = `${NS_CREDS}:${system}`;
  await AsyncStorage.setItem(key, JSON.stringify(curr));
}

/** Product store. */

async function retrieveProductKeys() {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter(key => key.startsWith(NS_PRODS));
}

export async function clearProducts() {
  const keys = await retrieveProductKeys();
  await AsyncStorage.multiRemove(keys);
}

export async function retrieveProducts(models) {
  let keys = await retrieveProductKeys();
  if (models && models.length > 0) {
    const set = new Set(models);
    const re = /\w+:(.+)/g;
    keys = keys.filter(key => {
      const tokens = re.exec(key);
      return tokens && set.has(tokens[1]);
    });
  }

  const pairs = await AsyncStorage.multiGet(keys);
  if (!pairs) {
    return [];
  }

  const items = pairs.map(pair => JSON.parse(pair[1]));
  return items;
}

export async function retrieveProduct(model) {
  let key = `${NS_PRODS}:${model}`;
  const s = await AsyncStorage.getItem(key);
  if (!s) {
    return null;
  }

  return JSON.parse(s);
}

export async function registerProduct(model, attributes) {
  const curr = await retrieveProduct(model);
  const key = `${NS_PRODS}:${model}`;
  const prod = merge(curr, attributes);
  await AsyncStorage.setItem(key, JSON.stringify(prod));
}

export async function registerProducts(dict) {}
