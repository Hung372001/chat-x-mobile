import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
    BackHeader,
    ConfirmDialog,
    CustBaseView,
    CustButton,
    CustText,
    CustView,
    SearchBar,
} from '../components';
import FriendList from '../friendList';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../utils/colors';
import {
    useAddToGroupMutation,
    useGetMemberListQuery,
    useGetSearchQuery,
    useRemoveFromGroupMutation,
} from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';
import { goBack } from '../navigation/navigationUtils';
import { isEmpty, size } from 'lodash';
import { replaceToEng } from '../utils/stringUtil';
import { alertError, alertSuccess } from '../components/alert';
import { useSelector } from 'react-redux';
import { useSocket } from '../utils/socketIO';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const XGroupMemberScreen = (props) => {
    const refGroupModal = useRef();
    const item = props.route?.params;
    const member = item?.member;
    const socket = useSocket();
    const [removeFromGroup, { isLoading }] = useRemoveFromGroupMutation();
    const [addToGroup, { isLoading: isLoadingAdd }] = useAddToGroupMutation();

    const isAdd = item.type === 'ADD'; // ADD TO GROUP | REMOVE FROM GROUP
    const isRemove = item.type === 'REMOVE';
    const isShare = item.type === 'SHARE';

    const isAdmin = item?.data?.isAdmin;
    const isOwner = item?.data?.isOwner;

    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const insets = useSafeAreaInsets();
    const { data, isFetching, refetch } = useGetSearchQuery(
        {
            searchValue: searchValue,
            page: page,
            type: 'USER',
        },
        { skip: isRemove && isEmpty(searchValue) }
    );

    const {
        data: memberListData,
        isFetching: isFetchingGetMemberList,
        refetch: refetchMemberList,
    } = useGetMemberListQuery(
        {
            groupId: item?.data?.id,
            page: page,
        },
        { skip: !isRemove }
    );

    const [userList, setUserList] = useState(!isAdd ? member : []);
    const [selectedUser, setSelectedUser] = useState([]);
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    useEffect(() => {
        if (page === 1) {
            if (size(data?.items)) {
                setUserList(data?.items);
            } else {
                setUserList([]);
            }
        } else {
            if (size(data?.items)) {
                setUserList([...userList, ...data?.items]);
            }
            // Check isMax
            if (data?.items && size([...userList, ...data?.items]) >= data?.total) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [data]);

    useEffect(() => {
        if (!isFetchingGetMemberList) {
            if (page === 1) {
                if (size(memberListData?.items)) {
                    setUserList([...memberListData?.items]);
                } else {
                    setUserList([]);
                }
            } else {
                if (size(memberListData?.items)) {
                    setUserList([...userList, ...memberListData?.items]);
                }
                // Check isMax
                if (
                    memberListData?.items &&
                    size([...userList, ...memberListData?.items]) >= item?.data?.memberQty
                ) {
                    setIsMax(true);
                } else {
                    setIsMax(false);
                }
            }
        }
    }, [isFetchingGetMemberList]);

    useEffect(() => {
        if (isEmpty(searchValue)) {
            onRefreshPage();
        }
    }, [searchValue]);

    const onEndReached = () => {
        if (isRemove) {
            if (
                !isFetchingGetMemberList &&
                size(userList) < item?.data?.memberQty &&
                size(userList) >= 15
            ) {
                setPage((page) => page + 1);
            }
        } else {
            if (!isFetching && size(userList) < data?.total && size(userList) >= 15) {
                setPage((page) => page + 1);
            }
        }
    };

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setUserList([]);
        }
        setIsMax(false);
        if (isRemove) {
            refetchMemberList();
        } else {
            refetch();
        }
    };

    const onSelectUserPress = (item) => {
        if (isShare) {
            setSelectedUser([item]);
        } else {
            // Multiple pick
            if (isEmpty(selectedUser)) {
                setSelectedUser([item]);
            } else {
                // find exist item to remove
                const findExistFriend = selectedUser.find(
                    (filterItem) => filterItem?.id === item?.id
                );
                if (!isEmpty(findExistFriend)) {
                    const removeExistItem = selectedUser.filter(
                        (filterFriend) => filterFriend?.id !== findExistFriend?.id
                    );
                    setSelectedUser(removeExistItem);
                } else {
                    setSelectedUser([...selectedUser, item]);
                }
            }
        }
    };

    const onSubmitModalPress = () => {
        if (isAdd) {
            if (!isEmpty(selectedUser)) {
                refGroupModal.current?.toggle({
                    onOK: () => onAddToGroupPress(),
                });
            } else {
                alertWarning('Vui lòng chọn ít nhất 1 thành viên để thêm!');
            }
        } else if (isShare) {
            const roomId = item?.data?.id;
            const cardId = selectedUser?.[0]?.id;
            if (!isEmpty(item?.data?.type)) {
                socket.emit('onSendMessage', {
                    groupId: roomId,
                    nameCardUserId: cardId,
                });
            } else {
                socket.emit('onSendConversationMessage', {
                    receiverId: roomId,
                    nameCardUserId: cardId,
                });
            }
            goBack();
        } else {
            if (!isEmpty(selectedUser)) {
                refGroupModal.current?.toggle({
                    onOK: () => onRemoveFromGroupPress(),
                });
            } else {
                alertWarning('Vui lòng chọn ít nhất 1 thành viên để xoá!');
            }
        }
    };

    const onAddToGroupPress = () => {
        const selectedUserId = selectedUser.map((userItem) => userItem?.id);
        const data = { groupId: item.data?.id, members: selectedUserId };

        addToGroup(data)
            .unwrap()
            .then(async (value) => {
                alertSuccess('Thêm vào nhóm thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Thêm vào nhóm thất bại!');
            })
            .finally(() => {
                refGroupModal.current?.hide();
            });
    };

    const onRemoveFromGroupPress = () => {
        const selectedUserId = selectedUser.map((userItem) => userItem?.id);
        const data = { groupId: item.data?.id, members: selectedUserId };

        removeFromGroup(data)
            .unwrap()
            .then(async (value) => {
                alertSuccess('Xoá khỏi nhóm thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Xoá khỏi nhóm thất bại!');
            })
            .finally(() => {
                refGroupModal.current?.hide();
            });
    };

    const renderText = () => {
        if (isAdd) {
            return { title: 'Thêm thành viên', submitText: 'Thêm vào' };
        } else if (isShare) {
            return { title: 'Chọn danh thiếp', submitText: 'Gửi' };
        } else {
            return { title: 'Thành viên nhóm ', submitText: 'Xoá khỏi nhóm' };
        }
    };

    const checkIsListDisable = () => {
        if (isShare) {
            return false;
        } else {
            if (!isAdmin && !isOwner) {
                return true;
            } else {
                return false;
            }
        }
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader title={renderText().title} />

            <ConfirmDialog
                ref={refGroupModal}
                showCancelBtn
                showOKBtn
                isDarkMode={isDarkMode}
                title={`Thông báo`}
                onOK={() => {}}
                submitText={'Đồng ý'}
            >
                <CustView style={{ marginBottom: 32, marginTop: 8 }}>
                    <CustText numberOfLines={3}>
                        {isAdd
                            ? `Bạn muốn thêm ${selectedUser?.length} thành viên mới vào nhóm?`
                            : `Bạn muốn xoá ${selectedUser?.length} thành viên khỏi nhóm?`}
                    </CustText>
                </CustView>
            </ConfirmDialog>

            <CustView
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                {/* Search View */}
                <SearchBar
                    value={searchValue}
                    placeholder={'Tìm kiếm user name'}
                    onSubmitEditing={() => {}}
                    containerStyle={styles.searchContainer}
                    onCancelPress={() => setSearchValue('')}
                    onChangeText={(text) => setSearchValue(text)}
                />
                {/* Friend List */}
                <FriendList
                    isDisable={checkIsListDisable()}
                    isMultiple={!isShare && (isAdmin || isOwner)}
                    data={userList}
                    onPress={(item) => onSelectUserPress(item)}
                    onRefreshPage={onRefreshPage}
                    onEndReached={onEndReached}
                    listFooterComponent={<LoadMoreLoading isLoading={isFetching} isMax={isMax} />}
                />
                {/* Button View */}
                {(isAdmin || isOwner || isShare) && (
                    <CustView row centerVertical>
                        <CustButton
                            title="Huỷ"
                            activeOpacity={0.6}
                            onPress={goBack}
                            color={[Colors.white, Colors.white]}
                            textStyle={{ color: Colors.black }}
                            containerStyle={[styles.buttonStyle, { marginRight: 20 }]}
                            buttonStyle={styles.cancelButton}
                        />
                        <CustButton
                            title={renderText().submitText}
                            activeOpacity={0.6}
                            onPress={onSubmitModalPress}
                            buttonStyle={styles.addFriendButton}
                            containerStyle={styles.buttonStyle}
                        />
                    </CustView>
                )}
            </CustView>
        </CustBaseView>
    );
};

export default XGroupMemberScreen;

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        paddingTop: 30,
        paddingHorizontal: 20,
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
