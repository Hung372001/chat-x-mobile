import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import xChatScreen from '../chat/xChatScreen';
import xSettingScreen from '../settings/xSettingScreen';
import xContactScreen from '../contact/xContactScreen';
import { images } from '../../assets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../utils/colors';
import { CustText, CustView } from '../components';
import { useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();

const HomeTab = () => {
    const insets = useSafeAreaInsets();
    const isDarkMode = useSelector((state) => state?.setting?.isDarkMode);

    const buildTabBar = (route) => {
        return {
            tabBarStyle: { backgroundColor: isDarkMode ? 'black' : 'white', height: 64 },
            tabBarShowLabel: false,
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                const whiteMode = () => (focused ? Colors.black : Colors.grey);
                const darkMode = () => (focused ? Colors.white : Colors.grey);

                let menuItem;
                if (route.name === 'xChatScreen') {
                    menuItem = {
                        icon: focused ? images.chatActive : images.chatInactive,
                        title: 'Trò chuyện',
                        color: isDarkMode ? darkMode() : whiteMode(),
                    };
                } else if (route.name === 'xContactList') {
                    menuItem = {
                        icon: focused ? images.calendarActive : images.calendarInactive,
                        title: 'Danh bạ',
                        color: isDarkMode ? darkMode() : whiteMode(),
                    };
                } else if (route.name === 'xSettingScreen') {
                    menuItem = {
                        icon: focused ? images.settingActive : images.settingInActive,
                        title: 'Cài đặt',
                        color: isDarkMode ? darkMode() : whiteMode(),
                    };
                }
                return (
                    <CustView
                        center
                        style={[
                            styles.itemStyle,
                            { marginBottom: Boolean(insets.bottom) ? 0 : 12 },
                            { backgroundColor: isDarkMode ? 'black' : 'white' },
                        ]}
                    >
                        <Image source={menuItem?.icon} style={styles.icon} />
                        <CustText color={menuItem?.color} style={styles.titleStyle}>
                            {menuItem?.title}
                        </CustText>
                    </CustView>
                );
            },
        };
    };

    return (
        <Tab.Navigator
            initialRouteName={'xChatScreen'}
            screenOptions={({ route }) => buildTabBar(route)}
        >
            <Tab.Screen name="xContactList" component={xContactScreen} />
            <Tab.Screen name="xChatScreen" component={xChatScreen} />
            <Tab.Screen name="xSettingScreen" component={xSettingScreen} />
        </Tab.Navigator>
    );
};

export default HomeTab;

const styles = StyleSheet.create({
    itemStyle: {
        marginTop: 16,
    },
    icon: {
        height: 24,
        width: 24,
    },
    titleStyle: {
        marginTop: 5,
    },
});
