import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import CustView from './custView';
import CustText from './custText';
import RBSheet from 'react-native-raw-bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/colors';
import { isEmpty } from 'lodash';
import { isANDROID, metrics } from '../utils';
import { checkCameraPermission, checkPhotoLibraryPermission } from '../utils/permission';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useUpdateAvatarMutation, useUploadImageMutation } from '../services/authApi';
import { alertError } from './alert';
import { SkypeIndicator } from 'react-native-indicators';
import { Video, Image } from 'react-native-compressor';

const ImagePicker = ({
    modalRef,
    optionsProps,
    onUploadSuccess,
    isAvatar = false,
    saveToLocal = false,
    isDarkMode = false,
}) => {
    const [uploadImage, { isLoading: isLoadingUpload }] = useUploadImageMutation();
    const [updateAvatar, { isLoading: isLoadingUpdate }] = useUpdateAvatarMutation();
    const [isCompress, setIsCompress] = useState(false);

    const onSelectFromCamera = () => {
        // modalRef?.current?.close();
        let options = {
            maxWidth: 1024,
            maxHeight: 1024,
            saveToPhotos: true,
            mediaType: 'mixed',
        };
        checkCameraPermission(async () => {
            await launchCamera(optionsProps || options, async (response) => {
                if (response?.didCancel) {
                    // console.log('User cancelled image picker');
                } else if (response?.error) {
                    // console.log('ImagePicker Error: ', response?.error);
                } else if (response.customButton) {
                    // console.log('User tapped custom button: ', response?.customButton);
                } else {
                    setIsCompress(true);
                    modalRef?.current?.close();
                    if (!isEmpty(response?.assets)) {
                        const { fileName, type, uri } = response?.assets?.[0];
                        let result;
                        const file = new FormData();
                        if (
                            type?.includes('video') ||
                            type?.includes('mp4') ||
                            type?.includes('mov') ||
                            type?.includes('wmv') ||
                            type?.includes('avi') ||
                            type?.includes('flv')
                        ) {
                            try {
                                result = await Video.compress(uri, {}, (progress) => {
                                    console.log('Compression Progress: ', progress);
                                });
                            } catch (error) {
                                result = uri;
                            }
                            file.append('file', {
                                name: `${fileName}${isANDROID ? '.mp4' : ''}`,
                                type: 'video/mp4',
                                uri: isANDROID ? result : result?.replace('file://', ''),
                            });
                        } else {
                            result = await Image.compress(uri);
                            file.append('file', {
                                name: fileName,
                                type: type,
                                uri: isANDROID ? result : result?.replace('file://', ''),
                            });
                        }
                        if (saveToLocal) {
                            onUploadSuccess({ fileName, type, result });
                        } else {
                            uploadImage(file)
                                .unwrap()
                                .then(async (value) => {
                                    if (isAvatar) {
                                        updateAvatar({ avatar: value?.data?.url })
                                            .unwrap()
                                            .then(async (value) => {
                                                onUploadSuccess(value);
                                            })
                                            .catch((err) => {
                                                alertError(
                                                    err?.data?.message ||
                                                        'Cập nhật ảnh đại diện thất bại!'
                                                );
                                            })
                                            .finally(() => {
                                                modalRef?.current?.close();
                                            });
                                    } else {
                                        onUploadSuccess(value);
                                    }
                                })
                                .catch((err) => {
                                    alertError(err?.data?.message || 'Tải ảnh lên thất bại!');
                                })
                                .finally(() => {});
                        }
                    } else {
                        alertError('Tải ảnh lên thất bại!!');
                    }
                    setIsCompress(false);
                }
            });
        });
    };

    const onSelectFromGallery = () => {
        // modalRef?.current?.close();
        // Handle select image from gallery
        let options = {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 1,
            mediaType: 'mixed',
        };
        checkPhotoLibraryPermission(async () => {
            await launchImageLibrary(optionsProps || options, async (response) => {
                if (response?.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response?.error) {
                    console.log('ImagePicker Error: ', response?.error);
                } else if (response?.customButton) {
                    console.log('User tapped custom button: ', response?.customButton);
                } else {
                    setIsCompress(true);
                    modalRef?.current?.close();
                    if (!isEmpty(response?.assets)) {
                        const { fileName, type, uri } = response?.assets[0];
                        let result;

                        const file = new FormData();
                        if (
                            type?.includes('video') ||
                            type?.includes('mp4') ||
                            type?.includes('mov') ||
                            type?.includes('wmv') ||
                            type?.includes('avi') ||
                            type?.includes('flv')
                        ) {
                            try {
                                result = await Video.compress(uri, {}, (progress) => {
                                    console.log('Compression Progress: ', progress);
                                });
                            } catch (error) {
                                result = uri;
                            }
                            file.append('file', {
                                name: `${fileName}${isANDROID ? '.mp4' : ''}`,
                                type: 'video/mp4',
                                uri: isANDROID ? result : result?.replace('file://', ''),
                            });
                        } else {
                            result = await Image.compress(uri);
                            file.append('file', {
                                name: fileName,
                                type: type,
                                uri: isANDROID ? result : result?.replace('file://', ''),
                            });
                        }
                        if (saveToLocal) {
                            onUploadSuccess({ fileName, type, result });
                        } else {
                            uploadImage(file)
                                .unwrap()
                                .then(async (value) => {
                                    if (isAvatar) {
                                        updateAvatar({ avatar: value?.data?.url })
                                            .unwrap()
                                            .then(async (value) => {
                                                onUploadSuccess(value);
                                            })
                                            .catch((err) => {
                                                alertError(
                                                    err?.data?.message ||
                                                        'Cập nhật ảnh đại diện thất bại!'
                                                );
                                            })
                                            .finally(() => {
                                                modalRef?.current?.close();
                                            });
                                    } else {
                                        onUploadSuccess(value);
                                    }
                                })
                                .catch((err) => {
                                    alertError(err?.data?.message || 'Tải ảnh lên thất bại!');
                                })
                                .finally(() => {});
                        }
                    } else {
                        alertError('Tải ảnh lên thất bại!!');
                    }
                    setIsCompress(false);
                }
            });
        });
    };

    return (
        <>
            <RBSheet
                ref={modalRef}
                height={metrics.screenHeight * 0.4}
                duration={250}
                customStyles={{
                    container: {
                        paddingLeft: 15,
                        paddingRight: 15,
                        borderTopEndRadius: 16,
                        borderTopStartRadius: 16,
                        backgroundColor: isDarkMode ? Colors.dark : Colors.white,
                    },
                }}
            >
                <CustView transparentBg center>
                    <CustText bold style={{ marginTop: 12 }} size={17}>
                        Tải ảnh lên
                    </CustText>
                    <CustText style={{ marginTop: 4 }}>{'Chọn 1 trong 2 phương thức'}</CustText>
                </CustView>
                <CustView
                    row
                    style={{
                        margin: 24,
                        marginHorizontal: 12,
                        borderColor: '#F57291',
                        justifyContent: 'space-around',
                    }}
                >
                    <TouchableOpacity onPress={onSelectFromCamera}>
                        <CustView
                            center
                            style={{
                                paddingHorizontal: 18,
                                borderWidth: 2,
                                borderRadius: 12,
                                aspectRatio: 1,
                                borderColor: Colors.lightBlue,
                                width: metrics.screenWidth * 0.35,
                            }}
                        >
                            <CustView center style={{ height: 40, width: 40 }}>
                                <Ionicons name="camera-outline" color={Colors.grey} size={32} />
                            </CustView>
                            <CustText bold style={{ marginTop: 8 }}>
                                Chup ảnh
                            </CustText>
                        </CustView>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSelectFromGallery}>
                        <CustView
                            center
                            style={{
                                paddingHorizon: 8,
                                borderWidth: 2,
                                borderRadius: 12,
                                aspectRatio: 1,
                                borderColor: Colors.lightBlue,
                                width: metrics.screenWidth * 0.35,
                            }}
                        >
                            <CustView center transparentBg style={{ height: 60, width: 60 }}>
                                <Ionicons name="images-outline" color={Colors.grey} size={32} />
                            </CustView>
                            <CustText bold style={{ textAlign: 'center', marginTop: 8 }}>
                                Chọn từ thư viện
                            </CustText>
                        </CustView>
                    </TouchableOpacity>
                </CustView>
            </RBSheet>
            {(isCompress || isLoadingUpload) && (
                <CustView
                    style={{
                        opacity: 0.5,
                        backgroundColor: Colors.black,
                        position: 'absolute',
                        height: metrics.screenHeight,
                        width: metrics.screenWidth,
                    }}
                >
                    <SkypeIndicator count={7} size={20} color="#fff" />
                </CustView>
            )}
        </>
    );
};

export default ImagePicker;
const styles = StyleSheet.create({});
