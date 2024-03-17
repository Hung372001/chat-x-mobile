import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { screenTracking, navigationRef } from './src/navigation/navigationUtils';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

import store from './src/redux/Store';
import XLoginScreen from './src/auth/xLoginScreen';
import XSignUpScreen from './src/auth/xSignUpScreen';
import XPreloader from './src/preloader/xPreloader';
import XCreateGroupScreen from './src/chat/xCreateGroupScreen';
import XAddFriendScreen from './src/chat/xAddFriendScreen';
import XChangePasswordScreen from './src/auth/xChangePasswordScreen';

import HomeTab from './src/navigation/homeTab';
import XSearchScreen from './src/chat/xSearchScreen';
import XProfileScreen from './src/profile/xProfileScreen';
import XMessageScreen from './src/chat/xMessageScreen';
import XGroupMemberScreen from './src/chat/xGroupMemberScreen';
import { refAlert } from './src/components/alert';
import DropdownAlert from 'react-native-dropdownalert';
import PushNotification from './src/notification/pushNotification';
import XChatSettingScreen from './src/chat/xChatSettingScreen';
import XArchiveScreen from './src/chat/xArchiveScreen';
import XGroupAdminMember from './src/chat/xGroupAdminMemberScreen';
import { XPreloadScreenNotify } from './src/utils/handlePushNotification';
import VideoPreview from './src/messageDetail/videoPreview';
import codePush from 'react-native-code-push';
import { buildEnv, codePushKey } from './src/services/globalConfig';
import { checkCodePushMandatory } from './src/utils/checkCodePush';
import ScreenUpdate from './src/preloader/screenUpdate';
import { HandleOffline } from './src/utils/handleOffline';

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
let persistor = persistStore(store);

// Auth stack
const AuthStack = createStackNavigator();
const AuthStacks = () => {
    return (
        <AuthStack.Navigator
            screenOptions={({ route, navigation }) => ({
                headerShown: false,
            })}
            initialRouteName="xLoginScreen"
        >
            <AuthStack.Screen name="xLoginScreen" component={XLoginScreen} />
            <AuthStack.Screen name="xSignUpScreen" component={XSignUpScreen} />
        </AuthStack.Navigator>
    );
};

const HomeStack = createStackNavigator();
const HomeStacks = () => {
    return (
        <HomeStack.Navigator
            screenOptions={({ route, navigation }) => ({
                headerShown: false,
            })}
            initialRouteName={'xPreloader'}
        >
            <HomeStack.Screen name="xPreloader" component={XPreloader} />
            <HomeStack.Screen name="xAuthStack" component={AuthStacks} />
            <HomeStack.Screen name="xHome" component={HomeTab} />
            <HomeStack.Screen name="xAddFriendScreen" component={XAddFriendScreen} />
            <HomeStack.Screen name="xCreateGroupScreen" component={XCreateGroupScreen} />
            <HomeStack.Screen name="xChangePasswordScreen" component={XChangePasswordScreen} />
            <HomeStack.Screen name="xSearchScreen" component={XSearchScreen} />
            <HomeStack.Screen name="xProfileScreen" component={XProfileScreen} />
            <HomeStack.Screen name="xMessageScreen" component={XMessageScreen} />
            <HomeStack.Screen name="xGroupMemberScreen" component={XGroupMemberScreen} />
            <HomeStack.Screen name="xChatSettingScreen" component={XChatSettingScreen} />
            <HomeStack.Screen name="xArchiveScreen" component={XArchiveScreen} />
            <HomeStack.Screen name="xGroupAdminMember" component={XGroupAdminMember} />
            <HomeStack.Screen
                name="xPreloadNotify"
                component={XPreloadScreenNotify}
                options={{ ...TransitionPresets.ModalFadeTransition }}
            />
            <HomeStack.Screen name="videoPreview" component={VideoPreview} />
        </HomeStack.Navigator>
    );
};

const AppChatX = () => {
    const [isUpdateCodePush, setIsUpdateCodePush] = useState(false);
    const [processCodePush, setProcessCodePush] = useState();

    useEffect(() => {
        checkCodePushAsync();
    }, []);

    const checkCodePushAsync = async () => {
        await checkCodePushMandatory({
            onSync: () => {
                setIsUpdateCodePush(true);
            },
            downloadProgressCallback: (process) => {
                setProcessCodePush(process);
            },
            onSyncDone: () => {},
        });
    };

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <HandleOffline />
                <PushNotification />
                {isUpdateCodePush ? (
                    <ScreenUpdate
                        process={
                            (processCodePush?.receivedBytes / processCodePush?.totalBytes) * 100
                        }
                    />
                ) : (
                    <NavigationContainer ref={navigationRef} onStateChange={screenTracking}>
                        <HomeStacks />
                    </NavigationContainer>
                )}

                <DropdownAlert
                    ref={refAlert}
                    showCancel
                    translucent
                    cancelBtnImageStyle={{ height: 24, width: 24 }}
                />
            </PersistGate>
        </Provider>
    );
};

const codePushOptions = {
    checkFrequency: codePush.CheckFrequency.MANUAL,
    deploymentKey: codePushKey[buildEnv],
};

export default codePush(codePushOptions)(AppChatX);
