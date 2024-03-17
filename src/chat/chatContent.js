import { isEmpty, size } from 'lodash';
import React, { useCallback, memo } from 'react';
import {
    Linking,
    RefreshControl,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { CustText, CustView } from '../components';
import Colors from '../utils/colors';
import Avatar from '../components/Avatar';
import { metrics } from '../utils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { localDate } from '../utils/stringUtil';
import { images } from '../../assets';
import CustImage from '../components/custImage';
import Feather from 'react-native-vector-icons/Feather';
import Video from 'react-native-video';
import Hyperlink from 'react-native-hyperlink';
import moment from 'moment';
import { alertWarning } from '../components/alert';

var expression = new RegExp(
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
);

const ChatContent = ({
    sections,
    refChat,
    listHeaderComponent,
    listFooterComponent,
    userId,
    onEndReached,
    isDarkMode = false,
    onRefreshPage,
    initialNumToRender = 10,
    onDelete,
    onPin,
    onChatContact,
    onMessageClick,
    clickedMessage,
    pinMessage,
    onImagePress,
    onVideoPress,
    isAdmin,
    isGroup,
}) => {
    const checkTextColor = useCallback((isSender) => {
        if (isSender) {
            return Colors.black;
        } else {
            return isDarkMode ? Colors.white : Colors.black;
        }
    }, []);

    const toggleReadState = (itemId) => {
        onMessageClick({ [itemId]: !clickedMessage[itemId] });
    };

    const onDeletePress = (messageId) => {
        onDelete(messageId);
        onMessageClick({});
    };

    const onPinPress = (messageItem) => {
        onPin(messageItem);
        onMessageClick({});
    };

    const onContactChatPress = (item) => {
        onChatContact(item?.nameCard);
    };

    const onPlayVideo = (item) => {
        if (!isEmpty(item?.documentUrls)) {
            onVideoPress(item?.documentUrls);
        } else {
            onVideoPress(item?.imageUrls);
        }
        toggleReadState(item?.id);
    };

    const onMessagePress = (item) => {
        if (item?.deletedAt) {
        } else if (size(item?.imageUrls)) {
            if (
                item?.imageUrls?.[0]?.includes('jpg') ||
                item?.imageUrls?.[0]?.includes('png') ||
                item?.imageUrls?.[0]?.includes('jpeg') ||
                item?.imageUrls?.[0]?.includes('gif')
            ) {
                onImagePress(item?.imageUrls);
            }
            toggleReadState(item?.id);
        } else {
            toggleReadState(item?.id);
        }
    };

    const checkMessageContent = (item, index) => {
        const isSender = item?.sender?.id === userId;
        const phoneNumber = item?.nameCard?.phoneNumber;
        const isPined = pinMessage?.find((i) => i?.id === item?.id);

        if (item?.imageUrls || item?.documentUrls) {
            if (
                item?.imageUrls?.[0]?.includes('video') ||
                item?.imageUrls?.[0]?.includes('mp4') ||
                item?.imageUrls?.[0]?.includes('mov') ||
                item?.imageUrls?.[0]?.includes('wmv') ||
                item?.imageUrls?.[0]?.includes('avi') ||
                item?.imageUrls?.[0]?.includes('flv') ||
                item?.documentUrls?.[0]?.includes('mp4') ||
                item?.documentUrls?.[0]?.includes('mov') ||
                item?.documentUrls?.[0]?.includes('wmv') ||
                item?.documentUrls?.[0]?.includes('avi')
            ) {
                // Render video
                const aspectRatio = 4 / 3;
                const isPortrait = aspectRatio > 1;

                const imageWidth = isPortrait
                    ? metrics.screenWidth * 0.6
                    : metrics.screenWidth * 0.35;

                return (
                    <View style={[styles.row, styles.imageRadius]}>
                        <View
                            style={{
                                height: undefined,
                                aspectRatio: aspectRatio,
                                width: imageWidth,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#000000',
                            }}
                        >
                            {item?.deletedAt && (
                                <CustText
                                    size={12}
                                    style={[
                                        styles.deletedMsg,
                                        {
                                            color: isDarkMode ? 'white' : 'grey',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                        },
                                        { margin: 12 },
                                    ]}
                                >
                                    Tin nhắn đã bị xóa
                                </CustText>
                            )}
                            <Video
                                source={{ uri: item?.imageUrls?.[0] || item?.documentUrls?.[0] }} // Can be a URL or a local file.
                                paused={true}
                                controls={false}
                                style={{
                                    height: undefined,
                                    width: imageWidth,
                                    aspectRatio: aspectRatio,
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => onPlayVideo(item)}
                                style={styles.buttonPlay}
                            >
                                <CustView center style={styles.buttonPlayMask}>
                                    <Feather name={'play'} size={20} color={Colors.black} />
                                </CustView>
                            </TouchableOpacity>
                        </View>
                        {isPined && (
                            <CustView
                                transparentBg
                                style={{
                                    right: -4,
                                    top: -4,
                                    position: 'absolute',
                                    transform: [{ rotate: '30deg' }],
                                }}
                            >
                                <CustImage
                                    source={images.iconPinColor}
                                    style={{
                                        height: 18,
                                        width: 18,
                                    }}
                                />
                            </CustView>
                        )}
                    </View>
                );
            } else {
                // Render Image
                const imageData = item?.imageUrls?.[0];
                const aspectRatio = 4 / 3;
                const isPortrait = aspectRatio > 1;
                const imageWidth = isPortrait
                    ? metrics.screenWidth * 0.6
                    : metrics.screenWidth * 0.35;

                return (
                    <CustView style={styles.imageRadius}>
                        {item?.deletedAt && (
                            <CustText
                                size={12}
                                style={[
                                    styles.deletedMsg,
                                    { color: isDarkMode ? 'white' : 'grey' },
                                    { margin: 12 },
                                ]}
                            >
                                Tin nhắn đã bị xóa
                            </CustText>
                        )}
                        <CustImage
                            resizeMode="cover"
                            source={imageData}
                            style={{
                                height: undefined,
                                aspectRatio: aspectRatio,
                                width: imageWidth,
                            }}
                        />
                        {isPined && (
                            <CustView
                                transparentBg
                                style={{
                                    right: -4,
                                    top: -4,
                                    position: 'absolute',
                                    transform: [{ rotate: '30deg' }],
                                }}
                            >
                                <CustImage
                                    source={images.iconPinColor}
                                    style={{
                                        height: 18,
                                        width: 18,
                                    }}
                                />
                            </CustView>
                        )}
                    </CustView>
                );
            }
        }
        if (item?.nameCard) {
            return (
                <CustView
                    style={[
                        styles.textBasicStyle,
                        {
                            backgroundColor: isSender
                                ? Colors.blue200
                                : isDarkMode
                                ? '#333333'
                                : Colors.white,
                        },
                    ]}
                >
                    {isPined && <CustImage source={images.iconPinColor} style={styles.iconPin} />}
                    {item?.deletedAt && (
                        <CustText
                            size={12}
                            style={[styles.deletedMsg, { color: isDarkMode ? 'white' : 'grey' }]}
                        >
                            Tin nhắn đã bị xóa
                        </CustText>
                    )}
                    <CustView transparentBg>
                        <CustView transparentBg row style={styles.dateContainer}>
                            <CustText bold color={checkTextColor(isSender)} size={15}>
                                Danh Thiếp
                            </CustText>
                            <CustView row transparentBg centerVertical>
                                <CustText size={12} color={Colors.grey} style={{ marginRight: 6 }}>
                                    {localDate(item?.createdAt, 'HH:mm')}
                                </CustText>
                                <Ionicons
                                    name={'checkmark-outline'}
                                    size={12}
                                    color={Colors.grey}
                                />
                            </CustView>
                        </CustView>
                        <CustView style={styles.contactContainer} />
                        <CustView transparentBg row style={styles.contactContent}>
                            <Avatar uri={item?.nameCard?.profile?.avatar} />
                            <CustView fillHeight transparentBg style={styles.avatarContainer}>
                                <CustText bold color={checkTextColor(isSender)}>
                                    {item?.nameCard?.nickname || item?.nameCard?.username}
                                </CustText>
                                {!isEmpty(phoneNumber) && (
                                    <CustText
                                        size={12}
                                        color={Colors.grey}
                                        style={{ marginTop: 5 }}
                                    >
                                        {phoneNumber}
                                    </CustText>
                                )}
                                <TouchableOpacity
                                    onPress={() => onContactChatPress(item)}
                                    style={styles.contactSendButton}
                                >
                                    <CustText size={12} color={Colors.white}>
                                        Nhắn tin
                                    </CustText>
                                </TouchableOpacity>
                            </CustView>
                        </CustView>
                    </CustView>
                </CustView>
            );
        }
        // Render Text
        return (
            <CustView
                style={[
                    styles.textBasicStyle,
                    {
                        backgroundColor: isSender
                            ? Colors.blue200
                            : isDarkMode
                            ? '#333333'
                            : Colors.white,
                    },
                    clickedMessage[item?.id] && { backgroundColor: '#B0DFF2' },
                ]}
            >
                {isPined && <CustImage source={images.iconPinColor} style={styles.iconPin} />}
                {item?.deletedAt && (
                    <CustText
                        size={12}
                        style={[styles.deletedMsg, { color: checkTextColor(isSender) }]}
                    >
                        Tin nhắn đã bị xóa
                    </CustText>
                )}
                <CustView row transparentBg centerVertical fillHeight>
                    <Avatar size={24} uri={item?.sender?.profile?.avatar} />
                    <CustText size={14} color={checkTextColor(isSender)} bold style={styles.title}>
                        {item?.sender?.nickname || item?.sender?.username}
                    </CustText>
                    <CustView row transparentBg centerVertical>
                        <CustText size={12} color={Colors.grey} style={{ marginRight: 6 }}>
                            {item?.status === 'SENDING'
                                ? 'Đang gửi'
                                : localDate(item?.createdAt, 'HH:mm')}
                        </CustText>
                        <Ionicons
                            name={item?.isRead ? 'checkmark-done-outline' : 'checkmark-outline'}
                            size={12}
                            color={Colors.grey}
                        />
                    </CustView>
                </CustView>
                {!isEmpty(item?.message?.match(expression)) ? (
                    <Hyperlink
                        linkStyle={{ color: '#2980b9', textDecorationLine: 'underline' }}
                        onPress={(url, text) => Linking.openURL(url)}
                    >
                        <CustText
                            size={14}
                            color={checkTextColor(isSender)}
                            numberOfLines={null}
                            style={{ marginTop: 9 }}
                        >
                            {item?.message}
                        </CustText>
                    </Hyperlink>
                ) : (
                    <CustText
                        size={14}
                        color={checkTextColor(isSender)}
                        numberOfLines={null}
                        style={{ marginTop: 9 }}
                    >
                        {item?.message}
                    </CustText>
                )}
            </CustView>
        );
    };

    const renderItem = useCallback(
        ({ item, index }) => {
            const isSender = item?.sender?.id === userId;
            return (
                <>
                    <CustView
                        transparentBg
                        style={[
                            styles.messView,
                            {
                                flexDirection: isSender ? 'row-reverse' : 'row',
                                opacity: item?.deletedAt ? 0.5 : 1,
                            },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={() => onMessagePress(item)}>
                            {checkMessageContent(item, index)}
                        </TouchableOpacity>
                    </CustView>
                    {/* Just admin and owner can touch option || personal chat */}
                    {((isAdmin && isGroup) || !isGroup) && clickedMessage[item?.id] && (
                        <CustView
                            center
                            row
                            style={{
                                backgroundColor: 'transparent',
                                position: 'absolute',
                                left: isSender ? metrics.screenWidth * 0.06 : undefined,
                                right: isSender ? undefined : metrics.screenWidth * 0.06,
                                bottom: 0,
                                top: 0,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => onDeletePress(item?.id)}
                                style={styles.circleButton}
                            >
                                <CustImage source={images.iconTrash} style={styles.iconSize} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => onPinPress(item)}
                                style={[styles.circleButton, { marginLeft: 4 }]}
                            >
                                <CustImage source={images.iconPin} style={[styles.iconSize]} />
                            </TouchableOpacity>
                        </CustView>
                    )}
                </>
            );
        },
        [clickedMessage, pinMessage]
    );

    const renderSection = ({ section: { title, index } }) => {
        if (index === 0 && moment().format('DD/MM/YYYY').includes(title)) {
            return <></>;
        }

        return (
            <View style={styles.center}>
                <CustView
                    style={[
                        styles.sectionItem,
                        { backgroundColor: isDarkMode ? '#333333' : 'white' },
                    ]}
                >
                    <CustText style={{ color: isDarkMode ? 'white' : '#333333' }}>{title}</CustText>
                </CustView>
            </View>
        );
    };

    const keyExtractorEx = useCallback((item, index) => item?.id, []);

    return (
        <SectionList
            ref={refChat}
            inverted
            sections={sections}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={renderSection}
            overScrollMode="never"
            onScrollToIndexFailed={() => alertWarning('Vui lòng đợi dữ liệu tải xong để tiếp tục!')}
            keyExtractor={keyExtractorEx}
            initialNumToRender={initialNumToRender}
            updateCellsBatchingPeriod={initialNumToRender}
            maxToRenderPerBatch={initialNumToRender}
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
            removeClippedSubviews
            renderItem={renderItem}
            ListFooterComponent={listFooterComponent}
            ListHeaderComponent={listHeaderComponent}
            refreshControl={
                onRefreshPage && (
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => (onRefreshPage ? onRefreshPage() : {})}
                    />
                )
            }
        />
    );
};

export default memo(ChatContent);

const styles = StyleSheet.create({
    messView: {
        marginHorizontal: 16,
        marginBottom: 10,
        marginRight: 16,
    },
    textHeight: { height: 24 },
    textBasicStyle: {
        paddingTop: 12,
        borderRadius: 20,
        paddingBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: Colors.black,
        width: metrics.screenWidth * 0.67,
    },
    title: {
        flex: 1,
        marginLeft: 4,
    },
    contactContent: { marginTop: 13, marginHorizontal: 2 },
    contactSendButton: {
        height: 22,
        width: 75,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: Colors.lightBlue,
    },
    iconSize: {
        height: 24,
        width: 24,
    },
    circleButton: {
        height: 36,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightBlue,
        borderRadius: 36 / 2,
    },
    avatarContainer: {
        marginLeft: 8,
        justifyContent: 'center',
    },
    contactContainer: {
        height: 1,
        marginTop: 6,
        marginHorizontal: -16,
        backgroundColor: Colors.grey,
    },
    dateContainer: {
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'red',
    },
    deletedMsg: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    viewPlayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    videoFrame: {
        width: '80%',
        height: metrics.screenHeight / 5,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    imageRadius: { borderRadius: 12, overflow: 'hidden' },
    buttonPlay: {
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: Colors.transparent,
    },
    iconPin: {
        height: 18,
        width: 18,
        right: -16,
        top: -16,
        position: 'absolute',
        transform: [{ rotate: '30deg' }],
    },
    buttonPlayMask: {
        height: 36,
        width: 36,
        paddingLeft: 4,
        borderRadius: 18,
        backgroundColor: '#FFFFFF99',
    },
    sectionItem: {
        height: 36,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        alignItems: 'center',
    },
    center: { justifyContent: 'center', alignItems: 'center' },
});
