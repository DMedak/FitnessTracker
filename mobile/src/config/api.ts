import Constants from 'expo-constants';

const debuggerHost =
  Constants.expoConfig?.hostUri ||
  Constants.manifest2?.extra?.expoClient?.hostUri;

const localIp = debuggerHost?.split(':')[0];

export const API_URL = localIp
  ? `http://${localIp}:3000`
  : 'http://localhost:3000';