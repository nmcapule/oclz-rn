import { AsyncStorage } from 'react-native';

const NS_CREDS = 'credentials';

export async function getCreds(system) {
  try {
    const key = `${NS_CREDS}:${system}`;
    const curr = await AsyncStorage.getItem(key);
    return JSON.parse(curr);
  } catch (e) {
    console.error('Oh no:', e);
  }
}

export async function setCreds(system, value) {
  try {
    await AsyncStorage.clear();
    const key = `${NS_CREDS}:${system}`;
    const prev = await AsyncStorage.getItem(key);
    const curr = { ...prev, ...value };
    await AsyncStorage.setItem(key, JSON.stringify(curr));
  } catch (e) {
    console.error('Oh no:', e);
  }
}
