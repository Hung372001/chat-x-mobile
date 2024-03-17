import { View, SafeAreaView, Image, TouchableOpacity, Text } from 'react-native';
import React, { useState, useEffect, useRef, useReducer } from 'react';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BlockedUser from '../blockedUser';
import ChatHistory from '../chatHistory';
import ChatScreen from '../chatScreen';
import AdminSupport from '../adminSupport';
import Pusher from 'pusher-js/react-native';
import WhatsappUser from '../whatsappUser';
import * as CONSTANT from '../constant/constant';
import Friends from '../friends';
import ContactList from '../contactList';
import Profile from '../profile/profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { updateTab, updateChatTab } from '../redux/TabSlice';
import {
    updateChat,
    updateGroupChat,
    updatePostChat,
    updateSupportMessages,
    updateSupportAgents,
} from '../redux/mainListingSlice';
import { useIsFocused } from '@react-navigation/native';
import SocketioService from '../socketio/socketio.service';
import SoundPlayer from 'react-native-sound-player';
import { images } from '../../assets';

const home = ({ navigation }) => {
    const [forceUpdate] = useReducer((x) => x + 1, 0);
    const chat = useSelector((state) => state.listing.chat);
    const groupChat = useSelector((state) => state.listing.groupChat);
    const postChat = useSelector((state) => state.listing.postChat);
    const messages = useSelector((state) => state.messages.chatMessages);
    const chatId = useSelector((state) => state.messages.chatId);
    const tab = useSelector((state) => state.tab.tab);
    const settings = useSelector((state) => state.setting.settings);
    const dispatch = useDispatch();
    const [showContacts, setShowContacts] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);
    const [showPosts, setShowPosts] = useState(false);
    const [showGroups, setShowGroups] = useState(false);
    const [showWhatsapp, setShowWhatsapp] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [userList, setUserList] = useState(chat);
    const [userMessages, setUserMessages] = useState(messages);
    const [userChatId, setUserChatId] = useState(chatId);
    const [postChatData, setPostChatData] = useState(postChat);
    const isFocused = useIsFocused();
    const socketService = SocketioService;

    useEffect(() => {
        if (settings?.chatSetting?.whatsappSupportEnable == true) {
            setShowWhatsapp(true);
        }
        settings?.chatSetting?.enabledTabs.map((tab) => {
            if (tab == 'contacts') {
                setShowContacts(true);
            }
            if (tab == 'private_chats') {
                setShowMessages(true);
            }
            if (tab == 'friends') {
                setShowFriends(true);
            }
            if (tab == 'blocked') {
                setShowBlocked(true);
            }
            if (tab == 'posts') {
                setShowPosts(true);
            }
            if (tab == 'groups') {
                setShowGroups(true);
            }
        });
    }, []);

    if (settings?.chatSetting?.socketEnable == false) {
        useEffect(() => {
            pusherData();
        }, []);
    } else {
        useEffect(() => {
            if (isFocused) {
                socketData();
            }
        }, [isFocused]);
    }

    useEffect(() => {
        if (isFocused) {
            setUserList(chat);
            setUserMessages(messages);
            setUserChatId(chatId);
            setPostChatData(postChat);
        }
    }, [refresh, isFocused]);

    const pusherData = async () => {
        const id = await AsyncStorage.getItem('id');
        const pusherEnable = await AsyncStorage.getItem('pusherEnable');
        const key = await AsyncStorage.getItem('pusherKey');
        const cluster = await AsyncStorage.getItem('pusherCluster');

        if (pusherEnable == 'true') {
            let pusher = new Pusher(key, {
                cluster: cluster,
                auth: {
                    params: {
                        userId: JSON.parse(id),
                    },
                },
                authEndpoint: CONSTANT.BaseUrl + 'channel-authorize',
            });

            let channel = pusher.subscribe('presence-user-' + JSON.parse(id));

            channel.bind('recChatData', async function (mydata) {
                recChatData(mydata);
            });
        }
    };

    const socketData = async () => {
        const token = await AsyncStorage.getItem('token');
        const id = await AsyncStorage.getItem('id');
        const socket = socketService.socketConnection(
            token,
            settings?.chatSetting?.socketHost,
            settings?.chatSetting?.socketPort
        );
        socketService.connectUser(JSON.parse(id));
        socket.on('receiverChatData', (mydata) => {
            recChatData(mydata);
        });
    };

    const recChatData = (mydata) => {
        let storeData = [];
        let groupStoreData;
        let postChatHistory = [];

        storeData = JSON.parse(JSON.stringify(userList));
        groupStoreData = JSON.parse(JSON.stringify(groupChat));
        postChatHistory = JSON.parse(JSON.stringify(postChatData));

        setRefresh(!refresh);

        if (mydata.chatType == 1) {
            for (var i = 0; i < storeData.length; i++) {
                if (mydata.chatId == storeData[i].chatId) {
                    // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                    storeData.splice(i, 1);
                    storeData.unshift(mydata.messagelistData);
                    dispatch(updateChat(JSON.parse(JSON.stringify(storeData))));
                    setRefresh(!refresh);
                    return;
                } else {
                    if (i == storeData.length - 1) {
                        // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                        storeData.unshift(mydata.messagelistData);
                        dispatch(updateChat(JSON.parse(JSON.stringify(storeData))));
                        setRefresh(!refresh);
                        return;
                    }
                }
            }
        } else if (mydata.chatType == 2) {
            for (var i = 0; i < groupStoreData.length; i++) {
                if (mydata.chatId == groupStoreData[i].chatId) {
                    // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                    groupStoreData.splice(i, 1);
                    groupStoreData.unshift(mydata.messagelistData);
                    dispatch(updateGroupChat(JSON.parse(JSON.stringify(groupStoreData))));
                    return;
                } else {
                    if (i == groupStoreData.length - 1) {
                        // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                        groupStoreData.unshift(mydata.messagelistData);
                        dispatch(updateGroupChat(JSON.parse(JSON.stringify(groupStoreData))));
                        return;
                    }
                }
            }
        } else if (mydata.chatType == 0) {
            for (var i = 0; i < postChatHistory.length; i++) {
                if (mydata.chatId == postChatHistory[i].chatId) {
                    // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                    postChatHistory.splice(i, 1);
                    postChatHistory.unshift(mydata.messagelistData);
                    dispatch(updatePostChat(JSON.parse(JSON.stringify(postChatHistory))));
                    setRefresh(!refresh);
                    return;
                } else {
                    if (i == postChatHistory.length - 1) {
                        // SoundPlayer.playUrl(settings?.chatSetting?.notificationBellUrl)
                        postChatHistory.unshift(mydata.messagelistData);
                        dispatch(updatePostChat(JSON.parse(JSON.stringify(postChatHistory))));
                        setRefresh(!refresh);
                        return;
                    }
                }
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'red' }}>
            <View style={{ flexDirection: 'row', flex: 1, width: '100%' }}>
                <View
                    style={{
                        width: 60,
                        backgroundColor: '#0A0F26',
                        borderRightColor: '#ddd',
                        borderRightWidth: 0.6,
                        justifyContent: 'space-between',
                    }}
                >
                    <View>
                        <TouchableOpacity
                            style={{
                                paddingVertical: 15,
                                borderBottomColor: '#ffffff40',
                                borderBottomWidth: 0.6,
                            }}
                        >
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: 35 / 2,
                                    alignSelf: 'center',
                                }}
                                source={images.splashImage}
                            />
                        </TouchableOpacity>

                        {showContacts && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('contacts'))}
                                style={{
                                    backgroundColor: tab == 'contacts' ? '#12193C' : '#0A0F26',
                                    paddingVertical: 15,
                                    borderBottomColor: '#ffffff40',
                                    borderBottomWidth: 0.6,
                                    alignItems: 'center',
                                    borderLeftWidth: tab == 'contacts' ? 3 : 0,
                                    borderLeftColor: tab == 'contacts' ? '#FF7300' : '#fff',
                                }}
                            >
                                {/* <View
                  style={{
                    backgroundColor: "#EF4444",
                    width: 6,
                    height: 6,
                    borderRadius: 6 / 2,
                    marginLeft: 30,
                    marginBottom: 5,
                  }}
                ></View> */}
                                <Feather
                                    name={'users'}
                                    size={20}
                                    color={tab == 'contacts' ? '#FF7300' : '#999999'}
                                />
                            </TouchableOpacity>
                        )}
                        {(showMessages || showGroups) && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('private_chats'))}
                                style={{
                                    backgroundColor: tab == 'private_chats' ? '#12193C' : '#0A0F26',
                                    paddingVertical: 15,
                                    borderBottomColor: '#ffffff40',
                                    borderBottomWidth: 0.6,
                                    alignItems: 'center',
                                    borderLeftWidth: tab == 'private_chats' ? 3 : 0,
                                    borderLeftColor: tab == 'private_chats' ? '#FF7300' : '#fff',
                                }}
                            >
                                {/* <View
                  style={{
                    backgroundColor: "#EF4444",
                    width: 6,
                    height: 6,
                    borderRadius: 6 / 2,
                    marginLeft: 30,
                    marginBottom: 5,
                  }}
                ></View> */}
                                <Feather
                                    name={'message-square'}
                                    size={20}
                                    color={tab == 'private_chats' ? '#FF7300' : '#999999'}
                                />
                            </TouchableOpacity>
                        )}
                        {showFriends && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('friends'))}
                                style={{
                                    backgroundColor: tab == 'friends' ? '#12193C' : '#0A0F26',
                                    paddingVertical: 15,
                                    borderBottomColor: '#ffffff40',
                                    borderBottomWidth: 0.6,
                                    alignItems: 'center',
                                    borderLeftWidth: tab == 'friends' ? 3 : 0,
                                    borderLeftColor: tab == 'friends' ? '#FF7300' : '#fff',
                                }}
                            >
                                <Feather
                                    name={'user-plus'}
                                    size={20}
                                    color={tab == 'friends' ? '#FF7300' : '#999999'}
                                />
                            </TouchableOpacity>
                        )}
                        {showBlocked && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('blocked'))}
                                style={{
                                    backgroundColor: tab == 'blocked' ? '#12193C' : '#0A0F26',
                                    paddingVertical: 15,
                                    borderBottomColor: '#ffffff40',
                                    borderBottomWidth: 0.6,
                                    alignItems: 'center',
                                    borderLeftWidth: tab == 'blocked' ? 3 : 0,
                                    borderLeftColor: tab == 'blocked' ? '#FF7300' : '#fff',
                                }}
                            >
                                <Feather
                                    name={'user-x'}
                                    size={20}
                                    color={tab == 'blocked' ? '#FF7300' : '#999999'}
                                />
                            </TouchableOpacity>
                        )}
                        {showPosts && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('posts'))}
                                style={{
                                    backgroundColor: tab == 'posts' ? '#12193C' : '#0A0F26',
                                    paddingVertical: 15,
                                    borderBottomColor: '#ffffff40',
                                    borderBottomWidth: 0.6,
                                    alignItems: 'center',
                                    borderLeftWidth: tab == 'posts' ? 3 : 0,
                                    borderLeftColor: tab == 'posts' ? '#FF7300' : '#fff',
                                }}
                            >
                                {/* <View
                  style={{
                    backgroundColor: "#EF4444",
                    width: 6,
                    height: 6,
                    borderRadius: 6 / 2,
                    marginLeft: 30,
                    marginBottom: 5,
                  }}
                ></View> */}
                                <AntDesign
                                    // style={{transform: [{ rotate: '45deg' }]}}
                                    name={'pushpino'}
                                    size={20}
                                    color={tab == 'posts' ? '#FF7300' : '#999999'}
                                />
                            </TouchableOpacity>
                        )}
                        {showWhatsapp && (
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('whatsapp'))}
                                style={{
                                    backgroundColor: tab == 'whatsapp' ? '#12193C' : '#0A0F26',
                                    borderBottomColor: '#ffffff40',
                                    paddingBottom: 10,
                                    borderBottomWidth: 0.6,
                                    borderLeftWidth: tab == 'whatsapp' ? 3 : 0,
                                    borderLeftColor: tab == 'whatsapp' ? '#FF7300' : '#fff',
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#EF4444',
                                        width: 30,
                                        borderBottomLeftRadius: 6,
                                        paddingVertical: 3,
                                        alignSelf: 'flex-end',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontFamily: 'OpenSans-Bold',
                                            fontSize: 9,
                                            lineHeight: 11,
                                            letterSpacing: 1,
                                            textAlign: 'center',
                                        }}
                                    >
                                        HOT
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => dispatch(updateTab('whatsapp'))}
                                    style={{
                                        alignItems: 'center',
                                        paddingTop: 10,
                                    }}
                                >
                                    <FontAwesome name={'whatsapp'} size={20} color={'#25D366'} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => dispatch(updateTab('support'))}
                            style={{
                                backgroundColor: tab == 'support' ? '#12193C' : '#0A0F26',
                                borderBottomColor: '#ffffff40',
                                paddingBottom: 10,
                                borderBottomWidth: 0.6,
                                borderLeftWidth: tab == 'support' ? 3 : 0,
                                borderLeftColor: tab == 'support' ? '#FF7300' : '#fff',
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: '#FF7300',
                                    width: 30,
                                    borderBottomLeftRadius: 6,
                                    paddingVertical: 3,
                                    alignSelf: 'flex-end',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontFamily: 'OpenSans-Bold',
                                        fontSize: 9,
                                        lineHeight: 11,
                                        letterSpacing: 1,
                                        textAlign: 'center',
                                    }}
                                >
                                    New
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => dispatch(updateTab('support'))}
                                style={{
                                    alignItems: 'center',
                                    paddingTop: 10,
                                }}
                            >
                                <Image
                                    resizeMode="contain"
                                    style={{
                                        width: 20,
                                        height: 20,
                                        alignSelf: 'center',
                                    }}
                                    source={require('../../assets/support.png')}
                                />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                    <View style={{ borderTopColor: '#ffffff40', borderTopWidth: 0.6 }}>
                        <TouchableOpacity
                            onPress={() => dispatch(updateTab('profile'))}
                            style={{
                                backgroundColor: tab == 'profile' ? '#12193C' : '#0A0F26',
                                paddingVertical: 15,
                                borderBottomColor: '#ffffff40',
                                borderBottomWidth: 0.6,
                                alignItems: 'center',
                                borderLeftWidth: tab == 'profile' ? 3 : 0,
                                borderLeftColor: tab == 'profile' ? '#FF7300' : '#fff',
                            }}
                        >
                            <Feather
                                name={'settings'}
                                size={20}
                                color={tab == 'profile' ? '#FF7300' : '#999999'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {tab == 'contacts' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <ContactList />
                    </View>
                ) : tab == 'private_chats' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <ChatScreen />
                    </View>
                ) : tab == 'friends' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <Friends />
                    </View>
                ) : tab == 'blocked' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <BlockedUser />
                    </View>
                ) : tab == 'posts' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <ChatHistory />
                    </View>
                ) : tab == 'profile' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <Profile />
                    </View>
                ) : tab == 'whatsapp' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <WhatsappUser />
                    </View>
                ) : tab == 'support' ? (
                    <View style={{ backgroundColor: '#fff', width: '82.5%', flex: 1 }}>
                        <AdminSupport />
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
};

export default home;
