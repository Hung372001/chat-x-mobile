import messaging from '@react-native-firebase/messaging';
import { DeviceEventEmitter, PermissionsAndroid } from 'react-native';
import OnPressNotification from './handlePushNotification';
import { createNotification, setBadgeNumber } from './localPushNotification';
import { dispatch } from '../redux/Store';
import { updateFCMToken } from '../redux/authSlice';
import { isEmpty } from 'lodash';
import { isANDROID } from './appUtil';

export let FCMToken;
const initFCM = () => {
    requestUserPermission();
    getToken();

    messaging().onMessage(async (remoteMessage) => {
        console.log('A new FCM message arrived: ', remoteMessage);
        const unReadCount = !isEmpty(remoteMessage?.data?.unreadCount)
            ? parseInt(remoteMessage?.data?.unreadCount)
            : 0;
        setBadgeNumber(unReadCount);
        createNotification(remoteMessage);
    });

    checkWithNotification();

    messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('On Notification Opened App: ', remoteMessage);
        OnPressNotification && OnPressNotification(remoteMessage);
    });

    messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
            if (remoteMessage) {
                OnPressNotification && OnPressNotification(remoteMessage);
            }
        })
        .catch((error) => {});
};

const checkWithNotification = () => {
    DeviceEventEmitter?.addListener('Notification', (notification) => {});
};

const subscribeFCMTopic = (topicName, callBack) => {
    messaging()
        .subscribeToTopic(topicName)
        .then(() => console.log(`FCM Subscribed to topic: ${topicName}`))
        .then(callBack)
        .catch((error) => {});
};

const requestUserPermission = async () => {
    if (isANDROID) {
        try {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } catch (err) {}
    }
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
};

const getToken = async () => {
    const token = await messaging().getToken();
    dispatch(updateFCMToken(token));
    console.log('FCM device token: ', token);
    FCMToken = token;
    return token;
};

export { initFCM, subscribeFCMTopic, getToken, requestUserPermission };
