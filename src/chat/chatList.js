import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { size, orderBy } from 'lodash';
import Avatar from '../components/Avatar';
import Colors from '../utils/colors';
import { images } from '../../assets';
import { CustText, CustView } from '../components';
import AvatarGroup from '../components/AvatarGroup';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import { RefreshControl } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import CustImage from '../components/custImage';

const ITEM_HEIGHT = 80;
const ChatList = ({
    data,
    onItemPress,
    onEndReached,
    onRefreshPage,
    ListFooterComponent,
    userId,
    onDelete,
    onPin,
    onArchive,
    ListHeaderComponent,
    isArchive = false,
    style,
}) => {
    let prevOpenedRow;
    let row = [];

    const isDarkMode = useSelector((state) => state.setting.isDarkMode);
    const userProfile = useSelector((state) => state.auth.userProfile);

    const handlePress = (item) => () => {
        onItemPress(item);
    };

    const findFriend = (data) => {
        const findMember = data.find((findItem) => findItem?.id !== userId);
        return findMember ?? {};
    };

    const checkGroupName = (groupItem) => {
        if (groupItem?.type === 'Dou') {
            const friendItem = findFriend(groupItem?.members);
            return friendItem?.nickname || friendItem?.username;
        } else {
            return groupItem?.name;
        }
    };

    const checkAvatar = (isGroup, members) => {
        const memberList = orderBy(members, (a) => moment(a?.createdAt), 'asc');
        const findFriendAvatar = memberList?.filter(
            (memberItem) => memberItem?.id !== userProfile?.id
        );
        if (isGroup) {
            let avatarList = memberList.map((memberItem) => memberItem?.profile?.avatar);
            return <AvatarGroup uri={avatarList} size={50} number={size(members)} />;
        } else {
            let avatarItem = findFriendAvatar?.[0]?.profile?.avatar;
            return <Avatar uri={avatarItem} />;
        }
    };

    const onDeletePress = (groupId, index) => {
        onDelete && onDelete(groupId);
        onDelete && row?.[index]?.close();
    };

    const onPinPress = (groupId, index) => {
        onPin && onPin(groupId);
        onPin && row?.[index]?.close();
    };

    const onArchivePress = (groupId, index) => {
        onArchive && onArchive(groupId);
        onArchive && row?.[index]?.close();
    };

    const buildLatestMessage = (item) => {
        const latestMessage = item?.latestMessage;
        if (!isEmpty(item?.latestMessage?.message)) {
            return (
                <CustText size={12} color={'#AFBAC5'} style={{ marginTop: 4 }}>
                    {item?.latestMessage?.message}
                </CustText>
            );
        } else if (
            latestMessage?.imageUrls?.[0]?.includes('png') ||
            latestMessage?.imageUrls?.[0]?.includes('gif') ||
            latestMessage?.imageUrls?.[0]?.includes('jpg') ||
            latestMessage?.imageUrls?.[0]?.includes('jpeg')
        ) {
            return (
                <CustText size={12} color={'#AFBAC5'} style={{ marginTop: 4 }}>
                    {'Hình ảnh'}
                </CustText>
            );
        } else if (
            latestMessage?.imageUrls?.[0]?.includes('video') ||
            latestMessage?.imageUrls?.[0]?.includes('mp4') ||
            latestMessage?.imageUrls?.[0]?.includes('mov') ||
            latestMessage?.imageUrls?.[0]?.includes('wmv') ||
            latestMessage?.imageUrls?.[0]?.includes('avi') ||
            latestMessage?.imageUrls?.[0]?.includes('flv') ||
            latestMessage?.documentUrls?.[0]?.includes('mp4') ||
            latestMessage?.documentUrls?.[0]?.includes('mov') ||
            latestMessage?.documentUrls?.[0]?.includes('wmv') ||
            latestMessage?.documentUrls?.[0]?.includes('avi')
        ) {
            return (
                <CustText size={12} color={'#AFBAC5'} style={{ marginTop: 4 }}>
                    {'Video'}
                </CustText>
            );
        } else if (!isEmpty(latestMessage?.nameCard)) {
            return (
                <CustText size={12} color={'#AFBAC5'} style={{ marginTop: 4 }}>
                    {'Danh thiếp'}
                </CustText>
            );
        }
    };

    const renderItem = ({ item, index }) => {
        const isGroup = item?.type === 'Group';
        const latestMessage = item?.latestMessage?.message;
        const latestMessageDate = item?.latestMessage?.createdAt;
        const members = item?.members ?? [];
        const totalUnread = item?.settings?.[0]?.unReadMessages;
        const isPin = item?.settings?.[0]?.pinned;
        const isHidden = item?.settings?.[0]?.hiding;

        const closeRow = (index) => {
            if (prevOpenedRow && prevOpenedRow !== row[index]) {
                prevOpenedRow.close();
            }
            prevOpenedRow = row?.[index];
        };

        const renderRightActions = () => {
            return (
                <CustView row centerVertical style={{ paddingHorizontal: 10 }}>
                    {onArchive && (
                        <TouchableOpacity
                            onPress={() => onArchivePress(item?.id, index)}
                            style={styles.btnStyle}
                        >
                            <CustImage
                                source={images.iconDownloadOutline}
                                style={styles.iconSize}
                            />
                        </TouchableOpacity>
                    )}
                    {onPin && (
                        <TouchableOpacity
                            onPress={() => onPinPress(item?.id, index)}
                            style={[styles.btnStyle, { marginHorizontal: 5 }]}
                        >
                            <CustImage source={images.iconPinOutline} style={styles.iconSize} />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={() => onDeletePress(item?.id, index)}
                            style={[styles.btnStyle, { backgroundColor: '#FF8F8F' }]}
                        >
                            <CustImage source={images.iconTrashOutline} style={styles.iconSize} />
                        </TouchableOpacity>
                    )}
                </CustView>
            );
        };

        return isHidden && !isArchive ? (
            <></>
        ) : (
            <Swipeable
                key={item?.id}
                ref={(refSwipe) => (row[index] = refSwipe)}
                onSwipeableOpen={() => closeRow(index)}
                renderRightActions={renderRightActions}
            >
                {isPin && <CustImage source={images.iconPinColor} style={styles.iconPin} />}
                <TouchableOpacity
                    row
                    centerVertical
                    style={styles.itemStyle}
                    onPress={handlePress(item)}
                >
                    <CustView fillHeight row centerVertical>
                        <CustView transparentBg centerVertical>
                            <CustView>{checkAvatar(isGroup, members)}</CustView>
                            {!isEmpty(latestMessage) && (
                                <CustView transparentBg style={styles.leftView}>
                                    <Image
                                        source={images.topRectangle}
                                        style={{ alignSelf: 'center', marginBottom: -4 }}
                                    />
                                    <CustView
                                        style={[
                                            styles.popMessage,
                                            { borderColor: isDarkMode ? '#808080' : '#dcdcdc' },
                                        ]}
                                    >
                                        <CustText size={10} numberOfLines={1}>
                                            {latestMessage}
                                        </CustText>
                                    </CustView>
                                </CustView>
                            )}
                        </CustView>

                        <CustView fillHeight style={{ marginHorizontal: 10 }}>
                            <CustText bold size={15}>
                                {checkGroupName(item)}
                            </CustText>
                            {buildLatestMessage(item)}
                        </CustView>
                        <CustView>
                            {Boolean(totalUnread) && (
                                <CustView center style={styles.newMessageCircle}>
                                    <CustText size={10} bold color={Colors.white}>
                                        {totalUnread}
                                    </CustText>
                                </CustView>
                            )}
                            <CustText size={12} color={'#AFBAC5'} style={styles.dateText}>
                                {!isEmpty(latestMessage)
                                    ? moment(latestMessageDate).fromNow()
                                    : moment(item?.updatedAt).fromNow()}
                            </CustText>
                        </CustView>
                    </CustView>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    return (
        <FlatList
            data={data}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, i) => item?.id}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            initialNumToRender={20}
            getItemLayout={(dataList, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
            })}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={ListFooterComponent}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefreshPage} />}
            renderItem={renderItem}
        />
    );
};

export default ChatList;

const styles = StyleSheet.create({
    itemStyle: {
        height: 80,
        marginHorizontal: 35,
    },
    leftView: {
        bottom: 0,
        position: 'absolute',
    },
    popMessage: {
        height: 20,
        maxWidth: 70,
        borderRadius: 130,
        paddingHorizontal: 6,
        shadowColor: Colors.lightBlue,
        justifyContent: 'center',
        shadowRadius: 4,
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        borderWidth: 1,
        bottom: -4,
    },
    newMessageCircle: {
        height: 17,
        minWidth: 16,
        maxWidth: 24,
        borderRadius: 8,
        alignSelf: 'flex-end',
        backgroundColor: Colors.lightBlue,
    },
    dateText: {
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    iconSize: { height: 24, width: 24 },
    btnStyle: {
        height: 36,
        width: 36,
        borderRadius: 36 / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
    },
    iconPin: { height: 24, width: 24, position: 'absolute', left: 8, top: 32 },
});
