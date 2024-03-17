import React, { useState, useEffect } from 'react';
import { View, Text, Button, LogBox, Alert, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Feather';
import 'react-native-gesture-handler';

import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

import HomeScreen from './src/home/home';
import chatScreen from './src/chatScreen';
import preloader from './src/preloader/preloader';
import loginScreen from './src/auth/loginScreen';
import xLoginScreen from './src/auth/xLoginScreen';
import messageDetail from './src/messageDetail/messageDetail';
import singleMessageSettings from './src/settings/singleMessageSettings';
import groupMessageSettings from './src/settings/groupMessageSettings';
import messageDetailHeader from './src/header/messageDetailHeader';
import contactList from './src/contactList';
import chatHistory from './src/chatHistory';
import blockedUser from './src/blockedUser';
import friends from './src/friends';
import profile from './src/profile/profile';
import createGroup from './src/createGroup/createGroup';
import imagePreview from './src/settings/imagePreview';
import imagesListPreview from './src/messageDetail/imagesListPreview';
import videoPreview from './src/messageDetail/videoPreview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CONSTANT from './src/constant/constant';
import Pusher from 'pusher-js/react-native';
import store from './src/redux/Store';
import whatsappSupport from './src/messageDetail/whatsappSupport';
import { screenTracking, setNavigator } from './src/navigation/navigationUtils';
import settingScreen from './src/settingScreen';
import addFriendScreen from './src/chat/xAddFriendScreen';
import createGroupScreen from './src/chat/xCreateGroupScreen';
import changePasswordScreen from './src/changePasswordScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
let persistor = persistStore(store);

HomeStack = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [id, setId] = useState('');
    useEffect(() => {
        getData();
        setTimeout(() => {
            setShowSplash(false);
        }, 2000);
    }, []);

    const getData = async () => {
        const Saveid = await AsyncStorage.getItem('id');
        setId(Saveid);
    };
    return (
        <Stack.Navigator headerMode="none">
            {showSplash == true ? (
                <Stack.Screen name="preloader" component={preloader} />
            ) : (
                <>
                    {id == null ? (
                        <>
                            <Stack.Screen name="loginScreen" component={loginScreen} />
                            <Stack.Screen name="home" component={HomeTab} />
                            <Stack.Screen name="homeScreen" component={HomeScreen} />
                            <Tab.Screen name="addFriendScreen" component={addFriendScreen} />
                            <Tab.Screen name="createGroupScreen" component={createGroupScreen} />
                            <Tab.Screen
                                name="changePasswordScreen"
                                component={changePasswordScreen}
                            />
                        </>
                    ) : (
                        // <Stack.Screen name="home" component={HomeTab} />
                        <Stack.Screen name="homeScreen" component={HomeScreen} />
                    )}
                </>
            )}
            {id != null && <Stack.Screen name="loginScreen" component={loginScreen} />}
            <Stack.Screen name="messageDetail" component={messageDetail} />
            <Stack.Screen name="messageDetailHeader" component={messageDetailHeader} />
            <Stack.Screen name="singleMessageSettings" component={singleMessageSettings} />
            <Stack.Screen name="groupMessageSettings" component={groupMessageSettings} />
            <Stack.Screen name="profile" component={profile} />
            <Stack.Screen name="createGroup" component={createGroup} />
            <Stack.Screen name="imagePreview" component={imagePreview} />
            <Stack.Screen name="imagesListPreview" component={imagesListPreview} />
            <Stack.Screen name="videoPreview" component={videoPreview} />
            <Stack.Screen name="whatsappSupport" component={whatsappSupport} />
        </Stack.Navigator>
    );
};

HomeTab = () => {
    const [primary, setPrimary] = useState('');
    const [secondry, setSecondry] = useState('');

    useEffect(() => {
        setData();
    }, []);

    const setData = async () => {
        const primaryColor = await AsyncStorage.getItem('primaryColor');
        const secondaryColor = await AsyncStorage.getItem('secondaryColor');
        setPrimary(primaryColor);
        setSecondry(secondaryColor);
    };
    return (
        <Tab.Navigator
            initialRouteName={'chatScreen'}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    // let iconName;
                    // if (route.name === "home") {
                    //   iconName = "users";
                    // } else if (route.name === "chatScreen") {
                    //   iconName = "message-square";
                    // } else if (route.name === "friends") {
                    //   iconName = "user-plus";
                    // } else if (route.name === "blockedUser") {
                    //   iconName = "user-x";
                    // } else if (route.name === "chatHistory") {
                    //   iconName = "layers";
                    // }

                    // return <Ionicons name={iconName} size={size} color={color} />;
                    let menuItem;
                    if (route.name === 'chatScreen') {
                        menuItem = {
                            icon: focused
                                ? require('./assets/chatActive.png')
                                : require('./assets/chatInactive.png'),
                            title: 'Trò chuyện',
                            color: focused ? '#292941' : '#8A9AA9',
                        };
                    } else if (route.name === 'contactList') {
                        menuItem = {
                            icon: focused
                                ? require('./assets/calendarActive.png')
                                : require('./assets/calendarInactive.png'),
                            title: 'Danh bạ',
                            color: focused ? '#292941' : '#8A9AA9',
                        };
                    } else if (route.name === 'settingScreen') {
                        menuItem = {
                            icon: focused
                                ? require('./assets/settingActive.png')
                                : require('./assets/settingInactive.png'),
                            title: 'Cài đặt',
                            color: focused ? '#292941' : '#8A9AA9',
                        };
                    }
                    return (
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: 16,
                            }}
                        >
                            <Image source={menuItem?.icon} style={{ height: 24, width: 24 }} />
                            <Text style={{ marginTop: 5, color: menuItem?.color }}>
                                {menuItem?.title}
                            </Text>
                        </View>
                    );
                },
            })}
            tabBarOptions={{
                showLabel: false,
                style: {
                    backgroundColor: '#FFFFFF',
                },
            }}
        >
            <Tab.Screen name="contactList" component={contactList} />
            {/* <Tab.Screen name="home" component={HomeScreen} /> */}
            <Tab.Screen name="chatScreen" component={chatScreen} />
            <Tab.Screen name="settingScreen" component={settingScreen} />
            {/* <Tab.Screen name="blockedUser" component={blockedUser} /> */}
            {/* <Tab.Screen name="chatHistory" component={chatHistory} /> */}
        </Tab.Navigator>
    );
};

HomeDrawer = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={HomeStack} />
        </Drawer.Navigator>
    );
};

App = () => {
    const navigationRef = useNavigationContainerRef();

    useEffect(() => {
        getPusherData();
    }, []);

    const getPusherData = async () => {
        const id = await AsyncStorage.getItem('id');
        const response = await fetch(
            CONSTANT.BaseUrl + 'get-app-guppy-setting?userId=' + JSON.parse(id)
        );
        const json = await response.json();
        await AsyncStorage.setItem(
            'pusherEnable',
            JSON.stringify(json.settings.chatSetting.pusherEnable)
        );

        await AsyncStorage.setItem('pusherKey', json.settings.chatSetting.pusherKey);

        await AsyncStorage.setItem('pusherCluster', json.settings.chatSetting.pusherCluster);

        await AsyncStorage.setItem(
            'translationData',
            JSON.stringify(json.settings.chatSetting.translations)
        );

        await AsyncStorage.setItem('primaryColor', json.settings.chatSetting.primaryColor);

        await AsyncStorage.setItem('secondaryColor', json.settings.chatSetting.secondaryColor);

        await AsyncStorage.setItem(
            'notificationBellUrl',
            json.settings.chatSetting.notificationBellUrl
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <NavigationContainer
                        ref={setNavigator(navigationRef)}
                        onStateChange={screenTracking}
                    >
                        {HomeStack()}
                    </NavigationContainer>
                </PersistGate>
            </Provider>
        </GestureHandlerRootView>
    );
};

export default App;
