import React, { useState, useEffect, useMemo } from 'react';
import {
    Animated,
    SafeAreaView,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Feather';
import ChatList from './chatList';
import { navigate } from '../navigation/navigationUtils';
import { images } from '../../assets';
import Colors from '../utils/colors';
import { CustText, CustView } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIOS, metrics } from '../utils';
import CheckInModal from './components/checkInModal';
import { useSelector } from 'react-redux';
import { StatusBar } from 'react-native';
import {
    useArchiveGroupChatMutation,
    useDeleteGroupChatMutation,
    useGetGroupQuery,
    usePinGroupChatMutation,
} from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';
import { useIsFocused } from '@react-navigation/native';
import { isEmpty, size, uniqBy } from 'lodash';
import CustImage from '../components/custImage';
import { alertError } from '../components/alert';
import { useSocket, useSocketEvent } from '../utils/socketIO';
import WelcomeView from '../components/shared/welcomeView';
import { setBadgeNumber } from '../utils/localPushNotification';
import { socketConstants } from './constants/socketContants';

const TAB_WIDTH = metrics.screenWidth - 32;
const LIMIT = 10;
const XChatScreen = () => {
    const socket = useSocket();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const isDarkMode = useSelector((state) => state.setting?.isDarkMode);
    const [chatTabIndex, setTabChatIndex] = useState(0);
    const [tabTranslate, setTabTranslate] = useState(new Animated.Value(0));
    const isAllChatTabSelected = chatTabIndex == 0;
    const userProfile = useSelector((state) => state.auth.userProfile);

    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const [chatList, setChatList] = useState([]);
    const [pinGroupChat, { isLoading: isLoadingPin }] = usePinGroupChatMutation();
    const [deleteGroupChat, { isLoading: isLoadingDelete }] = useDeleteGroupChatMutation();
    const [archiveGroupChat, { isLoading: isLoadingArchive }] = useArchiveGroupChatMutation();

    const {
        data: groupChatData,
        refetch,
        isFetching: isLoading,
    } = useGetGroupQuery({
        page: page,
        limit: LIMIT,
    });

    useEffect(() => {
        if (isFocused) {
            if (!isEmpty(groupChatData)) {
                page > 1 && setPage(1);
                refetch();
            }
        }
    }, [isFocused]);

    useEffect(() => {
        if (page === 1 && !isEmpty(groupChatData?.items)) {
            setChatList(uniqBy(groupChatData?.items, 'id'));
        } else if (page === 1 && isEmpty(groupChatData?.items)) {
            setChatList([]);
        } else {
            if (!isEmpty(groupChatData?.items)) {
                setChatList(uniqBy([...chatList, ...groupChatData?.items], 'id'));
            }
            // Check isMax
            if (
                size(chatList) > LIMIT &&
                size([...chatList, ...groupChatData?.items]) >= groupChatData?.total
            ) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [groupChatData]);

    useSocketEvent(socket, socketConstants.ONLINE, () => {
        console.log(`--------On connected to SocketIO -------`);
    });

    useSocketEvent(socket, socketConstants.NEW_GROUP_CHAT_CREATED, (data) => {
        let tmpChatList = chatList;
        setChatList(
            [data?.groupChat, ...tmpChatList].sort((a, b) => {
                if (a?.settings?.[0]?.pinned && !b?.settings?.[0]?.pinned) {
                    return -1;
                } else if (!a?.settings?.[0]?.pinned && b?.settings?.[0]?.pinned) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    });

    useSocketEvent(socket, socketConstants.NEW_MESSAGE_RECEIVED, (data) => {
        let tmpChatList = chatList;
        const currentItem = tmpChatList?.find(
            (chatItem) => chatItem?.id === data?.newMessage?.group?.id
        );
        if (!isEmpty(currentItem)) {
            const removedItem = tmpChatList?.filter((listItem) => listItem?.id !== currentItem?.id);
            setChatList(
                [{ ...currentItem, latestMessage: data?.newMessage }, ...removedItem].sort(
                    (a, b) => {
                        if (a?.settings?.[0]?.pinned && !b?.settings?.[0]?.pinned) {
                            return -1;
                        } else if (!a?.settings?.[0]?.pinned && b?.settings?.[0]?.pinned) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                )
            );
        }
    });

    useSocketEvent(socket, socketConstants.GROUP_CHAT_REMOVED, (data) => {
        let tmpChatList = chatList;
        const removedGroup = tmpChatList?.filter(
            (listItem) => listItem?.id !== data?.groupChat?.id
        );
        setChatList(removedGroup);
    });

    // useSocketEvent(socket, socketConstants.UNSEND_MESSAGE_RECEIVED, (data) => {
    //     refetch();
    // });

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setChatList([]);
        }
        setIsMax(false);
        refetch();
    };

    const onSearchPress = () => {
        navigate('xSearchScreen');
    };

    const onAddFriendPress = () => {
        navigate('xAddFriendScreen');
    };

    const onCreateGroupPress = () => {
        navigate('xCreateGroupScreen');
    };

    const onTabPress = (index) => {
        // Tab Switch animation
        const transitionMultiplier = 1;
        // Animating the active index based current index
        Animated.spring(tabTranslate, {
            toValue: index * (transitionMultiplier * ((TAB_WIDTH - 20) / 2)),
            stiffness: 240,
            damping: 20,
            mass: 1,
            useNativeDriver: true,
        }).start();
        // Set tab index
        setTabChatIndex(index);
    };

    const filterUnreadMessage = useMemo(() => {
        const unreadMessageFilter = chatList.filter((filterItem) =>
            Boolean(filterItem?.settings?.[0]?.unReadMessages)
        );
        setBadgeNumber(size(unreadMessageFilter) || 0);
        return unreadMessageFilter;
    }, [chatList]);

    const filterHiddenChat = useMemo(() => {
        const filterChat = chatList.filter((chatItem) => chatItem?.settings?.[0]?.hiding === true);
        return filterChat;
    }, [chatList]);

    const onEndReached = () => {
        if (!isLoading && size(chatList) < groupChatData?.total) {
            setPage((page) => page + 1);
        }
    };

    const onChatItemPress = (chatItem) => {
        navigate('xMessageScreen', {
            item: chatItem,
            // onUpdateMessage: (messageUpdate) => onMessageUpdate(messageUpdate),
        });
    };

    const onPinGroupPress = (groupId) => {
        pinGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                onRefreshPage();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Gim hội thoại thất bại!');
            })
            .finally(() => {});
    };
    const onDeleteGroupPress = (groupId) => {
        deleteGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                onRefreshPage();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Xoá hội thoại thất bại!');
            })
            .finally(() => {});
    };
    const onArchiveGroupPress = (groupId) => {
        archiveGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                onRefreshPage();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Lưu trữ hội thoại thất bại!');
            })
            .finally(() => {});
    };

    const onArchiveFolderPress = () => {
        navigate('xArchiveScreen');
    };

    const onMessageUpdate = (newData) => {
        const newList = chatList.map((mapItem) => {
            if (mapItem?.id === newData?.newMessage?.group?.id) {
                return {
                    ...mapItem,
                    latestMessage: {
                        ...mapItem.latestMessage,
                        message: newData?.newMessage?.message,
                    },
                };
            } else {
                return mapItem;
            }
        });
        setChatList(newList);
    };

    const ListHeaderComponent = () => {
        if (size(filterHiddenChat) > 0) {
            return (
                <TouchableOpacity
                    row
                    centerVertical
                    style={styles.itemStyle}
                    onPress={onArchiveFolderPress}
                >
                    <CustView fillHeight row centerVertical>
                        <CustView transparentBg centerVertical>
                            <CustView style={styles.btnStyle}>
                                <CustImage
                                    source={images.iconDownloadOutline}
                                    style={styles.iconSize}
                                />
                            </CustView>
                        </CustView>

                        <CustView fillHeight style={{ marginLeft: 10 }}>
                            <CustText bold size={15}>
                                {'Cuộc trò chuyện lưu trữ'}
                            </CustText>
                        </CustView>
                    </CustView>
                </TouchableOpacity>
            );
        } else {
            return <></>;
        }
    };

    return (
        <ImageBackground
            source={isDarkMode ? images.xBackgroundDark : images.bgWhite}
            style={styles.backgroundStyle}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar
                    translucent={true}
                    backgroundColor={'transparent'}
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                />
                {/* Chat Header */}
                <CustView
                    row
                    centerVertical
                    transparentBg
                    style={[styles.headerView, { marginTop: isIOS ? 0 : insets.top }]}
                >
                    <WelcomeView />
                    <CustView style={{ marginLeft: 8 }} transparentBg row centerVertical>
                        <TouchableOpacity style={styles.btnBasic} onPress={onSearchPress}>
                            <Ionicons name={'search'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnBasic, { marginHorizontal: 5 }]}
                            onPress={onAddFriendPress}
                        >
                            <Ionicons name={'user-plus'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnBasic} onPress={onCreateGroupPress}>
                            <Ionicons name={'users'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </CustView>
                </CustView>

                {/* Tab switch */}
                <Animated.View
                    style={[
                        styles.tabSwitchView,
                        { backgroundColor: isDarkMode ? '#333333' : 'white' },
                    ]}
                >
                    {/* Animated switch */}
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            styles.animatedSwitchButton,
                            { transform: [{ translateX: tabTranslate }] },
                        ]}
                    />
                    <TouchableOpacity onPress={() => onTabPress(0)} style={styles.tabButton}>
                        <CustText
                            size={13}
                            style={[
                                styles.tabTextStyle,
                                {
                                    color: isDarkMode
                                        ? 'white'
                                        : isAllChatTabSelected
                                        ? Colors.white
                                        : Colors.black,
                                },
                            ]}
                        >
                            Tất cả tin nhắn
                        </CustText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onTabPress(1)} style={styles.tabButton}>
                        <CustText
                            size={13}
                            style={[
                                styles.tabTextStyle,
                                {
                                    color: isDarkMode
                                        ? 'white'
                                        : isAllChatTabSelected
                                        ? Colors.black
                                        : Colors.white,
                                },
                            ]}
                        >
                            Tin nhắn chưa đọc
                        </CustText>
                    </TouchableOpacity>
                </Animated.View>
                <CustView fillHeight style={styles.contentView}>
                    <CustText size={25} bold style={styles.contentTitle}>
                        Trò chuyện
                    </CustText>
                    <ChatList
                        userId={userProfile?.id}
                        onEndReached={onEndReached}
                        onItemPress={onChatItemPress}
                        onRefreshPage={onRefreshPage}
                        onDelete={onDeleteGroupPress}
                        onPin={onPinGroupPress}
                        onArchive={onArchiveGroupPress}
                        data={chatTabIndex === 0 ? chatList : filterUnreadMessage}
                        ListHeaderComponent={ListHeaderComponent}
                        ListFooterComponent={
                            <LoadMoreLoading
                                isLoading={isLoading && chatTabIndex === 0}
                                isMax={isMax}
                            />
                        }
                    />
                </CustView>
                <CheckInModal isShowModal={false} />
            </SafeAreaView>
        </ImageBackground>
    );
};

export default XChatScreen;

const styles = StyleSheet.create({
    backgroundStyle: { flex: 1, height: '50%' },
    headerView: {
        height: 60,
        alignItems: 'center',
        marginHorizontal: 30,
    },
    tabSwitchView: {
        height: 45,
        borderRadius: 32,
        marginVertical: 16,
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    btnBasic: {
        height: 35,
        width: 35,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    animatedSwitchButton: {
        top: 7,
        height: 32,
        marginLeft: 10,
        borderRadius: 32,
        width: TAB_WIDTH / 2,
        alignSelf: 'center',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: '#309DCB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 0.62,
        elevation: 1,
    },
    tabButton: {
        height: 32,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: (TAB_WIDTH - 20) / 2,
    },
    tabTextStyle: {
        lineHeight: 32,
        letterSpacing: 0.5,
        marginLeft: 10,
        marginRight: 10,
    },
    contentView: {
        paddingTop: 26,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    contentTitle: {
        marginBottom: 5,
        marginHorizontal: 20,
    },
    itemStyle: {
        height: 70,
        paddingHorizontal: 35,
    },
    btnStyle: {
        height: 50,
        width: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    iconSize: { height: 34, width: 34 },
});
