import { AsyncStorage } from 'react-native';

const NS_CREDS = 'credentials';

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
