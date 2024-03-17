import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Image,
    Animated,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    KeyboardAvoidingView,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import {
    useAcceptFriendMutation,
    useAddFriendMutation,
    useCheckFriendRequestQuery,
    useFindGroupChatIdQuery,
    useGetChatMessageQuery,
} from '../services/chatApi';
import { CustText, CustTextField, CustView } from '../components';
import { isANDROID, isIOS, metrics } from '../utils';
import { images } from '../../assets';
import Colors from '../utils/colors';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useKeyboard } from '@react-native-community/hooks';
import ChatContent from './chatContent';
import GroupChatHeader from './groupChatHeader';
import PersonalChatHeader from './personalChatHeader';
import { useSelector } from 'react-redux';
import { isEmpty, size, uniqBy } from 'lodash';
import { goBack, navigate } from '../navigation/navigationUtils';
import ImagePicker from '../components/imagePicker';
import CustImage from '../components/custImage';
import EmojiPicker from '../components/emojiPicker';
import { alertError, alertSuccess, alertWarning } from '../components/alert';
import { useSocket, useSocketEvent } from '../utils/socketIO';
import { replace } from '../navigation/navigationUtils';
import ImageViewer from '../settings/xImageViewer';
import RBSheet from 'react-native-raw-bottom-sheet';
import { ScrollView } from 'react-native';
import moment from 'moment';
import { socketConstants } from './constants/socketContants';
import { useDebounce } from '../utils/debounce';

const LIMIT = 20;
const XMessageScreen = (props) => {
    const socket = useSocket(true);
    const refReportModal = useRef();
    const keyboard = useKeyboard();
    const mounted = useRef(false);
    const refChat = useRef();
    const refImagePicker = useRef();
    const refEmojiPicker = useRef();
    const inputViewHeight = useRef(new Animated.Value(isANDROID ? 60 : 80));
    const item = props.route.params?.item;
    // const onUpdateMessage = props.route.params?.onUpdateMessage;

    const fromNotify = props.route.params?.fromNotify;
    const isEnableChat = item?.enabledChat || true; // Check for disable chat input
    const isAdmin = item?.isAdmin || item?.isOwner || false;
    const isGroup = item?.type === 'Group';
    const isFromContact = props.route.params?.fromScreen === 'CONTACT'; // Call from Contact
    const isKeyboardShow = keyboard.keyboardShown;
    const { debounce } = useDebounce();
    const userProfile = useSelector((state) => state.auth?.userProfile);
    const isRootAdmin = userProfile?.roles?.[0]?.type === 'ADMIN';
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const [inputMessage, setInputMessage] = useState(''); // Input value
    const [member, setMember] = useState(item?.members || []);
    const [totalMember, setTotalMember] = useState(item?.memberQty || 0);
    const [messageData, setMessageData] = useState([]); // List message
    const [pinMessage, setPinMessage] = useState([]);
    const [indexPin, setIndexPin] = useState(0);
    const [clickedMessage, setClickedMessage] = useState({});
    const [acceptFriendData, setAcceptFriendData] = useState({});
    const [groupItem, setGroupItem] = useState(item);
    const [imageViewer, setImageViewer] = useState({});
    const [idRoom, setIdRoom] = useState(item?.id);
    const [isOnline, setIsOnline] = useState(true);
    const [isAddFriendRequest, setIsAddFriendRequest] = useState(false);
    const [isHasRoomId, setIsHasRoomId] = useState(!isEmpty(item?.type)); // Check itemId is RoomId or userId => item.type hasRoomId
    const [skipFetchMessage, setSkipFetchMessage] = useState(isFromContact || isEmpty(item?.type));
    const isChatGroup = !isEmpty(groupItem?.type);

    const {
        data: dataGroup,
        // isLoading: isLoadingGroup,
        isFetching: isLoadingGroup,
        refetch: reFetchGroupChat,
    } = useGetChatMessageQuery(
        {
            page: page,
            limit: LIMIT,
            groupChatId: idRoom,
        },
        { skip: skipFetchMessage }
    );

    // When item is User => do not have RoomId
    // Call useFindGroupChatIdQuery to find roomId,
    // Success => update roomId and reFetch getGroupChat api
    const groupChatIdData = useFindGroupChatIdQuery({ userId: item?.id }, { skip: isHasRoomId });

    const [acceptFriend, {}] = useAcceptFriendMutation();
    const [addFriend, { isLoading }] = useAddFriendMutation();
    const filterMember = useMemo(() => {
        if (!isEmpty(groupItem?.members)) {
            const filter = groupItem?.members?.find(
                (filterItem) => filterItem?.id !== userProfile?.id
            );
            return filter;
        } else {
            return {};
        }
    }, [groupItem]);

    const { data: strangerData, refetch: reFetchFriendData } = useCheckFriendRequestQuery(
        { userId: filterMember?.id || item?.id },
        { skip: isGroup }
    );

    useEffect(() => {
        if (!isEmpty(groupChatIdData?.data)) {
            setGroupItem(groupChatIdData?.data);
            setMember(groupChatIdData?.data?.members);
            setTotalMember(groupChatIdData?.data?.memberQty);
            setIdRoom(groupChatIdData?.data?.id);
            setIsHasRoomId(true);
            setSkipFetchMessage(false); // Refetch getGroupChatMessage
        }
    }, [groupChatIdData?.data]);

    // ? Check connect and error
    useSocketEvent(socket, socketConstants.ONLINE, () => {
        console.log(`--------On connected to SocketIO -------`);
    });
    useSocketEvent(socket, socketConstants.DISCONNECT, () => {
        console.log(`--------On disconnect to SocketIO ------`);
    });
    useSocketEvent(socket, socketConstants.ERROR, () => {
        console.log(`--------On error ------`);
    });
    useSocketEvent(socket, socketConstants.CONNECT_ERROR, (con_error) => {
        console.log(`--------On connect_error ------ `, con_error);
    });
    // ? Message
    useSocketEvent(socket, socketConstants.NEW_MESSAGE_RECEIVED, (data) => {
        console.log(`--------On new message received ------ `);
        const newMessage = data?.newMessage;
        const tmpId = data?.tmpId;
        // onUpdateMessage && onUpdateMessage(data);
        if (newMessage?.group?.id === groupItem?.id) {
            const currentSender = groupItem?.members?.find(
                (filterItem) => filterItem?.id !== data?.sender?.id
            );

            // Modify nickname for sender
            const _newMessage = {
                ...newMessage,
                sender: { ...newMessage?.sender, nickname: currentSender?.nickname || '' },
            };
            setMessageData((prevState) => {
                const findTmpMessage = prevState?.find((tmpItem) => tmpItem?.id === tmpId);
                if (!isEmpty(findTmpMessage)) {
                    const _newList = prevState?.map((messItem) => {
                        if (messItem?.id === tmpId) {
                            return _newMessage;
                        } else {
                            return messItem;
                        }
                    });
                    return _newList;
                } else {
                    return [_newMessage, ...prevState];
                }
            });
        }
    });
    useSocketEvent(socket, socketConstants.MESSAGE_READ, () => {
        console.log(`--------On messagesRead -------`);
        if (!isEmpty(messageData)) {
            reFetchGroupChat();
        }
    });

    useSocketEvent(socket, socketConstants.ACCEPT_FRIEND_REQUEST, () => {
        console.log(`--------On accept friend request ------ `);

        reFetchFriendData();
    });

    useSocketEvent(socket, socketConstants.NEW_MEMBER_JOINED, (data) => {
        console.log(`--------On newMembersJoined -------`);
        setTotalMember((prev) => prev + 1);
        setMember([...data?.newMembers, ...member]);
    });

    useSocketEvent(socket, socketConstants.GROUP_CHAT_REMOVED, (data) => {
        console.log(`--------On groupChatRemoved -------`);
        if (data?.groupChat?.id === idRoom) {
            alertWarning(`Nhóm ${data?.groupChat?.name || ''} đã được giải tán!`);
            goBack();
        }
    });

    useSocketEvent(socket, socketConstants.GROUP_MEMBERS_REMOVED, (data) => {
        console.log(`--------On groupMembersRemoved -------`);
        setTotalMember((prev) => prev - 1);
        setMember((prevState) => {
            const filterNewMemberList = prevState.filter(
                (firstItem) =>
                    !data.removeMembers?.some((secondItem) => firstItem?.id === secondItem?.id)
            );
            return filterNewMemberList;
        });
    });
    useSocketEvent(socket, socketConstants.NEW_GROUP_CHAT_CREATED, (data) => {
        console.log(`--------On new group chat created ------ `);

        if (isEmpty(groupItem?.type)) {
            setGroupItem(data?.groupChat);
            setIdRoom(data?.groupChat?.id);
            setIsHasRoomId(true);
            setSkipFetchMessage(false);
        }
    });

    useSocketEvent(socket, socketConstants.SOMEONE_ONLINE, (data) => {
        console.log(`-------- Someone online ------ `);

        if (data?.groupChat?.id === idRoom) {
            const findFriendData = groupItem?.members?.find(
                (memberItem) => memberItem?.id !== userProfile?.id
            );
            if (findFriendData?.id === data?.member?.id) {
                setIsOnline(true);
            }
        }
    });

    useSocketEvent(socket, socketConstants.SOMEONE_OFFLINE, (data) => {
        console.log(`--------On someoneOffline -------`);
        if (data?.groupChat?.id === idRoom) {
            const findFriendData = groupItem?.members?.find(
                (memberItem) => memberItem?.id !== userProfile?.id
            );
            if (findFriendData?.id === data?.member?.id) {
                setIsOnline(false);
            }
        }
    });

    useSocketEvent(socket, socketConstants.IS_ONLINE, (data) => {
        console.log(`--------On isOnline -------`, data);
        if (isOnline !== data) {
            setIsOnline(data);
        }
    });

    useSocketEvent(socket, socketConstants.MESSAGE_DELETED, (data) => {
        console.log(`--------On messageDeleted -------`);
        if (item?.isAdmin) {
            setMessageData((prevState) => {
                const filterList = prevState.map((filterItem) => {
                    if (filterItem.id === data?.deletedMessage?.id) {
                        return {
                            ...filterItem,
                            deletedAt: new Date(),
                        };
                    } else {
                        return filterItem;
                    }
                });
                return [...filterList];
            });
        } else {
            setMessageData((prevState) => {
                const filterList = prevState.filter(
                    (filterItem) => filterItem.id !== data?.deletedMessage?.id
                );
                return [...filterList];
            });
        }
    });
    useSocketEvent(socket, socketConstants.MESSAGE_PINNED, (data) => {
        console.log(`--------On messagePinned -------`);
        setPinMessage((prevState) => {
            return [data?.pinnedMessage, ...prevState];
        });
        setMessageData((prevState) => {
            const filterList = prevState.map((filterItem) => {
                if (filterItem.id === data?.pinnedMessage?.id) {
                    return data?.pinnedMessage;
                } else {
                    return filterItem;
                }
            });
            return [...filterList];
        });
    });
    useSocketEvent(socket, socketConstants.MESSAGE_UNPINNED, (data) => {
        console.log(`--------On messageUnpinned -------`);
        setPinMessage((prevState) => {
            const filterList = prevState.filter(
                (filterItem) => filterItem.id !== data?.unPinnedMessage?.id
            );
            return [...filterList];
        });
        setMessageData((prevState) => {
            const filterList = prevState.map((filterItem) => {
                if (filterItem.id === data?.unPinnedMessage?.id) {
                    return data?.unPinnedMessage;
                } else {
                    return filterItem;
                }
            });
            return [...filterList];
        });
    });
    useSocketEvent(socket, socketConstants.CHAT_ERROR, (data) => {
        alertError(data?.errorMsg);
        console.log(`--------On chatError -------`);
    });

    function handleBackButtonClick() {
        if (fromNotify) {
            props.navigation.reset({
                index: 0,
                routes: [{ name: 'xHome' }],
            });
            return true;
        }
        props.navigation.goBack();
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    }, []);

    useEffect(() => {
        if (socket) {
            if (!isEmpty(groupItem?.type)) {
                socket?.emit('enterGroupChat', idRoom);
                const findFriendData = groupItem?.members?.find(
                    (memberItem) => memberItem?.id !== userProfile?.id
                );
                socket?.emit('onReadMessages', idRoom);
                socket?.emit('isOnline', findFriendData?.id);
            } else {
                socket?.emit('isOnline', idRoom);
            }
        }
        return () => {
            if (socket) {
                if (!isEmpty(groupItem?.type)) {
                    socket?.emit('outGroupChat', idRoom);
                }
            }
        };
    }, [socket]);

    useEffect(() => {
        // Check data for accept friend button
        if (!isEmpty(strangerData)) {
            setAcceptFriendData(strangerData);
        } else {
            setAcceptFriendData({});
        }
    }, [strangerData]);

    useEffect(() => {
        setPinMessage(dataGroup?.pinnedMessages || []);
        // Check load more data
        if (page === 1 && !isEmpty(dataGroup?.items)) {
            setMessageData([...dataGroup?.items]);
        } else if (page === 1 && isEmpty(dataGroup?.items)) {
            setMessageData([]);
        } else {
            if (!isEmpty(dataGroup?.items)) {
                setMessageData([...messageData, ...dataGroup?.items]);
            }
            // Check isMax
            if (
                size(messageData) > LIMIT &&
                size([...messageData, ...dataGroup?.items]) >= dataGroup?.total
            ) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [dataGroup?.items]);

    useEffect(() => {
        if (mounted?.current) {
            if (isKeyboardShow) {
                Animated.timing(inputViewHeight.current, {
                    toValue: 60,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            } else {
                Animated.timing(inputViewHeight.current, {
                    toValue: isANDROID ? 60 : 80,
                    duration: 300,
                    useNativeDriver: false,
                }).start();
            }
        }
        mounted.current = true;
    }, [isKeyboardShow]);

    const onAcceptFriendPress = () => {
        acceptFriend({ userId: filterMember?.id })
            .unwrap()
            .then(async (value) => {
                setAcceptFriendData({});
                alertSuccess('Kết bạn thành công!');
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Đã có lỗi xảy ra, Vui lòng thử lại sau!');
            })
            .finally(() => {});
    };

    const onBackPress = () => {
        if (fromNotify) {
            props.navigation.reset({
                index: 0,
                routes: [{ name: 'xHome' }],
            });
            return true;
        }
        goBack();
    };

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setMessageData([]);
        }
        setIsMax(false);
        if (!isEmpty(dataGroup)) {
            reFetchGroupChat();
        } else {
            setSkipFetchMessage(false);
        }
    };

    const onSelectEmoji = (emoji) => {
        setInputMessage((prevState) => prevState + emoji);
    };

    const onOpenImagePicker = () => {
        refImagePicker?.current?.open();
    };

    const onOpenEmojiPicker = () => {
        refEmojiPicker?.current?.open();
    };

    const goToMemberScreen = () => {
        navigate('xGroupMemberScreen', {
            type: 'ADD',
            data: item,
        });
    };

    const goToChatSetting = (type) => {
        navigate('xChatSettingScreen', {
            type: type?.type || 'GROUP',
            groupItem: groupItem,
            onUpdate: (groupSettingUpdate) => onUpdateGroupSetting(groupSettingUpdate),
        });
    };

    const onContactChatPress = (nameCard) => {
        replace('xMessageScreen', {
            type: 'PERSONAL',
            item: nameCard,
            fromScreen: 'CONTACT',
        });
    };

    const onChangeMessage = (text) => {
        setInputMessage(text);
    };

    const onShareContactPress = () => {
        navigate('xGroupMemberScreen', {
            type: 'SHARE',
            data: item,
        });
    };

    const onPinPress = (messageItem) => {
        if (messageItem?.pinned) {
            socket?.emit('onUnpinMessage', messageItem?.id);
        } else {
            socket?.emit('onPinMessage', messageItem?.id);
        }
    };

    const onEndReached = () => {
        if (!isLoadingGroup && size(messageData) < dataGroup?.total) {
            setPage((page) => page + 1);
        }
    };

    const onDeletePress = (messageId) => {
        socket?.emit('onDeleteMessage', messageId);
    };

    const onUpdateGroupSetting = (groupSettingUpdate) => {
        setGroupItem((prevItem) => {
            return { ...prevItem, ...groupSettingUpdate };
        });
    };

    const onSendMessage = () => {
        const tmpId = `TMP_${moment().unix()}`;
        if (!isEmpty(inputMessage)) {
            if (!isHasRoomId) {
                socket?.emit('onSendConversationMessage', {
                    receiverId: idRoom,
                    message: inputMessage,
                    tmpId: tmpId,
                });
            } else {
                socket?.emit('onSendMessage', {
                    groupId: idRoom,
                    message: inputMessage,
                    tmpId: tmpId,
                });
            }
            setMessageData((prevState) => {
                setInputMessage('');
                return [
                    {
                        id: tmpId,
                        sender: userProfile,
                        status: 'SENDING',
                        username: userProfile?.username,
                        message: inputMessage,
                    },
                    ...prevState,
                ];
            });
        }
    };

    const onUploadImageSuccess = (data) => {
        const imageURL = data?.data?.url;
        let messageData = {};
        if (
            data?.data?.key?.includes('video') ||
            data?.data?.key?.includes('mp4') ||
            data?.data?.key?.includes('mov') ||
            data?.data?.key?.includes('wmv') ||
            data?.data?.key?.includes('avi') ||
            data?.data?.key?.includes('flv')
        ) {
            messageData['documentUrls'] = [imageURL];
        } else {
            messageData['imageUrls'] = [imageURL];
        }
        if (!isHasRoomId) {
            messageData['receiverId'] = idRoom;
            socket?.emit('onSendConversationMessage', messageData);
        } else {
            messageData['groupId'] = idRoom;
            socket?.emit('onSendMessage', messageData);
        }
    };

    const onImagePress = (imageUrls) => {
        const imageList = imageUrls?.map((imageItem) => {
            return {
                uri: imageItem,
            };
        });
        const imageViewerData = {
            currentIndex: 0,
            images: imageList,
        };
        setImageViewer(imageViewerData);
    };

    const onVideoPress = (urls) => {
        navigate('videoPreview', {
            videoData: urls?.[0],
        });
    };

    const onMessageClick = (clickedItem) => {
        setClickedMessage(clickedItem);
    };

    const onUpdateUserNickname = (updatedData) => {
        const newMemberList = groupItem?.members?.map((memberItem) => {
            if (memberItem?.id !== userProfile?.id) {
                return { ...memberItem, nickname: updatedData?.nickname };
            } else {
                return memberItem;
            }
        });
        setGroupItem((prevState) => {
            return { ...prevState, members: newMemberList };
        });

        const findFriendData = groupItem?.members?.find(
            (memberItem) => memberItem?.id !== userProfile?.id
        );
        setMessageData((prevState) => {
            const newMessageList = prevState.map((messageItem) => {
                if (findFriendData?.id === messageItem?.sender?.id) {
                    return {
                        ...messageItem,
                        sender: { ...messageItem?.sender, nickname: updatedData?.nickname },
                    };
                } else {
                    return messageItem;
                }
            });
            return newMessageList;
        });
    };

    const onPinMessagePress = (messagePin) => {
        const pinMessageDate = moment(messagePin?.createdAt).format('DD/MM/YYYY');
        const findSectionIndex = groupSectionsMapping?.findIndex((sectionItem) => {
            return sectionItem?.title === pinMessageDate;
        });
        if (findSectionIndex !== -1) {
            const findMessageIndex = (
                groupSectionsMapping?.[findSectionIndex]?.data || []
            )?.findIndex((messageItem) => {
                return messageItem?.id === messagePin?.id;
            });
            if (findMessageIndex !== -1) {
                refChat.current?.scrollToLocation({
                    sectionIndex: findSectionIndex,
                    itemIndex: findMessageIndex,
                    animated: true,
                    viewOffset: 0.5,
                });
                setIndexPin((prevItem) => {
                    if (prevItem + 1 < size(pinMessage)) {
                        return prevItem + 1;
                    } else {
                        return 0;
                    }
                });
            } else {
                if (size(groupSectionsMapping?.[size(groupSectionsMapping) - 1]?.data)) {
                    debounce(() => {
                        refChat.current?.scrollToLocation({
                            sectionIndex: size(groupSectionsMapping) - 1,
                            itemIndex:
                                size(groupSectionsMapping?.[size(groupSectionsMapping) - 1]?.data) -
                                1,
                            animated: true,
                            viewOffset: 1,
                        });
                    }, 2000);
                }
            }
        } else {
            if (size(groupSectionsMapping?.[size(groupSectionsMapping) - 1]?.data)) {
                debounce(() => {
                    refChat.current?.scrollToLocation({
                        sectionIndex: size(groupSectionsMapping) - 1,
                        itemIndex:
                            size(groupSectionsMapping?.[size(groupSectionsMapping) - 1]?.data) - 1,
                        animated: true,
                        viewOffset: 1,
                    });
                }, 2000);
            }
        }
    };

    const checkAvatar = (isGroup, groupChatItem, currentUserId) => {
        const findFriendAvatar = groupChatItem?.members?.filter(
            (memberItem) => memberItem?.id !== currentUserId
        );
        if (isGroup) {
            return groupChatItem?.members?.map((memberItem) => memberItem?.profile?.avatar);
        } else {
            return groupChatItem?.profile?.avatar || findFriendAvatar?.[0]?.profile?.avatar;
        }
    };

    // Mapping section list
    const groupSectionsMapping = useMemo(() => {
        const groupedData = messageData?.reduce((result, item) => {
            const date = moment(item?.createdAt).format('DD/MM/YYYY');
            if (!result[date]) {
                result[date] = [];
            }
            result[date].push(item);
            return result;
        }, {});
        const sections = Object.keys(groupedData).map((date, index) => ({
            title: date,
            id: `${index}`,
            index: index,
            data: uniqBy(groupedData?.[date], 'id'),
        }));
        return sections;
    }, [messageData]);

    const onProfilePress = (data) => {
        if (isChatGroup) {
            navigate('xChatSettingScreen', {
                type: 'PERSONAL',
                groupItem: { ...data, id: idRoom },
                onUpdateUserNickname,
            });
        }
    };

    const checkPinMessageText = (messageItem) => {
        if (!isEmpty(messageItem?.nameCard)) {
            return 'Danh thiếp';
        } else if (!isEmpty(messageItem?.imageUrls)) {
            return 'Hình ảnh/ video';
        } else {
            return messageItem?.message;
        }
    };

    const onCloseReportPress = (type) => {
        if (type?.type === 'BLOCK') {
            alertSuccess('Chặn người này thành công!');
            refReportModal?.current?.close();
            goBack();
        } else if (type?.type) {
            alertSuccess('Gửi báo cáo thành công!');
        }
        refReportModal?.current?.close();
    };

    const onOpenReportPress = () => {
        refReportModal?.current?.open();
    };

    const onAddFriendPress = () => {
        const friendId = filterMember?.id || item?.id;
        addFriend(friendId)
            .unwrap()
            .then(async (value) => {
                setIsAddFriendRequest(true);
                alertSuccess('Gửi lời mời kết bạn thành công!');
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Gửi lời mời kết bạn thất bại!');
            })
            .finally(() => {});
    };

    const buildAcceptFriendButton = () => {
        return (
            <CustView centerVertical row style={{ marginBottom: 14 }}>
                {isEmpty(acceptFriendData?.friendRequest) &&
                    !acceptFriendData?.isFriend &&
                    !isAddFriendRequest && (
                        <TouchableOpacity
                            activeOpacity={0.6}
                            duration={1000}
                            onPress={onAddFriendPress}
                            style={[styles.groupMenuButton]}
                        >
                            <Feather name={'user-plus'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                    )}
                {!isEmpty(acceptFriendData?.friendRequest) && (
                    <TouchableOpacity
                        style={styles.acceptFriendButton}
                        activeOpacity={0.6}
                        onPress={onAcceptFriendPress}
                    >
                        <CustText size={12} color={Colors.white}>
                            Duyệt kết bạn
                        </CustText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={onOpenReportPress}
                    style={[styles.groupMenuButton, { marginLeft: 4 }]}
                >
                    <Ionicons name={'alert-circle-outline'} size={20} color={Colors.white} />
                </TouchableOpacity>
            </CustView>
        );
    };

    const buildGroupButton = () => {
        if (groupItem?.isAdmin || groupItem?.isOwner) {
            return (
                <CustView row style={{ marginBottom: 14 }}>
                    {groupItem?.canAddFriends && (
                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={goToMemberScreen}
                            style={[styles.groupMenuButton]}
                        >
                            <Feather name={'user-plus'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={goToChatSetting}
                        style={[styles.groupMenuButton, { marginLeft: 4 }]}
                    >
                        <Ionicons name={'settings-outline'} size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={onOpenReportPress}
                        style={[styles.groupMenuButton, { marginLeft: 4 }]}
                    >
                        <Ionicons name={'alert-circle-outline'} size={20} color={Colors.white} />
                    </TouchableOpacity>
                </CustView>
            );
        } else {
            return (
                <CustView row style={{ marginBottom: 14 }}>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => goToChatSetting({ type: 'USER' })}
                        style={[styles.groupMenuButton, { marginLeft: 4 }]}
                    >
                        <Ionicons name={'settings-outline'} size={20} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={onOpenReportPress}
                        style={[styles.groupMenuButton, { marginLeft: 4 }]}
                    >
                        <Ionicons name={'alert-circle-outline'} size={20} color={Colors.white} />
                    </TouchableOpacity>
                </CustView>
            );
        }
    };

    const buildChatFieldButton = () => {
        return (
            <CustView row centerVertical transparentBg>
                <TouchableOpacity
                    onPress={onOpenImagePicker}
                    activeOpacity={0.6}
                    style={styles.galleryButton}
                >
                    <Image source={images.iconGallery} style={styles.icon24} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onOpenEmojiPicker}
                    activeOpacity={0.6}
                    style={styles.emojiButton}
                >
                    <Image source={images.iconEmoji} style={styles.icon24} />
                </TouchableOpacity>
            </CustView>
        );
    };

    const buildListFooterComponent = () => {
        if (isMax) {
            return (
                <CustView transparentBg center style={styles.loadingView}>
                    <CustText style={{ color: isDarkMode ? Colors.white : Colors.dark }}>
                        Không còn tin nhắn nào!
                    </CustText>
                </CustView>
            );
        } else {
            if (isLoadingGroup) {
                return (
                    <CustView transparentBg center style={styles.loadingView}>
                        <ActivityIndicator size="small" color={Colors.grey} />
                    </CustView>
                );
            } else {
                return <></>;
            }
        }
    };

    return (
        <ImageBackground
            source={isDarkMode ? images.xBackgroundDark : images.bgWhite}
            style={{ flex: 1 }}
        >
            {isGroup ? (
                <GroupChatHeader
                    rightContent={buildGroupButton}
                    onBackPress={onBackPress}
                    isDarkMode={isDarkMode}
                    data={groupItem}
                    member={member}
                    totalMember={totalMember}
                    avatar={checkAvatar(isGroup, groupItem, userProfile?.id)}
                />
            ) : (
                <PersonalChatHeader
                    rightContent={buildAcceptFriendButton}
                    onBackPress={onBackPress}
                    onProfile={onProfilePress}
                    isDarkMode={isDarkMode}
                    data={groupItem}
                    isOnline={isOnline}
                    friendInfo={filterMember}
                    avatar={checkAvatar(isGroup, groupItem, userProfile?.id)}
                />
            )}
            {!isEmpty(pinMessage) && (
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => onPinMessagePress(pinMessage?.[indexPin])}
                >
                    <CustView row centerVertical style={styles.pinView}>
                        <CustImage
                            source={images.iconPinColor}
                            style={{ height: 24, width: 24, marginRight: 5 }}
                        />
                        <CustView transparentBg row centerVertical>
                            <CustText size={12} bold color={'black'}>
                                {pinMessage?.[indexPin]?.sender?.nickname ||
                                    pinMessage?.[indexPin]?.sender?.username}
                                :{' '}
                            </CustText>
                            <CustText size={12} color={'black'}>
                                {checkPinMessageText(pinMessage?.[indexPin])}
                            </CustText>
                        </CustView>
                    </CustView>
                </TouchableOpacity>
            )}
            {/* Chat content */}
            <CustView fillHeight transparentBg>
                <ChatContent
                    sections={groupSectionsMapping}
                    pinMessage={pinMessage}
                    refChat={refChat}
                    userId={userProfile?.id}
                    onEndReached={onEndReached}
                    onPin={onPinPress}
                    onDelete={onDeletePress}
                    onMessageClick={onMessageClick}
                    clickedMessage={clickedMessage}
                    onChatContact={onContactChatPress}
                    isDarkMode={isDarkMode}
                    initialNumToRender={20}
                    listFooterComponent={buildListFooterComponent}
                    onRefreshPage={onRefreshPage}
                    onImagePress={onImagePress}
                    onVideoPress={onVideoPress}
                    isAdmin={isAdmin}
                    isGroup={isGroup}
                />
            </CustView>
            {/* Bottom Chat */}
            {(!isAdmin && !isEnableChat) || isRootAdmin ? (
                <CustView center style={{ height: 48 }}>
                    <CustText size={12}>
                        Chỉ <CustText color={'#778290'}>trưởng nhóm</CustText> mới được gửi tin vào
                        nhóm!
                    </CustText>
                </CustView>
            ) : (
                <KeyboardAvoidingView behavior={isIOS ? 'padding' : undefined}>
                    <Animated.View
                        style={[
                            styles.bottomChatView,
                            {
                                height: inputViewHeight.current,
                                backgroundColor: isDarkMode ? '#333333' : Colors.white,
                            },
                        ]}
                    >
                        <CustView row transparentBg height={60} centerVertical>
                            <TouchableOpacity activeOpacity={0.6} onPress={onShareContactPress}>
                                <Image source={images.iconCard} style={styles.iconCard} />
                            </TouchableOpacity>
                            <CustView transparentBg fillHeight style={{ marginHorizontal: 7 }}>
                                <CustTextField
                                    value={inputMessage}
                                    placeHolder={'Nhập tin nhắn'}
                                    onChangeText={onChangeMessage}
                                    isMultiline
                                    numberOfLines={1}
                                    textInputContainerStyle={styles.textInputContainer}
                                    textInputStyle={{
                                        height: isIOS ? 32 : 50,
                                        paddingTop: isIOS ? 12 : 0,
                                        color: Colors.grey,
                                    }}
                                    rightIcon={buildChatFieldButton}
                                />
                            </CustView>
                            <TouchableOpacity
                                onPress={() =>
                                    debounce(() => {
                                        onSendMessage();
                                    }, 500)
                                }
                                style={styles.sentButton}
                            >
                                <Ionicons
                                    name={'paper-plane-outline'}
                                    size={22}
                                    color={Colors.white}
                                />
                            </TouchableOpacity>
                        </CustView>
                    </Animated.View>
                </KeyboardAvoidingView>
            )}

            {/* Image Picker */}
            <ImagePicker
                modalRef={refImagePicker}
                isDarkMode={isDarkMode}
                isAvatar={false}
                saveToLocal={false}
                onUploadSuccess={onUploadImageSuccess}
            />
            <ImageViewer visible data={imageViewer} hideBottom onClose={() => setImageViewer({})} />
            <EmojiPicker
                modalRef={refEmojiPicker}
                isDarkMode={isDarkMode}
                onSelect={onSelectEmoji}
            />
            {/* Report modal */}
            <RBSheet
                ref={refReportModal}
                height={metrics.screenHeight * 0.5}
                duration={250}
                customStyles={{
                    container: {
                        paddingHorizontal: 23,
                        borderTopEndRadius: 16,
                        borderTopStartRadius: 16,
                        backgroundColor: isDarkMode ? Colors.dark : Colors.white,
                    },
                }}
            >
                <CustView transparentBg center>
                    <CustView center style={{ height: 58 }}>
                        <CustText size={16} bold>
                            {'Bạn muốn báo cáo xấu nhóm này?'}
                        </CustText>
                    </CustView>
                    <TouchableOpacity onPress={onCloseReportPress} style={styles.closeButton}>
                        <Ionicons name={'close-circle-outline'} size={24} color={Colors.black} />
                    </TouchableOpacity>
                    <ScrollView showsHorizontalScrollIndicator={false} style={{ height: '100%' }}>
                        <CustView>
                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => onCloseReportPress({ type: 'BUTTON' })}
                            >
                                <CustText>Nội dung nhạy cảm</CustText>
                            </TouchableOpacity>
                            <CustView style={styles.separate} />
                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => onCloseReportPress({ type: 'BUTTON' })}
                            >
                                <CustText>Làm phiền</CustText>
                            </TouchableOpacity>
                            <CustView style={styles.separate} />

                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => onCloseReportPress({ type: 'BUTTON' })}
                            >
                                <CustText>Lừa đảo</CustText>
                            </TouchableOpacity>
                            <CustView style={styles.separate} />

                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => onCloseReportPress({ type: 'BLOCK' })}
                            >
                                <CustText>Chặn người này</CustText>
                            </TouchableOpacity>
                            <CustView style={styles.separate} />

                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={() => onCloseReportPress({ type: 'BUTTON' })}
                            >
                                <CustText>Lý do khác</CustText>
                            </TouchableOpacity>
                            <CustView style={styles.separate} />

                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={onCloseReportPress}
                            >
                                <CustText bold>Huỷ</CustText>
                            </TouchableOpacity>
                        </CustView>
                    </ScrollView>
                    <CustView style={{ height: metrics.screenHeight * 0.1 }} />
                </CustView>
            </RBSheet>
        </ImageBackground>
    );
};

export default XMessageScreen;

const styles = StyleSheet.create({
    acceptFriendButton: {
        height: 22,
        marginBottom: -14,
        borderRadius: 12,
        paddingHorizontal: 10,
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    textInputContainer: {
        height: 42,
        marginTop: 0,
        borderRadius: 22,
        paddingHorizontal: 16,
        backgroundColor: '#E0EEF4',
        borderColor: '#8A9AA9',
    },
    bottomChatView: {
        paddingTop: 11,
        paddingHorizontal: 18,
        shadowColor: '#F0F0F5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowRadius: 4,
        elevation: 5,
    },
    sentButton: {
        height: 40,
        width: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    groupMenuButton: {
        height: 33,
        width: 33,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    icon24: { height: 24, width: 24 },
    emojiButton: {
        marginLeft: 4,
        height: 26,
        width: 26,
    },
    iconCard: { height: 24, width: 36 },
    galleryButton: {
        height: 26,
        width: 26,
    },
    loading: {
        marginVertical: 20,
    },
    pinView: {
        height: 53,
        backgroundColor: Colors.blue200,
        paddingHorizontal: 16,
    },
    reportButton: {
        height: 56,
        width: metrics.screenWidth - 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: { position: 'absolute', top: 16, right: 0 },
    separate: {
        width: metrics.screenWidth - 60,
        borderTopWidth: 1,
        borderTopColor: '#CECECE',
    },
    loadingView: {
        marginTop: 16,
        marginBottom: 20,
    },
});
