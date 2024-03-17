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
import { useGetSearchQuery, useUpdateGroupAdminMutation } from '../services/chatApi';
import { goBack } from '../navigation/navigationUtils';
import { isEmpty, size, filter } from 'lodash';
import { useGetMemberListQuery } from '../services/chatApi';
import { alertError, alertSuccess, alertWarning } from '../components/alert';
import { useSelector } from 'react-redux';
import LoadMoreLoading from '../components/loadMoreBottom';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const XGroupAdminMember = (props) => {
    const refGroupModal = useRef();
    const insets = useSafeAreaInsets();
    const opUpdateAdminList = props.route?.params?.onUpdate;
    const groupItem = props.route?.params?.groupItem;
    const adminList = groupItem?.admins;

    const [updateGroupAdmin, { isLoading }] = useUpdateGroupAdminMutation();

    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [memberList, setMemberList] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(adminList);
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const { data, isFetching, refetch } = useGetSearchQuery(
        {
            searchValue: searchValue,
            page: page,
            type: 'USER',
        },
        { skip: isEmpty(searchValue) }
    );

    const {
        data: memberListData,
        isFetching: isFetchingGetMemberList,
        refetch: refetchMemberList,
    } = useGetMemberListQuery({
        groupId: groupItem?.id,
        page: page,
    });

    useEffect(() => {
        if (!isFetchingGetMemberList) {
            if (page === 1) {
                if (size(memberListData?.items)) {
                    setMemberList([...memberListData?.items]);
                } else {
                    setMemberList([]);
                }
            } else {
                if (size(memberListData?.items)) {
                    setMemberList([...memberList, ...memberListData?.items]);
                }
                // Check isMax
                if (
                    memberListData?.items &&
                    size([...memberList, ...memberListData?.items]) >= groupItem?.memberQty
                ) {
                    setIsMax(true);
                } else {
                    setIsMax(false);
                }
            }
        }
    }, [isFetchingGetMemberList]);

    useEffect(() => {
        if (page === 1) {
            if (size(data?.items)) {
                setMemberList(data?.items);
            } else {
                setMemberList([]);
            }
        } else {
            if (size(data?.items)) {
                setMemberList([...memberList, ...data?.items]);
            }
            // Check isMax
            if (data?.items && size([...memberList, ...data?.items]) >= data?.total) {
                setIsMax(true);
            } else {
                setIsMax(false);
            }
        }
    }, [data]);

    const onSelectedAdminPress = (item) => {
        // Multiple pick
        if (isEmpty(selectedAdmin)) {
            setSelectedAdmin([item]);
        } else {
            // find exist item to remove
            const findExistFriend = selectedAdmin.find((filterItem) => filterItem?.id === item?.id);
            if (!isEmpty(findExistFriend)) {
                const removeExistItem = selectedAdmin.filter(
                    (filterFriend) => filterFriend?.id !== findExistFriend?.id
                );
                setSelectedAdmin(removeExistItem);
            } else {
                setSelectedAdmin([...selectedAdmin, item]);
            }
        }
    };

    useEffect(() => {
        if (!isEmpty(searchValue)) {
            const filterData = filter(
                memberList,
                (memberItem) =>
                    memberItem?.username?.includes(searchValue) ||
                    memberItem?.nickname?.includes(searchValue) ||
                    memberItem?.email?.includes(searchValue)
            );
            setMemberList(filterData);
        } else {
            onRefreshPage();
        }
    }, [searchValue]);

    const onEndReached = () => {
        if (
            !isFetchingGetMemberList &&
            size(memberList) < groupItem?.memberQty &&
            size(memberList) >= 15
        ) {
            setPage((page) => page + 1);
        }
    };

    const onRefreshPage = () => {
        if (page > 1) {
            setPage(1);
            setMemberList([]);
        }
        setIsMax(false);
        refetchMemberList();
    };

    const onSubmitModalPress = () => {
        const listAdminId = selectedAdmin.map((adminItem) => adminItem?.id);
        if (size(listAdminId) == 0) {
            alertWarning('Nhóm phải có ít nhất 1 quản trị viên!');
            return;
        }
        updateGroupAdmin({
            groupId: groupItem?.id,
            admins: listAdminId,
        })
            .unwrap()
            .then(async (value) => {
                opUpdateAdminList({ admins: value?.data?.admins });
                alertSuccess('Cập nhật trưởng nhóm thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Cập nhật trưởng nhóm thất bại!');
            })
            .finally(() => {});
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader title={'Quản trị viên'} />
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
                    <CustText>Thêm vào</CustText>
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
                    listFooterComponent={<LoadMoreLoading isLoading={isFetching} isMax={isMax} />}
                />
                {/* Friend List */}
                <FriendList
                    isMultiple
                    data={memberList}
                    onPress={onSelectedAdminPress}
                    onRefreshPage={onRefreshPage}
                    onEndReached={onEndReached}
                    selected={selectedAdmin}
                />
                {/* Button View */}
                <CustView row centerVertical>
                    <CustButton
                        title="Huỷ"
                        activeOpacity={0.6}
                        onPress={() => goBack()}
                        color={[Colors.white, Colors.white]}
                        textStyle={{ color: Colors.black }}
                        containerStyle={[styles.buttonStyle, { marginRight: 20 }]}
                        buttonStyle={styles.cancelButton}
                    />
                    <CustButton
                        title={'Cập nhật'}
                        activeOpacity={0.6}
                        onPress={onSubmitModalPress}
                        buttonStyle={styles.addFriendButton}
                        containerStyle={styles.buttonStyle}
                    />
                </CustView>
            </CustView>
        </CustBaseView>
    );
};

export default XGroupAdminMember;

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
