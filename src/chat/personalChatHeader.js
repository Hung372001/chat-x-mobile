import React, { memo, useMemo } from 'react';
import { StatusBar, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { metrics, touchArea } from '../utils';
import { images } from '../../assets';
import Avatar from '../components/Avatar';
import CustView from '../components/custView';
import Colors from '../utils/colors';
import CustText from '../components/custText';
import { isEmpty, isNil } from 'lodash';

const PersonalChatHeader = ({
    children,
    isDarkMode = false,
    rightContent,
    data,
    onBackPress,
    friendInfo,
    onProfile,
    avatar,
    isOnline = false,
}) => {
    const insets = useSafeAreaInsets();
    const isGroupChat = !isEmpty(data?.type);

    const checkName = useMemo(() => {
        if (isGroupChat) {
            return friendInfo?.nickname || friendInfo?.username;
        } else {
            return data?.nickname || data?.username;
        }
    }, [friendInfo]);

    const onGoBack = () => {
        onBackPress();
    };

    const onProfilePress = (item) => {
        onProfile && onProfile(item);
    };

    return (
        <>
            <CustView row centerVertical style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar
                    translucent={true}
                    backgroundColor={'transparent'}
                    barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                />
                {children}
                {isNil(children) && (
                    <>
                        <CustView row fillHeight centerVertical style={[styles.contentView]}>
                            <TouchableOpacity
                                onPress={onGoBack}
                                hitSlop={touchArea}
                                style={styles.btnStyle}
                            >
                                <Image
                                    source={images.iconBack}
                                    resizeMode="stretch"
                                    style={styles.iconBack}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.6}
                                onPress={() => onProfilePress(data)}
                                style={styles.row}
                            >
                                <Avatar uri={avatar} />
                                <CustView style={styles.titleView}>
                                    <CustText numberOfLines={1} size={14} bold>
                                        {checkName}
                                    </CustText>
                                    <CustText
                                        style={{ marginTop: 2 }}
                                        color={isOnline ? Colors.lightBlue : Colors.grey}
                                    >
                                        {isOnline ? 'Online' : 'Offline'}
                                    </CustText>
                                </CustView>
                            </TouchableOpacity>
                        </CustView>
                        {rightContent && rightContent()}
                    </>
                )}
            </CustView>
        </>
    );
};

export default memo(PersonalChatHeader);

var styles = StyleSheet.create({
    container: {
        paddingBottom: 2,
        paddingHorizontal: 18,
    },
    contentView: {
        height: 50,
        paddingTop: 8,
        marginBottom: 14,
    },
    iconBack: {
        width: 21.5,
        height: 18,
    },
    btnStyle: {
        height: 30,
        width: 21,
        marginRight: 16,
        justifyContent: 'center',
    },
    titleView: { marginLeft: 8, width: metrics.screenWidth * 0.43 },
    row: { flexDirection: 'row', alignItems: 'center' },
});
