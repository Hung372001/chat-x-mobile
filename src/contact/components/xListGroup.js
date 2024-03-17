import React from 'react';
import { View, StyleSheet } from 'react-native';
import AvatarGroup from '../../components/AvatarGroup';
import Avatar from '../../components/Avatar';
import Colors from '../../utils/colors';
import { CustText, CustView } from '../../components';
import { useSelector } from 'react-redux';
import { size } from 'lodash';

const ListGroup = (props) => {
    const isGroup = props.item?.type === 'Group';

    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const checkAvatar = (isGroup, members, currentUserId) => {
        const findFriendAvatar = members?.filter((memberItem) => memberItem?.id !== currentUserId);
        if (isGroup) {
            return findFriendAvatar?.map((memberItem) => memberItem?.profile?.avatar);
        } else {
            return findFriendAvatar?.[0]?.profile?.avatar;
        }
    };

    return (
        <CustView style={styles.container}>
            <CustView style={styles.avatarSection}>
                <CustView style={{ alignItems: 'center' }}>
                    <AvatarGroup
                        uri={checkAvatar(isGroup, props.item?.members)}
                        number={size(props?.item?.members)}
                    />
                </CustView>
                <CustView style={{ marginLeft: 10 }}>
                    <CustText size={15} color={isDarkMode ? 'white' : '#292941'} bold>
                        {props.item?.name}
                    </CustText>
                    {props.item?.latestMessage && (
                        <CustView row style={{ marginTop: 4 }}>
                            {/* <Avatar size={14} /> */}
                            <CustText size={12} style={{ marginLeft: 4 }}>
                                {props.item?.name ?? ''}
                            </CustText>
                        </CustView>
                    )}
                </CustView>
            </CustView>
            <CustView>
                {Boolean(props.item?.newMessage) && (
                    <CustView style={styles.newMessage}>
                        <CustText style={styles.newMessageText}>{props.item?.newMessage}</CustText>
                    </CustView>
                )}
                {Boolean(props.item?.newMessage) && (
                    <CustView style={styles.newMessage}>
                        <CustText style={styles.newMessageDate}>{props.item?.date}</CustText>
                    </CustView>
                )}
            </CustView>
        </CustView>
    );
};

export default ListGroup;

const styles = StyleSheet.create({
    container: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    avatarSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        bottom: 0,
        position: 'absolute',
    },
    avatarText: {
        height: 20,
        maxWidth: 70,
        borderRadius: 130,
        paddingHorizontal: 6,
        shadowColor: '#6F6F87',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        shadowRadius: 4,
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 1,
        },
    },
    newMessage: {
        height: 17,
        width: 16,
        borderRadius: 8,
        alignItems: 'center',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        backgroundColor: '#2FACE1',
    },
    newMessageText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontFamily: 'Urbanist-Bold',
    },
    newMessageDate: {
        marginTop: 4,
        fontSize: 12,
        color: '#AFBAC5',
        alignSelf: 'flex-end',
    },
});
