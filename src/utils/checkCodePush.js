import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import CodePush from 'react-native-code-push';
import { codePushKey, buildEnv, config } from '../services/globalConfig';

export const checkCodePush = async ({
    onSync = () => {},
    onSyncDone = () => {},
    downloadProgressCallback,
}) => {
    await CodePush.checkForUpdate(codePushKey[buildEnv]).then((update) => {
        if (update) {
            Alert.alert(
                'Cập nhật ứng dụng',
                `Một phiên bản mới đã được phát hành. Bạn có muốn cập nhật ngay không?\nPhiên bản mới nhất ${buildEnv} v${update?.appVersion} re${update?.label}.`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            onSync && onSync();
                            CodePush?.sync(
                                {
                                    installMode: CodePush.InstallMode.IMMEDIATE,
                                    deploymentKey: codePushKey[buildEnv],
                                },
                                (status) => {
                                    switch (status) {
                                        case CodePush.SyncStatus.UPDATE_INSTALLED:
                                        case CodePush.SyncStatus.UNKNOWN_ERROR:
                                            break;
                                    }
                                },
                                downloadProgressCallback
                            )?.finally(onSyncDone);
                        },
                    },
                ]
            );
        } else {
            Alert.alert('Phiên bản hiện tại là phiên bản mới nhất');
        }
    });
};
export const checkCodePushMandatory = async ({
    onSync = () => {},
    onSyncDone = () => {},
    downloadProgressCallback,
}) => {
    if (__DEV__) return onSyncDone();
    try {
        const checkCodePush = await CodePush.checkForUpdate(codePushKey[buildEnv]);
        if (checkCodePush && checkCodePush?.isMandatory) {
            onSync && onSync();
            CodePush?.sync(
                {
                    installMode: CodePush.InstallMode.IMMEDIATE,
                    deploymentKey: codePushKey[buildEnv],
                },
                (status) => {
                    switch (status) {
                        case CodePush.SyncStatus.UPDATE_INSTALLED:
                        case CodePush.SyncStatus.UNKNOWN_ERROR:
                            break;
                    }
                },
                downloadProgressCallback
            ).finally(onSyncDone);
        } else {
            onSyncDone && onSyncDone();
        }
    } catch (error) {
        onSyncDone && onSyncDone();
    }
};

export function useGetVersion() {
    const [version, setVersion] = useState < any > config.currentVersion;
    useEffect(() => {
        if (buildEnv === 'production') {
            setVersion(`${config.currentVersion}`);
            return;
        } else {
            CodePush.getUpdateMetadata().then((update) => {
                if (!update) {
                    setVersion(`${buildEnv} ${config.currentVersion}`);
                } else {
                    const label = update?.label?.substring(1);
                    setVersion(`${buildEnv} ${config.currentVersion} rev.${label}`);
                }
            });
        }
    }, []);
    return version;
}
