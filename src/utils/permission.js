import { Alert } from 'react-native';
import {
    check,
    checkMultiple,
    openSettings,
    PERMISSIONS,
    request,
    requestMultiple,
    RESULTS,
} from 'react-native-permissions';
import { isANDROID, isIOS } from './appUtil';

export function openAppSettings() {
    openSettings().catch(() => console.warn('Cannot open settings'));
}

const alertFailed = () => {
    Alert.alert('Yêu cầu quyền thất bại', 'Vui lòng thử lại sau!', [
        {
            text: 'Đóng',
            onPress: () => {},
        },
    ]);
};

const alertUnavailable = () => {
    Alert.alert('Yêu cầu quyền truy cập', 'Tính năng này không khả dụng với thiết bị này!', [
        {
            text: 'Đóng',
            onPress: () => {},
        },
    ]);
};

const alertDenied = (title) => {
    Alert.alert(
        'Yêu cầu quyền truy cập',
        title || 'Vui lòng cấp quyền sử dụng ảnh và video để sử dụng tính năng này!',
        [
            {
                text: 'Huỷ',
                onPress: () => {},
            },
            {
                text: 'Cài đặt',
                onPress: () => {
                    openAppSettings();
                },
            },
        ]
    );
};

export const checkPhotoLibraryPermission = (callback) => {
    let libraryPermission = isIOS
        ? [PERMISSIONS.IOS.PHOTO_LIBRARY]
        : [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES];
    if (isANDROID) {
        requestMultiple(libraryPermission)
            .then((result) => {
                if (
                    result[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED ||
                    result[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.GRANTED
                ) {
                    callback();
                } else if (
                    result[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.DENIED ||
                    result[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.DENIED
                ) {
                    requestMultiple(libraryPermission).then((resultItem) => {
                        if (
                            resultItem[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.GRANTED ||
                            resultItem[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ===
                                RESULTS.GRANTED
                        ) {
                            callback();
                        } else if (
                            result[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.DENIED ||
                            result[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.DENIED
                        ) {
                            alertDenied();
                        }
                    });
                } else if (
                    result[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.BLOCKED ||
                    result[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.BLOCKED
                ) {
                    alertDenied();
                } else if (
                    result[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] === RESULTS.UNAVAILABLE ||
                    result[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.UNAVAILABLE
                ) {
                    alertUnavailable();
                } else {
                    alertDenied();
                }
            })
            .catch((error) => {
                alertFailed();
            });
    } else {
        // Check IOS
        requestMultiple(libraryPermission)
            .then((result) => {
                if (result[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.GRANTED) {
                    callback();
                } else if (result[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.DENIED) {
                    requestMultiple(libraryPermission).then((resultItem) => {
                        if (resultItem[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.GRANTED) {
                            callback();
                        } else if (resultItem[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.DENIED) {
                            alertDenied();
                        }
                    });
                } else if (result[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.BLOCKED) {
                    alertDenied();
                } else if (result[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.UNAVAILABLE) {
                    alertUnavailable();
                } else {
                    alertDenied();
                }
            })
            .catch((error) => {
                alertFailed();
            });
    }
};

export const checkCameraPermission = (callback) => {
    let libraryPermission = isIOS
        ? [PERMISSIONS.IOS.CAMERA]
        : [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE];
    requestMultiple(libraryPermission)
        .then((result) => {
            if (isANDROID) {
                if (
                    result[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED ||
                    result[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.GRANTED
                ) {
                    callback();
                } else if (
                    result[PERMISSIONS.ANDROID.CAMERA] === RESULTS.DENIED ||
                    result[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.DENIED
                ) {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                } else if (
                    result[PERMISSIONS.ANDROID.CAMERA] === RESULTS.BLOCK ||
                    result[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.BLOCK
                ) {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                } else if (
                    result[PERMISSIONS.ANDROID.CAMERA] === RESULTS.UNAVAILABLE ||
                    result[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.UNAVAILABLE
                ) {
                    alertUnavailable();
                } else {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                }
            } else {
                // Check IOS
                if (result[PERMISSIONS.IOS.CAMERA] === RESULTS.GRANTED) {
                    callback();
                } else if (result[PERMISSIONS.IOS.CAMERA] === RESULTS.DENIED) {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                } else if (result[PERMISSIONS.IOS.CAMERA] === RESULTS.BLOCK) {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                } else if (result[PERMISSIONS.IOS.CAMERA] === RESULTS.UNAVAILABLE) {
                    alertUnavailable();
                } else {
                    alertDenied('Vui lòng cấp quyền sử dụng máy ảnh để sử dụng tính năng này!');
                }
            }
        })
        .catch((error) => {
            alertFailed();
        });
};

export const checkRecordPermission = (callback) => {
    if (isANDROID) {
        let libraryPermissions = [
            PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
        ];
        checkMultiple(libraryPermissions)
            .then((results) => {
                switch (
                    results['android.permission.RECORD_AUDIO'] ||
                    results['android.permission.READ_EXTERNAL_STORAGE'] ||
                    results['android.permission.WRITE_EXTERNAL_STORAGE']
                ) {
                    case RESULTS.UNAVAILABLE:
                        break;
                    case RESULTS.BLOCKED:
                        alertDenied(
                            'Vui lòng cấp quyền sử dụng máy ghi âm để sử dụng tính năng này!'
                        );
                        break;
                    case RESULTS.DENIED:
                        requestMultiple(libraryPermissions)
                            .then((result) => {
                                if (result === RESULTS.GRANTED) {
                                    callback();
                                } else if (result === RESULTS.DENIED) {
                                    alertDenied(
                                        'Vui lòng cấp quyền sử dụng máy ghi âm để sử dụng tính năng này!'
                                    );
                                }
                            })
                            .catch((error) => {});
                        break;
                    case RESULTS.GRANTED:
                        callback();
                        break;
                    default:
                        alertDenied(
                            'Vui lòng cấp quyền sử dụng máy ghi âm để sử dụng tính năng này!'
                        );
                        break;
                }
            })
            .catch((error) => {
                alertFailed();
            });
    } else {
        callback();
    }
};
