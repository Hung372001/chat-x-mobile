import React, { useEffect, useState } from 'react';
import { navigate, resetTo } from '../navigation/navigationUtils';
import { SkypeIndicator } from 'react-native-indicators';
import { useGetGroupChatByIdMutation } from '../services/chatApi';
import { isEmpty } from 'lodash';
import { useIsFocused } from '@react-navigation/native';

export function OnPressNotification(data) {
    const isForeground = data?.foreground;
    if (!isEmpty(data?.data?.groupId) || !isEmpty(data?.data?.aps?.data?.groupId)) {
        if (isForeground) {
            navigate('xPreloadNotify', {
                notifyData: data,
            });
        } else {
            const timeOut = setTimeout(() => {
                navigate('xPreloadNotify', {
                    notifyData: data,
                });
                clearTimeout(timeOut);
            }, 200);
        }
    }
    return;
}

export function XPreloadScreenNotify({ route, navigation }) {
    const notifyData = route?.params?.notifyData;
    const isFocused = useIsFocused();
    const [fistOpen, setFirstOpen] = useState(true);
    const [getGroupChatById, { isLoading }] = useGetGroupChatByIdMutation();

    useEffect(() => {
        if (isFocused) {
            if (fistOpen) {
                if (notifyData?.data) {
                    getGroupChatById({ id: notifyData?.data?.groupId }).then((value) => {
                        const type = value?.data?.data?.type;
                        navigate('xMessageScreen', {
                            item: value?.data?.data,
                            fromNotify: true,
                        });
                    });
                } else {
                    resetTo('xHome');
                }
                setFirstOpen(false);
            } else {
                setFirstOpen(true);
                resetTo('xHome');
            }
        }
    }, [isFocused]);

    return (
        <>
            <SkypeIndicator count={7} size={20} color="#47C3ED" />
        </>
    );
}
