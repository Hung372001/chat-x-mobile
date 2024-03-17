import React, { useState, useEffect } from 'react';
import {
    View,
    Animated,
    FlatList,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import Avatar from '../components/Avatar';
import Ionicons from 'react-native-vector-icons/Feather';
import { navigate } from '../navigation/navigationUtils';
import { images } from '../../assets';
import Colors from '../utils/colors';
import { CustView, CustText } from '../components';
import ListContact from './components/xListContact';
import ListGroup from './components/xListGroup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIOS } from '../utils';
import { useGetGroupQuery, useGetSearchQuery } from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { isEmpty, size } from 'lodash';
import WelcomeView from '../components/shared/welcomeView';
import { useSocket, useSocketEvent } from '../utils/socketIO';
import { socketConstants } from './../chat/constants/socketContants';

const tabWidth = Dimensions.get('window').width - 32;
const XContactScreen = () => {
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const socket = useSocket();
    const [chatTabIndex, setTabChatIndex] = useState(0);
    const [tabTranslate, setTabTranslate] = useState(new Animated.Value(0));
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);

    const [pageGroup, setPageGroup] = useState(1);
    const [isMaxGroup, setIsMaxGroup] = useState(false);
    const { data, isFetching, refetch } = useGetSearchQuery({
        page: page,
        type: 'USER',
    });

    const {
        data: groupData,
        isFetching: isFetchingGroup,
        refetch: refetchGroup,
    } = useGetGroupQuery({
        page: page,
        filter: 'GROUP',
    });

    const [friendList, setFriendList] = useState([]);
    const [groupList, setGroupList] = useState([]);

    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const isAllChatTabSelected = chatTabIndex == 0;

    useEffect(() => {
        if (isFocused) {
            groupData?.items && !isFetchingGroup && refetch();
        }
    }, [isFocused]);

    useEffect(() => {
        if (page === 1) {
            if (size(data?.items)) {
                setFriendList([...data?.items]);
            } else {
                setFriendList([]);
            }
        } else {
            if (size(data?.items)) {
                setFriendList([...friendList, ...data?.items]);
            }
            // Check isMax
            if (
                data?.items &&
                size([...friendList, ...data?.items]) >= data?.total &&
                pageGroup > 1
            ) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [data]);

    useEffect(() => {
        if (pageGroup === 1 && size(groupData?.items)) {
            setGroupList([...groupData?.items]);
        } else if (pageGroup === 1 && isEmpty(groupData?.items)) {
            setGroupList([]);
        } else {
            if (groupData?.items?.length) {
                setGroupList([...groupList, ...groupData?.items]);
            }
            // Check isMax
            if (
                groupData?.items &&
                [...groupList, ...groupData?.items].length >= groupData?.total &&
                pageGroup > 1
            ) {
                setIsMaxGroup(true);
            } else {
                setIsMaxGroup(false);
            }
        }
    }, [groupData]);

    useSocketEvent(socket, socketConstants.NEW_GROUP_CHAT_CREATED, (data) => {
        let tmpGroupList = groupList;
        setGroupList(
            [data?.groupChat, ...tmpGroupList].sort((a, b) => {
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

    useSocketEvent(socket, socketConstants.GROUP_CHAT_REMOVED, (data) => {
        let tmpGroupList = groupList;
        const removedGroup = tmpGroupList?.filter(
            (listItem) => listItem?.id !== data?.groupChat?.id
        );
        setGroupList(removedGroup);
    });

    const onRefreshPage = (type) => {
        if (type === 'GROUP') {
            if (pageGroup > 1) {
                setPageGroup(1);
                setGroupList([]);
            }
            setIsMaxGroup(false);
            refetchGroup();
        } else {
            if (page > 1) {
                setPage(1);
                setFriendList([]);
            }
            setIsMax(false);
            refetch();
        }
    };

    const onTabPress = (index) => {
        // Tab Switch animation
        const transitionMultiplier = 1;
        // Animating the active index based current index
        Animated.spring(tabTranslate, {
            toValue: index * (transitionMultiplier * ((tabWidth - 20) / 2)),
            stiffness: 240,
            damping: 20,
            mass: 1,
            useNativeDriver: true,
        }).start();
        // Set tab index
        setTabChatIndex(index);
    };

    const onEndReached = (type) => {
        if (type === 'GROUP') {
            if (!isFetchingGroup && groupList?.length < groupData?.total) {
                setPageGroup((pageGroup) => pageGroup + 1);
            }
        } else {
            if (!isFetching && friendList?.length < data?.total) {
                setPage((page) => page + 1);
            }
        }
    };

    return (
        <ImageBackground
            source={isDarkMode ? images.xBackgroundDark : images.bgWhite}
            style={styles.bg}
        >
            <SafeAreaView style={{ flex: 1 }}>
                {/* Chat Header */}
                <CustView
                    transparentBg
                    style={[styles.header, { marginTop: isIOS ? 0 : insets.top }]}
                >
                    <WelcomeView />
                    <CustView transparentBg style={styles.headerButtonSection}>
                        <TouchableOpacity
                            style={styles.btnBasic}
                            onPress={() => navigate('xSearchScreen')}
                        >
                            <Ionicons name={'search'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btnBasic, { marginHorizontal: 5 }]}
                            onPress={() => navigate('xAddFriendScreen')}
                        >
                            <Ionicons name={'user-plus'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.btnBasic}
                            onPress={() => navigate('xCreateGroupScreen')}
                        >
                            <Ionicons name={'users'} size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </CustView>
                </CustView>

                {/* Tab switch */}
                <Animated.View
                    style={[styles.tab, { backgroundColor: isDarkMode ? '#333333' : 'white' }]}
                >
                    {/* Animated switch */}
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            styles.tabAnimated,
                            {
                                transform: [
                                    {
                                        translateX: tabTranslate,
                                    },
                                ],
                            },
                        ]}
                    />
                    <TouchableOpacity onPress={() => onTabPress(0)} style={styles.tabButton}>
                        <CustText
                            size={13}
                            style={styles.tabText}
                            color={
                                isDarkMode
                                    ? 'white'
                                    : isAllChatTabSelected
                                    ? Colors.white
                                    : Colors.black
                            }
                        >
                            Danh sách bạn bè
                        </CustText>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onTabPress(1)} style={styles.tabButton}>
                        <CustText
                            size={13}
                            style={styles.tabText}
                            color={
                                isDarkMode
                                    ? 'white'
                                    : isAllChatTabSelected
                                    ? Colors.black
                                    : Colors.white
                            }
                        >
                            Danh sách nhóm
                        </CustText>
                    </TouchableOpacity>
                </Animated.View>

                <CustView style={styles.contact}>
                    <CustText bold style={styles.contactText}>
                        Danh bạ
                    </CustText>
                    {isAllChatTabSelected ? (
                        <FlatList
                            data={friendList}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(x, i) => i.toString()}
                            onEndReached={onEndReached}
                            onEndReachedThreshold={0.1}
                            initialNumToRender={20}
                            ListFooterComponent={
                                <LoadMoreLoading isLoading={isFetching} isMax={isMax} />
                            }
                            refreshControl={
                                <RefreshControl
                                    refreshing={false}
                                    onRefresh={() => onRefreshPage('CONTACT')}
                                />
                            }
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() =>
                                        navigate('xMessageScreen', {
                                            item,
                                            fromScreen: 'CONTACT',
                                        })
                                    }
                                >
                                    <ListContact item={item} />
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={groupList}
                            showsVerticalScrollIndicator={false}
                            keyExtractor={(x, i) => i.toString()}
                            onEndReached={() => onEndReached('GROUP')}
                            onEndReachedThreshold={0.1}
                            initialNumToRender={20}
                            ListFooterComponent={
                                <LoadMoreLoading isLoading={isFetchingGroup} isMax={isMaxGroup} />
                            }
                            refreshControl={
                                <RefreshControl
                                    refreshing={false}
                                    onRefresh={() => onRefreshPage('GROUP')}
                                />
                            }
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => navigate('xMessageScreen', { item })}
                                >
                                    <ListGroup item={item} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </CustView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default XContactScreen;

const styles = StyleSheet.create({
    btnBasic: {
        height: 35,
        width: 35,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2FACE1',
    },
    bg: { flex: 1, height: '50%' },
    header: {
        height: 60,
        alignItems: 'center',
        marginHorizontal: 30,
        flexDirection: 'row',
    },
    headerNameSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerHiText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8A9AA9',
    },
    headerButtonSection: {
        marginLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tab: {
        height: 45,
        borderRadius: 32,
        marginVertical: 16,
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    tabAnimated: {
        top: 7,
        height: 32,
        marginLeft: 10,
        borderRadius: 32,
        width: tabWidth / 2,
        alignSelf: 'center',
        position: 'absolute',
        backgroundColor: '#309DCB',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    tabButton: {
        height: 32,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: (tabWidth - 20) / 2,
    },
    tabText: {
        lineHeight: 32,
        letterSpacing: 0.5,
        marginLeft: 10,
        marginRight: 10,
    },
    contact: {
        flex: 1,
        paddingTop: 26,
        paddingHorizontal: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    contactText: {
        fontSize: 25,
        marginBottom: 5,
    },
});
