import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

const url = {
    staging: 'http://210.211.110.20:3000',
    production: 'http://210.211.110.20:3000',
};

const env = {
    staging: 'staging',
    production: 'production',
};

// export const buildEnv = env.staging;
export const buildEnv = env.production;

const baseUrl = url[buildEnv];

export const codePushKey = Platform.select({
    ios: {
        staging: 'kBUhUsUKXw-0Tmt852lTmN3VoN8PiszIWApyQ',
        production: 'vQJkljBLHrGtA9XyBeRBqD9bTDM6LcBqcwFs3',
    },
    android: {
        staging: 'A9kZuMeLbbpLQVVlFS33XhjONNWDKzenALy_F',
        production: '37xz_hwVvJMini9ttlF6WgC_V61Yj4cjAX9Tb',
    },
});

export const config = {
    baseUrl: 'http://210.211.110.20:3000',
    apiUrl: 'http://210.211.110.20:3000/api/v1',
    socketUrl: 'http://210.211.110.20:3001/socket/chats',
    currentVersion: DeviceInfo.getVersion(),
};
