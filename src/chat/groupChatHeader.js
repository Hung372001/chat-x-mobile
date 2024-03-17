import React, { memo } from 'react';
import { StatusBar, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { touchArea } from '../utils';
import { images } from '../../assets';
import CustView from '../components/custView';
import Colors from '../utils/colors';
import CustText from '../components/custText';
import { navigate } from '../navigation/navigationUtils';
import { isNil } from 'lodash';
import { metrics } from '../utils';
import AvatarGroup from '../components/AvatarGroup';

const GroupChatHeader = ({
    children,
    isDarkMode = false,
    rightContent,
    data,
    member = [],
    onBackPress,
    avatar,
    totalMember,
}) => {
    const insets = useSafeAreaInsets();

    const onGoBack = () => {
        onBackPress();
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
                                style={styles.row}
                                onPress={() =>
                                    navigate('xGroupMemberScreen', {
                                        type: 'REMOVE',
                                        data: data,
                                        member: member,
                                    })
                                }
                            >
                                <AvatarGroup number={totalMember} uri={avatar} />
                                <CustView style={styles.titleView}>
                                    <CustText numberOfLines={1} size={14} bold>
                                        {data?.name}
                                    </CustText>
                                    <CustText style={{ marginTop: 2 }} color={Colors.lightBlue}>
                                        {totalMember} thành viên
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

export default memo(GroupChatHeader);

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
    numAvatar: {
        height: 28,
        width: 28,
        bottom: 0,
        right: 0,
        position: 'absolute',
        borderRadius: 15,
        backgroundColor: Colors.white,
        shadowOffset: { width: 0, height: 1 },
        shadowColor: '#000000',
        shadowOpacity: 0.1,
    },
    titleView: { marginLeft: 8, width: metrics.screenWidth * 0.45 },
    row: { flexDirection: 'row', alignItems: 'center' },
});
