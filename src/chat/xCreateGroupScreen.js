import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import {
    BackHeader,
    ConfirmDialog,
    CustBaseView,
    CustButton,
    CustText,
    CustTextField,
    CustView,
    SearchBar,
} from '../components';
import FriendList from '../friendList';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBack } from '../navigation/navigationUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/colors';
import { debounce, isEmpty, size } from 'lodash';
import { useCreateGroupMutation, useGetGroupQuery, useGetSearchQuery } from '../services/chatApi';
import { alertError, alertSuccess, alertWarning } from '../components/alert';
import LoadMoreLoading from '../components/loadMoreBottom';
import { useSelector } from 'react-redux';
import { useDebounce } from '../utils/debounce';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const XCreateGroupScreen = () => {
    const { debounce } = useDebounce();
    const refGroupModal = useRef();
    const [searchValue, setSearchValue] = useState('');
    const insets = useSafeAreaInsets();
    const refGroupName = useRef('');
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const [selectedUser, setSelectedUser] = useState([]);
    const [errorGroupName, setErrorGroupName] = useState('');
    const [createGroup, { isLoading }] = useCreateGroupMutation();
    const userProfile = useSelector((state) => state.auth.userProfile);
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const { data, isFetching, refetch } = useGetSearchQuery({
        searchValue: searchValue,
        page: page,
        type: 'USER',
    });

    const [userList, setUserList] = useState([]);
    const {
        data: groupData,
        isFetching: isFetchingGroup,
        refetch: refetchGroup,
    } = useGetGroupQuery({
        page: 1,
        filter: 'GROUP',
    });

    useEffect(() => {
        if (page === 1) {
            if (size(data?.items)) {
                setUserList([...data?.items]);
            } else {
                setUserList([]);
            }
        } else {
            if (data?.items?.length) {
                setUserList([...userList, ...data?.items]);
            }
            // Check isMax
            if (data?.items && [...userList, ...data?.items].length >= data?.total) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [data]);

    useEffect(() => {
        setPage(1);
        setIsMax(false);
    }, [searchValue]);

    const onEndReached = () => {
        if (!isFetching && userList?.length < data?.total) {
            setPage((page) => page + 1);
        }
    };

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setUserList([]);
        }
        setIsMax(false);
        refetch();
    };

    const onSelectUserPress = (item) => {
        // Multiple pick
        if (isEmpty(selectedUser)) {
            setSelectedUser([item]);
        } else {
            // find exist item to remove
            const findExistFriend = selectedUser.find((filterItem) => filterItem?.id === item?.id);
            if (!isEmpty(findExistFriend)) {
                const removeExistItem = selectedUser.filter(
                    (filterFriend) => filterFriend?.id !== findExistFriend?.id
                );
                setSelectedUser(removeExistItem);
            } else {
                setSelectedUser([...selectedUser, item]);
            }
        }
    };

    const onOpenCreateGroupModalPress = (title) => {
        debounce(() => {
            if (!isEmpty(selectedUser)) {
                refGroupModal.current?.toggle({
                    onOK: () =>
                        debounce(() => {
                            onCreateGroupPress();
                        }, 1500),
                });
            } else {
                alertWarning('Vui lòng chọn ít nhất 1 thành viên!');
            }
        }, 1500);
    };

    const onCreateGroupPress = () => {
        if (isEmpty(refGroupName?.current)) {
            setErrorGroupName('Vui lòng nhập tên nhóm');
            return;
        }

        const data = {
            name: refGroupName?.current,
            members: [userProfile?.id, ...selectedUser.map((userItem) => userItem?.id)],
            type: 'Group',
        };
        createGroup(data)
            .unwrap()
            .then(async (value) => {
                refetchGroup();
                alertSuccess('Tạo nhóm thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Tạo nhóm thất bại!');
            })
            .finally(() => {
                refGroupModal.current?.hide();
            });
    };

    return (
        <CustBaseView isEnableBackground>
            {/* Modal create group */}
            <ConfirmDialog
                ref={refGroupModal}
                showCancelBtn
                showOKBtn
                onOK={() => {}}
                submitText={'Tạo nhóm'}
                isDarkMode={isDarkMode}
            >
                <CustView>
                    <CustView centerVertical>
                        <CustText size={22} bold style={{ marginTop: 4 }}>
                            Đặt tên nhóm
                        </CustText>
                    </CustView>
                    <CustTextField
                        placeHolder={'Tên nhóm'}
                        onChangeText={(text) => {
                            (refGroupName.current = text),
                                !isEmpty(errorGroupName) && setErrorGroupName('');
                        }}
                        containerStyle={styles.inputContainer}
                        textInputContainerStyle={styles.textInputContainerStyle}
                    />
                    {!isEmpty(errorGroupName) && (
                        <CustText style={styles.errorMessage}>{errorGroupName}</CustText>
                    )}
                    <TouchableOpacity
                        style={styles.closeModalButton}
                        onPress={() => refGroupModal.current?.hide()}
                    >
                        <Ionicons name="close" color={Colors.grey} size={24} />
                    </TouchableOpacity>
                </CustView>
            </ConfirmDialog>
            {/* Header  */}
            <BackHeader title={'Tạo nhóm'} />
            <CustView
                fillHeight
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                {/* Search View */}
                <SearchBar
                    value={searchValue}
                    placeholder={'Tên người dùng'}
                    onSubmitEditing={() => {}}
                    containerStyle={styles.searchBarContainer}
                    onCancelPress={() => setSearchValue('')}
                    onChangeText={(text) => setSearchValue(text)}
                />
                {/* Friend List */}
                <FriendList
                    isMultiple
                    data={userList}
                    onPress={(item) => onSelectUserPress(item)}
                    onRefreshPage={onRefreshPage}
                    onEndReached={onEndReached}
                    listFooterComponent={<LoadMoreLoading isLoading={isFetching} isMax={isMax} />}
                />
                {/* Button View */}
                <CustView row centerVertical>
                    <CustButton
                        title="Huỷ"
                        activeOpacity={0.6}
                        onPress={() => goBack()}
                        color={!isDarkMode ? [Colors.white, Colors.white] : ['#333333', '#333333']}
                        textStyle={{ color: !isDarkMode ? Colors.black : Colors.white }}
                        containerStyle={[styles.buttonStyle, { marginRight: 20 }]}
                        buttonStyle={styles.cancelButton}
                    />
                    <CustButton
                        title="Tạo nhóm"
                        activeOpacity={0.6}
                        onPress={onOpenCreateGroupModalPress}
                        buttonStyle={styles.createGroupButton}
                        containerStyle={styles.buttonStyle}
                    />
                </CustView>
            </CustView>
        </CustBaseView>
    );
};

export default memo(XCreateGroupScreen);

const styles = StyleSheet.create({
    contentView: {
        paddingTop: 30,
        paddingHorizontal: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    centeredView: {
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        padding: 35,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        backgroundColor: 'white',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    cancelButton: {
        height: 48,
        borderWidth: 2,
        marginTop: 16,
        marginRight: 20,
        borderColor: Colors.lightBlue,
    },
    buttonStyle: {
        width: BUTTON_WIDTH,
    },
    createGroupButton: {
        height: 48,
        marginTop: 16,
    },
    searchBarContainer: {
        marginBottom: 12,
    },
    textInputContainerStyle: {
        marginTop: 0,
    },
    closeModalButton: {
        top: 0,
        right: 0,
        position: 'absolute',
    },
    inputContainer: {
        paddingRight: 1,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.grey,
        marginVertical: 40,
    },
    errorMessage: {
        marginTop: -32,
        marginBottom: 15,
        color: Colors.red,
    },
});
