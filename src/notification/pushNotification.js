import { useEffect } from 'react';
import { initFCM } from '../utils/firebaseMessaging';
import {
    checkExitsChannel,
    createChannel,
    initLocalNotification,
} from '../utils/localPushNotification';

function PushNotification() {
    useEffect(() => {
        // Local notify
        initLocalNotification();
        createLocalChannel();

        // FCM
        initFCM();
    }, []);

    const createLocalChannel = () => {
        checkExitsChannel('Mailisa', createChannel('Mailisa'));
    };

    return null;
}

export default PushNotification;
