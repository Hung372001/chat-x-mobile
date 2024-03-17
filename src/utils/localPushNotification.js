import PushNotificationIOS from '@react-native-community/push-notification-ios';
import _ from 'lodash';
import store from '../redux/Store';
import { Platform } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import { OnPressNotification } from './handlePushNotification';

const initLocalNotification = () => {
    PushNotification.configure({
        onRegister: function (token) {
            console.log('NOTIFICATION TOKEN:', token);
        },

        onNotification: function (notification) {
            // on press notification handling
            if (notification.userInteraction) {
                OnPressNotification(notification);
            }
            if (Platform.OS === 'ios') {
                // (required) Called when a remote is received or opened, or local notification is opened
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            }
        },

        onAction: function (notification) {
            console.log('ACTION:', notification.action);
            console.log('ACTION NOTIFICATION:', notification);
        },

        onRegistrationError: function (err) {
            console.error(err.message, err);
        },

        permissions: {
            alert: true,
            badge: true,
            sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
    });
};

const setBadgeNumber = (number) => {
    PushNotification.setApplicationIconBadgeNumber(number);
};

const checkExitsChannel = (channelId, callBack) => {
    PushNotification.channelExists(channelId, (exists) => {
        if (!exists) {
            callBack;
        }
    });
};

const deleteChannel = (channelId) => {
    PushNotification.deleteChannel(channelId);
};

const createChannel = (channelId) => {
    PushNotification.createChannel(
        {
            channelId: channelId,
            channelName: 'Mailisa',
            channelDescription: `Category channel > ${channelId}`,
            playSound: true,
            soundName: 'default',
            importance: Importance.HIGH,
            vibrate: true,
        },
        (created) => {
            console.log(`Create channel: '${created}'`);
            PushNotification.getChannels((channel_ids) => {
                console.log('Current channel ids: ', channel_ids);
            });
        }
    );
};

const createNotification = async (notifyData) => {
    // check push from BE or FCM console
    // BE has data, FCM has not.
    const state = store.getState();
    const soundNotification = state?.auth?.userProfile?.soundNotification;

    if (soundNotification) {
        if (!_.isEmpty(notifyData.notification.android)) {
            PushNotification.localNotification({
                channelId: 'Mailisa',
                ignoreInForeground: false,
                title: notifyData?.notification?.title,
                message: notifyData?.notification?.body,
                playSound: true,
                priority: 'max',
                importance: 'max',
                data: {
                    groupId: notifyData?.data?.groupId,
                },
            });
        } else {
            PushNotification.localNotification({
                channelId: 'Mailisa',
                ignoreInForeground: false,
                title: notifyData?.notification?.title,
                message: notifyData?.notification?.body,
                playSound: true,
                smallIcon: '',
                priority: 'max',
                importance: 'max',
                data: {
                    groupId: notifyData?.data?.groupId,
                },
            });
        }
    }
};

export {
    initLocalNotification,
    createChannel,
    createNotification,
    checkExitsChannel,
    deleteChannel,
    setBadgeNumber,
};
