import React, { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BackHeader, CustBaseView, CustView } from '../components';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    useArchiveGroupChatMutation,
    useDeleteGroupChatMutation,
    useGetArchiveMessageQuery,
    usePinGroupChatMutation,
} from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';
import { goBack, navigate } from '../navigation/navigationUtils';
import ChatList from './chatList';
import { useSelector } from 'react-redux';
import { isEmpty, size } from 'lodash';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const LIMIT = 30;
const XArchiveScreen = () => {
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const insets = useSafeAreaInsets();
    const userProfile = useSelector((state) => state.auth.userProfile);
    const {
        data: groupChatData,
        refetch,
        isLoading,
    } = useGetArchiveMessageQuery({
        page: page,
        limit: LIMIT,
    });
    const [chatList, setChatList] = useState([]);
    const [pinGroupChat, { isLoading: isLoadingPin }] = usePinGroupChatMutation();
    const [deleteGroupChat, { isLoading: isLoadingDelete }] = useDeleteGroupChatMutation();
    const [archiveGroupChat, { isLoading: isLoadingArchive }] = useArchiveGroupChatMutation();

    useEffect(() => {
        if (page === 1 && groupChatData?.items?.length) {
            setChatList([...groupChatData?.items]);
        } else {
            if (!isEmpty(groupChatData?.items)) {
                setChatList([...chatList, ...groupChatData?.items]);
            }
            // Check isMax
            if (size(groupChatData?.items) > 20 && size(chatList) >= groupChatData?.total) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [groupChatData]);

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setChatList([]);
        }
        setIsMax(false);
        refetch();
    };

    const onPinGroupPress = (groupId) => {
        pinGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                onRefreshPage();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Gim hội thoại thất bại!');
            })
            .finally(() => {});
    };
    const onDeleteGroupPress = (groupId) => {
        deleteGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                onRefreshPage();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Xoá hội thoại thất bại!');
            })
            .finally(() => {});
    };
    const onArchiveGroupPress = (groupId) => {
        archiveGroupChat({ groupId })
            .unwrap()
            .then(async (value) => {
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Lưu trữ hội thoại thất bại!');
            })
            .finally(() => {});
    };

    const onEndReached = () => {
        if (!isLoading && size(chatList) < groupChatData?.total) {
            setPage((page) => page + 1);
        }
    };

    const onChatItemPress = (chatItem) => {
        navigate('xMessageScreen', {
            type: chatItem?.type === 'Dou' ? 'PERSONAL' : 'GROUP',
            item: chatItem,
        });
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader title={'Lưu trữ'} />
            <CustView
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                {/* Search View */}
                {/* <SearchBar
                    value={searchValue}
                    placeholder={'Tìm kiếm user name'}
                    onSubmitEditing={() => {}}
                    containerStyle={styles.searchContainer}
                    onCancelPress={() => setSearchValue('')}
                    onChangeText={(text) => setSearchValue(text)}
                /> */}
                {/* Friend List */}
                <ChatList
                    userId={userProfile?.id}
                    onEndReached={onEndReached}
                    onItemPress={onChatItemPress}
                    onRefreshPage={onRefreshPage}
                    // onDelete={onDeleteGroupPress}
                    // onPin={onPinGroupPress}
                    onArchive={onArchiveGroupPress}
                    data={chatList}
                    isArchive={true}
                    ListFooterComponent={<LoadMoreLoading isLoading={isLoading} isMax={isMax} />}
                />
                {/* Button View */}
                {/* <CustView row centerVertical >
                    <CustButton
                        title="Huỷ"
                        activeOpacity={0.6}
                        onPress={() => goBack()}
                        textStyle={{ color: Colors.black }}
                        color={[Colors.white, Colors.white]}
                        containerStyle={styles.buttonStyle}
                        buttonStyle={styles.cancelButton}
                    />
                    <CustButton
                        title="Kết bạn"
                        activeOpacity={0.6}
                        buttonStyle={styles.addFriendButton}
                        containerStyle={styles.buttonStyle}
                    />
                </CustView> */}
            </CustView>
        </CustBaseView>
    );
};

export default memo(XArchiveScreen);

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        paddingTop: 30,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    searchContainer: {
        marginBottom: 12,
    },
    cancelButton: {
        marginRight: 20,
        height: 48,
        borderWidth: 2,
        borderColor: '#2FACE1',
        marginTop: 16,
    },
    buttonStyle: {
        width: BUTTON_WIDTH,
    },
    addFriendButton: {
        height: 48,
        marginTop: 16,
    },
});
