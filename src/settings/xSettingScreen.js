import React, { memo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import {
    BackHeader,
    ConfirmDialog,
    CustBaseView,
    CustButton,
    CustText,
    CustView,
} from '../components';
import { metrics, getCurrentAppVersion } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate, resetTo } from '../navigation/navigationUtils';
import { images } from '../../assets';
import Colors from '../utils/colors';
import SelectDropdown from 'react-native-select-dropdown';
import { updateLogout, updateProfile } from '../redux/authSlice';
import { updateDarkMode } from '../redux/SettingSlice';
import { useRemoveFCMTokenMutation } from '../services/notificationApi';
import {
    useDeleteUserMutation,
    useUpdateHiddenMutation,
    useUpdateSoundNotificationMutation,
} from '../services/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { chatApi } from '../services/chatApi';
import { checkCodePush } from '../utils/checkCodePush';
import { isEmpty } from 'lodash';
import { alertSuccess } from '../components/alert';
import { useSocket } from '../utils/socketIO';

const XSettingScreen = memo((props) => {
    const refDropdown = useRef();
    const refGroupModal = useRef();
    const socket = useSocket();
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const [removeFCMToken] = useRemoveFCMTokenMutation();
    const [updateSoundNotification] = useUpdateSoundNotificationMutation();
    const [updateHidden] = useUpdateHiddenMutation();
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);
    const { fCMId, userProfile, fCMToken } = useSelector((state) => state.auth);
    const [deleteUser, { isLoading }] = useDeleteUserMutation();

    const onMenuPress = (menuItem) => {
        if (menuItem.id == 0) {
            updateHidden()
                .unwrap()
                .then((value) => {
                    dispatch(
                        updateProfile({
                            ...userProfile,
                            hiding: value.data.hiding,
                        })
                    );
                })
                .catch((err) => {});
        } else if (menuItem.id == 1) {
            dispatch(updateDarkMode(!isDarkMode));
        } else if (menuItem.id == 2) {
            updateSoundNotification()
                .unwrap()
                .then((value) => {
                    dispatch(
                        updateProfile({
                            ...userProfile,
                            soundNotification: value.data.soundNotification,
                        })
                    );
                })
                .catch((err) => {});
        } else if (menuItem.id == 3) {
            refDropdown?.current?.openDropdown();
        } else if (menuItem.id == 4) {
            navigate('xChangePasswordScreen');
        } else if (menuItem?.type === 'DELETE') {
            refGroupModal.current?.toggle({
                onOK: () => onDeleteUserPress(),
            });
        }
    };

    const onDeleteUserPress = () => {
        deleteUser({ userId: userProfile?.id })
            .unwrap()
            .then(() => {
                alertSuccess('Xoá tài khoản thành công!');
                onLogoutPress();
            })
            .catch((err) => {
                alertError(err.data?.message ?? 'Xoá tài khoản thất bại?');
            })
            .finally(() => {});
    };

    const onLogoutPress = () => {
        removeFCMToken(fCMToken)
            .unwrap()
            .then(() => {})
            .catch((err) => {});
        if (!isEmpty(socket)) {
            socket?.emit('offline');
        }
        dispatch(updateLogout({}));
        dispatch(chatApi?.util?.resetApiState({}));
        resetTo('xAuthStack');
    };

    const renderDropdownIcon = (isOpened) => {
        return (
            <Image
                source={images.down}
                style={[
                    styles.iconSize,
                    {
                        tintColor: !isDarkMode ? Colors.white : Colors.black,
                        width: 12,
                        height: 12,
                    },
                ]}
            />
        );
    };

    const buildSwitch = (menuItem) => {
        if (menuItem.type == 'PRIVATE') {
            return (
                <Switch
                    value={!userProfile?.hiding}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={() => {}}
                />
            );
        }
        if (menuItem.type == 'DARK_MODE') {
            return (
                <Switch
                    value={!isDarkMode}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={() => {}}
                />
            );
        }
        if (menuItem.type == 'SOUND') {
            return (
                <Switch
                    value={userProfile?.soundNotification}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={() => {}}
                />
            );
        }
        if (menuItem.type == 'LANGUAGE') {
            return (
                // Dropdown for select language
                <SelectDropdown
                    ref={refDropdown}
                    data={LANGUAGES}
                    defaultValue={1}
                    defaultValueByIndex={0}
                    dropdownOverlayColor={Colors.transparent}
                    showsVerticalScrollIndicator={false}
                    buttonTextStyle={{
                        fontSize: 12,
                        textAlign: 'right',
                        color: !isDarkMode ? 'white' : 'black',
                    }}
                    renderDropdownIcon={(isOpen) => renderDropdownIcon(isOpen)}
                    rowStyle={{ backgroundColor: '#838C94', height: 38 }}
                    rowTextStyle={{
                        fontSize: 10,
                        textAlign: 'right',
                        color: !isDarkMode ? Colors.white : 'black',
                    }}
                    dropdownStyle={styles.dropdownStyle}
                    buttonStyle={[
                        styles.dropdownBtnStyle,
                        {
                            backgroundColor: !isDarkMode ? '#A2AEBA' : '#AFBAC5',
                            borderBottomLeftRadius: 9,
                            borderBottomRightRadius: 9,
                        },
                    ]}
                    onSelect={(selectedItem, index) => {
                        // console.log(selectedItem, index);
                    }}
                    buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem;
                    }}
                    rowTextForSelection={(item, index) => {
                        return item;
                    }}
                />
            );
        }
    };

    return (
        <CustBaseView isEnableBackground>
            {/* Header  */}
            <BackHeader title={'Cài đặt'} />
            <CustView
                fillHeight
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                {/* Setting Menu */}
                <CustView fillHeight>
                    {MENU_DATA?.map((menuItem, index) => {
                        return (
                            <TouchableOpacity
                                key={index.toString()}
                                activeOpacity={1}
                                onPress={() => onMenuPress(menuItem)}
                                style={styles.btnMenuStyle}
                            >
                                <Image
                                    source={menuItem.icon}
                                    style={[
                                        styles.iconSize,
                                        {
                                            tintColor:
                                                menuItem?.type === 'DELETE'
                                                    ? 'red'
                                                    : isDarkMode
                                                    ? Colors.white
                                                    : 'grey',
                                        },
                                    ]}
                                />
                                <CustView fillHeight style={{ marginLeft: 11 }} transparentBg>
                                    <CustText
                                        size={14}
                                        style={{
                                            color:
                                                menuItem?.type === 'DELETE'
                                                    ? 'red'
                                                    : isDarkMode
                                                    ? Colors.white
                                                    : Colors.black,
                                        }}
                                    >
                                        {menuItem?.title}
                                    </CustText>
                                </CustView>
                                <View style={{ position: 'absolute', right: 0, zIndex: -100 }}>
                                    {buildSwitch(menuItem)}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    <CustView row>
                        <CustView fillWidth />
                        <TouchableOpacity
                            activeOpacity={1}
                            onLongPress={checkCodePush}
                            style={{ marginTop: 12 }}
                        >
                            <CustText color={'silver'} size={12}>
                                {getCurrentAppVersion()}
                            </CustText>
                        </TouchableOpacity>
                    </CustView>
                </CustView>
                <CustView row centerVertical>
                    <CustButton
                        title="Đăng xuất"
                        activeOpacity={0.6}
                        onPress={onLogoutPress}
                        buttonStyle={styles.logoutButton}
                        containerStyle={{ width: '100%' }}
                    />
                </CustView>
            </CustView>
            <ConfirmDialog
                ref={refGroupModal}
                showCancelBtn
                showOKBtn
                isDarkMode={isDarkMode}
                title={`Thông báo`}
                onOK={() => {}}
                submitText={'Đồng ý'}
            >
                <CustView style={{ marginBottom: 32, marginTop: 8 }}>
                    <CustText>Bạn muốn xoá tài khoản?</CustText>
                    <CustText style={{ marginTop: 4 }} color={'red'} numberOfLines={2}>
                        * Tất cả dữ liệu sẽ được xoá vĩnh viễn!
                    </CustText>
                </CustView>
            </ConfirmDialog>
        </CustBaseView>
    );
});

export default XSettingScreen;

const styles = StyleSheet.create({
    contentView: {
        paddingTop: 22,
        paddingHorizontal: 26,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    iconSize: {
        height: 24,
        width: 24,
    },
    btnMenuStyle: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: `rgba(138, 154, 169, 0.3)`,
    },
    logoutButton: {
        height: 48,
        marginTop: 16,
        marginBottom: 24,
    },
    dropdownBtnStyle: {
        height: 32,
        width: metrics.screenWidth * 0.3,
        borderTopLeftRadius: 9,
        borderTopRightRadius: 9,
    },
    dropdownStyle: {
        borderBottomLeftRadius: 9,
        borderBottomRightRadius: 9,
        marginTop: '-6.5%',
        height: 92,
    },
});

const MENU_DATA = [
    {
        id: 0,
        type: 'PRIVATE',
        title: 'Cho phép mọi người tìm thấy tôi',
        icon: images.iconUnlock,
        onPress: () => {},
    },
    {
        id: 1,
        type: 'DARK_MODE',
        title: 'Giao diện sáng/tối',
        icon: images.iconMoon,
        onPress: () => {},
    },
    {
        id: 2,
        type: 'SOUND',
        title: 'Âm thanh',
        icon: images.iconSound,
        onPress: () => {},
    },
    {
        id: 3,
        type: 'LANGUAGE',
        title: 'Ngôn ngữ',
        icon: images.iconBrowse,
        onPress: () => {},
    },
    {
        id: 4,
        type: 'PASSWORD',
        title: 'Đổi mật khẩu',
        icon: images.iconKey,
        onPress: () => {},
    },
    {
        id: 5,
        type: 'DELETE',
        title: 'Xoá tài khoản',
        icon: images.iconUser,
        onPress: () => {},
    },
];
const LANGUAGES = ['Vietnamese', 'English'];
