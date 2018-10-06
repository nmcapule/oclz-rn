import { AsyncStorage } from 'react-native';

const NS_CREDS = 'credentials';
const NS_PRODS = 'products';

export async function getCreds(system, otherwise) {
  try {
    const key = `${NS_CREDS}:${system}`;
    const curr = await AsyncStorage.getItem(key);
    return JSON.parse(curr) || otherwise;
  } catch (e) {
    console.error('Oh no:', e);
  }
}

export async function setCreds(system, value) {
  try {
    const prev = await getCreds(system, {});
    const curr = { ...prev, ...value };
    const key = `${NS_CREDS}:${system}`;
    await AsyncStorage.setItem(key, JSON.stringify(curr));
  } catch (e) {
    console.error('Oh no:', e);
  }
}

async function retrieveProductKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter(key => key.startsWith(NS_PRODS));
  } catch (e) {
    console.error('keys:', e);
  }
}

export async function retrieveProducts() {
  try {
    const keys = retrieveProductKeys();
    const pairs = await AsyncStorage.multiGet(keys);
    const items = pairs.map(pair => JSON.parse(pair[1]));
    return items;
  } catch (e) {
    console.error('oh no items:', e);
  }
}

export async function registerProducts(model, system, attributes) {
  try {
    // TODO(nmcapule)
  } catch (e) {
    console.error('Oh noes:', e);
  }
}
