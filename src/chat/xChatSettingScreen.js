import React, { memo, useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Switch, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import {
    BackHeader,
    CustBaseView,
    CustButton,
    CustView,
    CustText,
    CustTextField,
    ConfirmDialog,
} from '../components';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    MENU_DATA_PERSONAL,
    MENU_DATA_GROUP,
    CLEAR_HISTORY_DATA,
    CLEAR_HISTORY_DATA_DARK_MODE,
} from './constants/xChatSettingConstants';
import Colors from '../utils/colors';
import { useSelector } from 'react-redux';
import RadioGroup from 'react-native-radio-buttons-group';
import {
    useClearMessageSequenceMutation,
    useCleatChatMessageMutation,
    useDeleteGroupChatMutation,
    useGetPersonalSettingQuery,
    useLeaveGroupMutation,
    useToggleAddFriendSettingMutation,
    useToggleGroupTypeSettingMutation,
    useToggleMuteSettingMutation,
    useTogglePinSettingMutation,
    useUpdateNickNameMutation,
} from '../services/chatApi';
import { alertError, alertSuccess } from '../components/alert';
import { isEmpty } from 'lodash';
import { Keyboard } from 'react-native';
import { goBack, navigate, popBack } from '../navigation/navigationUtils';
import Avatar from '../components/Avatar';

const BUTTON_WIDTH = metrics.screenWidth - 66;
const XChatSettingScreen = (props) => {
    const refLeaveGroup = useRef();
    const item = props.route?.params;
    const onUpdateUserNickname = props.route?.params?.onUpdateUserNickname;
    const onUpdateProps = item?.onUpdate;
    const groupItem = props.route?.params.groupItem;
    const isGroup = item.type === 'GROUP';
    const isUser = item.type === 'USER';
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);
    const userProfile = useSelector((state) => state.auth.userProfile);

    const [toggleMuteSetting, {}] = useToggleMuteSettingMutation();
    const [togglePinSetting, {}] = useTogglePinSettingMutation();
    const [cleatChatMessage, {}] = useCleatChatMessageMutation();
    const [updateNickName, {}] = useUpdateNickNameMutation();
    const [toggleAddFriendSetting, {}] = useToggleAddFriendSettingMutation();
    const [toggleGroupTypeSetting, {}] = useToggleGroupTypeSettingMutation();
    const [clearMessageSequence, {}] = useClearMessageSequenceMutation();
    const [deleteGroupChat, {}] = useDeleteGroupChatMutation();

    const [isMuteNotification, setIsMuteNotification] = useState(false); // Dou
    const [isPinned, setIsPinned] = useState(false); // Dou
    const [groupSetting, setGroupSetting] = useState(groupItem); // Group and Dou
    const [nickName, setNickName] = useState(''); // Dou
    const [timeClearMessage, setTimeClearMessage] = useState(
        `${groupSetting?.clearMessageDuration}`
    ); // 0: disable, 30: 30 mins, 60: 60 mins, 120: 120 mins // Dou
    const isHasSpecialPermission = groupSetting?.isOwner || groupSetting?.isAdmin;
    const isOwner = groupSetting?.isOwner;
    const insets = useSafeAreaInsets();
    const [leaveGroup, { isLoading }] = useLeaveGroupMutation();

    const findFriend = item?.groupItem?.members?.find(
        (memberItem) => memberItem?.id !== userProfile?.id
    );

    const { data: getPersonalSetting } = useGetPersonalSettingQuery(
        {
            groupId: groupItem?.id,
        },
        { skip: isGroup || isUser }
    );

    useEffect(() => {
        if (!isEmpty(getPersonalSetting)) {
            setIsMuteNotification(getPersonalSetting?.muteNotification);
            setIsPinned(getPersonalSetting?.pinned);
        }
    }, [getPersonalSetting]);

    useEffect(() => {
        // init nickname for personal input nickname
        if (!isGroup) {
            const findFriendData = groupSetting?.members?.find(
                (memberItem) => memberItem?.id !== userProfile?.id
            );
            setNickName(findFriendData?.nickname || '');
        }
    }, []);

    const onMuteNotificationPress = () => {
        // Dual setting => call api getSetting
        setIsMuteNotification(!isMuteNotification);
        toggleMuteSetting({ groupId: getPersonalSetting?.groupId })
            .unwrap()
            .then(async (value) => {
                const isEnable = value?.data?.muteNotification;
                alertSuccess(` ${isEnable ? 'Bật' : 'Tắt'} chế độ không làm phiền thành công!`);
            })
            .catch((err) => {
                setIsMuteNotification(!isMuteNotification);
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onPinnedPress = () => {
        // Dual setting => call api getSetting
        setIsPinned(!isPinned);
        togglePinSetting({ groupId: getPersonalSetting?.groupId })
            .unwrap()
            .then(async (value) => {
                const isPinned = value?.data?.pinned;
                alertSuccess(` ${isPinned ? 'Bật' : 'Tắt'} gim tin nhắn trên cùng thành công!`);
            })
            .catch((err) => {
                setIsPinned(!isPinned);
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onClearChatPress = () => {
        // Dual setting
        cleatChatMessage({ groupId: getPersonalSetting?.groupId })
            .unwrap()
            .then(async (value) => {
                alertSuccess(`Xoá lịch sử trò chuyện thành công!`);
                popBack(2);
            })
            .catch((err) => {
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onSubmitPress = () => {
        // Dual setting change nick name
        if (isHasSpecialPermission) {
            onDeleteGroupChat();
        } else {
            updateNickName({
                userId: findFriend?.id,
                nickName,
            })
                .unwrap()
                .then(async (value) => {
                    onUpdateUserNickname(value?.data);
                    alertSuccess(`Cập nhật biệt danh thành công!`);
                    goBack();
                })
                .catch((err) => {
                    alertError(err?.data?.message ?? 'Thao tác thất bại!');
                })
                .finally(() => Keyboard.dismiss());
        }
    };

    const onAddFriendPress = () => {
        // Group - admin update props
        setGroupSetting((prevState) => {
            return { ...prevState, canAddFriends: !groupSetting?.canAddFriends };
        });
        toggleAddFriendSetting({ groupId: groupSetting?.id })
            .unwrap()
            .then(async (value) => {
                const isCanAddFriend = value?.data?.canAddFriends;
                onUpdateProps({ canAddFriends: isCanAddFriend });
                alertSuccess(` ${isCanAddFriend ? 'Bật' : 'Tắt'} thêm bạn bè thành công!`);
            })
            .catch((err) => {
                setGroupSetting((prevState) => {
                    return { ...prevState, canAddFriends: groupSetting?.canAddFriends };
                });
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onGroupTypePress = () => {
        // Group - admin update props
        setGroupSetting((prevState) => {
            return { ...prevState, isPublic: !groupSetting?.isPublic };
        });
        toggleGroupTypeSetting({ groupId: groupSetting?.id })
            .unwrap()
            .then(async (value) => {
                const isPublic = value?.data?.isPublic;
                onUpdateProps({ isPublic: isPublic });
                alertSuccess(` ${isPublic ? 'Bật' : 'Tắt'} nhóm công khai thành công!`);
            })
            .catch((err) => {
                setGroupSetting((prevState) => {
                    return { ...prevState, isPublic: groupSetting?.isPublic };
                });
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onDeleteGroupChat = () => {
        // Group - Delete
        deleteGroupChat({ groupId: groupSetting?.id })
            .unwrap()
            .then(async (value) => {
                alertSuccess('Xoá nhóm chat thành công!');
                popBack(2);
            })
            .catch((err) => {
                alertError(err?.data?.message ?? 'Xoá nhóm chat thất bại!');
            })
            .finally(() => {});
    };

    const onUpdateAdminList = (groupItemUpdate) => {
        setGroupSetting((prev) => {
            return { ...prev, ...groupItemUpdate };
        });
        onUpdateProps(groupItemUpdate);
    };

    const checkTimeClear = (timeClearValue) => {
        // timeClearValue: 0: disable, 1: 30 mins, 2: 60 mins, 3: 120 mins
        switch (timeClearValue) {
            case '1':
                return { title: 'Không', duration: '0', type: 'Tắt' };
            case '2':
                return { title: '30 phút', duration: '30', type: 'Bật' };
            case '3':
                return { title: '1 giờ', duration: '60', type: 'Bật' };
            case '4':
                return { title: '2 giờ', duration: '120', type: 'Bật' };
            default:
        }
    };

    const convertDurationToValue = (duration) => {
        // timeClearValue: 0: disable, 1: 30 mins, 2: 60 mins, 3: 120 mins
        switch (`${duration}`) {
            case '0':
                return '1';
            case '30':
                return '2';
            case '60':
                return '3';
            case '120':
                return '4';
            default:
        }
    };

    const onClearMessageSequence = (timeClearValue) => {
        // timeClearValue: 0: disable, 1: 30 mins, 2: 60 mins, 3: 120 mins
        // TODO missing setting value
        clearMessageSequence({
            groupId: groupSetting?.id,
            duration: checkTimeClear(timeClearValue)?.duration,
        })
            .unwrap()
            .then(async (value) => {
                const isDisable = `${value?.data?.clearMessageDuration}` === '0';
                setTimeClearMessage(`${value?.data?.clearMessageDuration}`);
                onUpdateProps({ clearMessageDuration: value?.data?.clearMessageDuration });
                alertSuccess(
                    `${isDisable ? 'Tắt' : 'Bật'} tự động xoá tin nhắn ${
                        isDisable
                            ? 'thành công'
                            : `trong ${
                                  checkTimeClear(
                                      convertDurationToValue(value?.data?.clearMessageDuration)
                                  )?.title
                              }!`
                    }`
                );
            })
            .catch((err) => {
                alertError(err?.data?.message ?? 'Thao tác thất bại!');
            })
            .finally(() => {});
    };

    const onAdminPress = () => {
        navigate('xGroupAdminMember', {
            groupItem: groupSetting,
            onUpdate: (groupItemUpdate) => onUpdateAdminList(groupItemUpdate),
        });
    };

    const onMenuPress = (menuItem) => {
        if (menuItem.id == 0) {
        } else if (menuItem.id == 1) {
        } else if (menuItem.id == 2) {
            // Clear chat message
            !isGroup && onClearChatPress();
            isHasSpecialPermission && onAdminPress();
        } else if (menuItem.type === 'LEAVE_GROUP') {
            onLeaveGroup();
        }
    };

    const buildSwitch = (menuItem) => {
        // PERSONAL
        if (menuItem.type == 'DISTURB') {
            return (
                <Switch
                    value={isMuteNotification}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={onMuteNotificationPress}
                />
            );
        } else if (menuItem.type == 'PIN_TOP') {
            return (
                <Switch
                    value={isPinned}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={onPinnedPress}
                />
            );
        } else if (menuItem.type == 'CLEAR_HISTORY') {
            return <></>;
        }

        // GROUP
        if (menuItem.type == 'ADD_FRIEND') {
            return (
                <Switch
                    value={groupSetting?.canAddFriends}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={onAddFriendPress}
                />
            );
        } else if (menuItem.type == 'TYPE') {
            return (
                <Switch
                    value={groupSetting?.isPublic}
                    thumbColor={Colors.white}
                    style={{ transform: [{ scaleX: 1 }, { scaleY: 0.9 }] }}
                    trackColor={{ false: Colors.grey, true: Colors.lightBlue }}
                    onValueChange={onGroupTypePress}
                />
            );
        } else if (menuItem.type == 'ADMIN') {
            return (
                <CustView style={styles.textButton}>
                    <CustText size={12} color={Colors.white}>
                        Hiển thị
                    </CustText>
                </CustView>
            );
        }
    };

    const buildInput = (menuItem) => {
        if (menuItem.type == 'SET_NICKNAME') {
            return (
                <CustTextField
                    value={nickName}
                    placeHolder={'Biệt Danh'}
                    onSubmitEditingText={() => {}}
                    onChangeText={setNickName}
                    textInputContainerStyle={{
                        borderColor: '#8A9AA9',
                        borderWidth: 1,
                    }}
                />
            );
        }

        if (menuItem.type == 'AUTO_CLEAR_MESSAGE') {
            return (
                <RadioGroup
                    radioButtons={useMemo(
                        () => (isDarkMode ? CLEAR_HISTORY_DATA_DARK_MODE : CLEAR_HISTORY_DATA),
                        []
                    )}
                    onPress={onClearMessageSequence}
                    selectedId={convertDurationToValue(timeClearMessage)}
                    layout="row"
                    containerStyle={{
                        marginTop: 12,
                        marginLeft: -7,
                    }}
                    labelStyle={{ fontFamily: 'Montserrat' }}
                />
            );
        }
    };

    const checkName = (member) => {
        const filterFriendAvatar = member?.find((memberItem) => memberItem?.id !== userProfile?.id);
        return filterFriendAvatar?.nickname || filterFriendAvatar?.username;
    };

    const checkAvatar = (member) => {
        const filterFriendAvatar = member?.find((memberItem) => memberItem?.id !== userProfile?.id);
        return filterFriendAvatar?.profile?.avatar;
    };

    const onLeaveGroup = () => {
        refLeaveGroup.current?.toggle({
            onOK: () => {
                leaveGroup({ groupId: groupItem?.id })
                    .unwrap()
                    .then(async (value) => {
                        alertSuccess('Rời nhóm thành công!');
                        popBack(2);
                    })
                    .catch((err) => {
                        alertError(err?.data?.message || 'Rời nhóm thất bại!');
                    })
                    .finally(() => {});
            },
        });
    };

    const buildSettingMenu = () => {
        if (isGroup) {
            return (
                <CustView fillHeight transparentBg={true}>
                    {MENU_DATA_GROUP.map((menuItem, index) => {
                        if (menuItem.type === 'ADMIN' && !isOwner) {
                            return <CustView key={index.toString()}></CustView>;
                        } else {
                            return (
                                <TouchableOpacity
                                    key={index.toString()}
                                    activeOpacity={1}
                                    onPress={() => onMenuPress(menuItem)}
                                    style={styles.btnMenuStyle}
                                >
                                    <CustView fillHeight style={{ marginLeft: 11 }}>
                                        <CustText size={14}>{menuItem?.title}</CustText>
                                        <View>{buildInput(menuItem)}</View>
                                    </CustView>
                                    <View>{buildSwitch(menuItem)}</View>
                                </TouchableOpacity>
                            );
                        }
                    })}
                </CustView>
            );
        } else if (isUser) {
            return (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onLeaveGroup}
                    style={styles.btnMenuStyle}
                >
                    <CustView fillHeight style={{ marginLeft: 11 }}>
                        <CustText size={14}>Rời nhóm</CustText>
                    </CustView>
                </TouchableOpacity>
            );
        } else {
            return (
                <CustView fillHeight transparentBg={true}>
                    {MENU_DATA_PERSONAL.map((menuItem, index) => {
                        return (
                            <TouchableOpacity
                                key={index.toString()}
                                activeOpacity={1}
                                onPress={() => onMenuPress(menuItem)}
                                style={styles.btnMenuStyle}
                            >
                                <CustView fillHeight style={{ marginLeft: 11 }}>
                                    <CustText size={14}>{menuItem?.title}</CustText>
                                    <View>{buildInput(menuItem)}</View>
                                </CustView>
                                <View>{buildSwitch(menuItem)}</View>
                            </TouchableOpacity>
                        );
                    })}
                </CustView>
            );
        }
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader
                title={
                    isGroup || isUser ? (
                        'Cài đặt nhóm'
                    ) : (
                        <CustView transparentBg row centerVertical>
                            <Avatar uri={checkAvatar(groupSetting?.members)} size={40} />
                            <CustText size={18} style={{ marginLeft: 10 }}>
                                {checkName(groupSetting?.members)}
                            </CustText>
                        </CustView>
                    )
                }
                titleStyle={!isGroup ? styles.headerPersonTitle : {}}
            />
            <CustView
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Setting Menu */}
                    {buildSettingMenu()}
                </ScrollView>
                {/* Button View */}
                {(isOwner || groupSetting.type === 'Dou' || item.type === 'PERSONAL') && (
                    <CustView row center>
                        <CustButton
                            title={isGroup ? 'Xoá nhóm' : 'Lưu thay đổi'}
                            activeOpacity={0.6}
                            onPress={onSubmitPress}
                            containerStyle={styles.buttonStyle}
                        />
                    </CustView>
                )}
            </CustView>
            <ConfirmDialog
                ref={refLeaveGroup}
                showCancelBtn
                showOKBtn
                isDarkMode={isDarkMode}
                title={`Thông báo`}
                onOK={() => {}}
                submitText={'Đồng ý'}
            >
                <CustView style={{ marginBottom: 32, marginTop: 8 }}>
                    <CustText>{`Bạn muốn rời khỏi nhóm?`}</CustText>
                </CustView>
            </ConfirmDialog>
        </CustBaseView>
    );
};

export default memo(XChatSettingScreen);

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    headerPersonTitle: {
        fontWeight: 'normal',
        fontStyle: 'italic',
        fontSize: 18,
    },
    buttonStyle: {
        width: BUTTON_WIDTH,
    },
    iconSize: {
        height: 24,
        width: 24,
    },
    btnMenuStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: `rgba(138, 154, 169, 0.3)`,
        paddingVertical: 12,
    },
    textButton: {
        height: 22,
        borderRadius: 21,
        paddingHorizontal: 10,
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
});
