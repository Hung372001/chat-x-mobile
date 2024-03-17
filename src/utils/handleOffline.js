import React, { useEffect } from 'react';
import { useSocket } from './socketIO';
import { useSelector } from 'react-redux';
import { AppState } from 'react-native';
import { isEmpty } from 'lodash';
import BackgroundTimer from 'react-native-background-timer';
import { config } from '../services/globalConfig';

export function HandleOffline() {
    const socket = useSocket();
    const accessToken = useSelector((state) => state.auth?.token);

    useEffect(() => {
        if (!isEmpty(socket)) {
            AppState.addEventListener('change', handleAppStateChange);
            return () => {
                AppState.removeEventListener('change', handleAppStateChange);
            };
        }
    }, [socket]);

    const handleAppStateChange = async (nextAppState) => {
        // nextAppState => active || inactive || background
        if (nextAppState === 'active') {
            if (!isEmpty(socket)) {
                socket?.emit('online');
            }
            BackgroundTimer.stopBackgroundTimer();
        } else if (nextAppState === 'background') {
            if (!isEmpty(accessToken)) {
                BackgroundTimer.runBackgroundTimer(async () => {
                    try {
                        const response = await fetch(`${config.apiUrl}/group-chat/offline`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                        if (response?.status === 200 || response?.ok) {
                            BackgroundTimer.stopBackgroundTimer();
                        }
                    } catch (err) {
                        BackgroundTimer.stopBackgroundTimer();
                    }
                }, 1500);
            }
        }
    };
    return <></>;
}
