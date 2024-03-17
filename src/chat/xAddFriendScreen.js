import React, { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BackHeader, CustBaseView, CustButton, CustView, SearchBar } from '../components';
import FriendList from '../friendList';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBack } from '../navigation/navigationUtils';
import Colors from '../utils/colors';
import { isEmpty, size } from 'lodash';
import { alertError, alertSuccess, alertWarning } from '../components/alert';
import { useAddFriendMutation, useGetSearchQuery } from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const XAddFriendScreen = () => {
    const insets = useSafeAreaInsets();
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const isActiveButton = !isEmpty(selectedUser);
    const [addFriend, { isLoading }] = useAddFriendMutation();
    const { data, isFetching, refetch } = useGetSearchQuery({
        searchValue: searchValue,
        page: page,
        type: 'USER',
    });
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        if (page === 1) {
            if (size(data?.items)) {
                setUserList([...data?.items]);
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

    const onAddFriendPress = () => {
        if (!isActiveButton) {
            alertWarning('Vui lòng chọn thành viên');
            return;
        }
        addFriend(selectedUser?.id)
            .unwrap()
            .then(async (value) => {
                alertSuccess('Gửi lời mời kết bạn thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Gửi lời mời kết bạn thất bại!');
            })
            .finally(() => {});
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader title={'Thêm bạn'} />
            <CustView
                fillHeight
                style={[
                    styles.contentView,
                    {
                        paddingBottom: Boolean(insets.bottom) ? 0 : 12,
                    },
                ]}
            >
                {/* Search View */}
                <SearchBar
                    value={searchValue}
                    placeholder={'Email / Số điện thoại'}
                    onSubmitEditing={() => {}}
                    containerStyle={styles.searchBarContainer}
                    onCancelPress={() => setSearchValue('')}
                    onChangeText={(text) => setSearchValue(text)}
                />
                {/* Friend List */}
                <FriendList
                    data={userList}
                    isMultiple={false}
                    onPress={(item) => setSelectedUser(item)}
                    onRefreshPage={onRefreshPage}
                    onEndReached={onEndReached}
                    placeHolder={true}
                    listFooterComponent={<LoadMoreLoading isLoading={isFetching} isMax={isMax} />}
                />
                {/* Button View */}
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
                        title="Kết bạn"
                        activeOpacity={0.6}
                        duration={1000}
                        onPress={onAddFriendPress}
                        buttonStyle={styles.addFriendButton}
                        containerStyle={styles.buttonStyle}
                    />
                </CustView>
            </CustView>
        </CustBaseView>
    );
};

export default memo(XAddFriendScreen);

const styles = StyleSheet.create({
    contentView: {
        paddingTop: 30,
        paddingHorizontal: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    cancelButton: {
        height: 48,
        borderWidth: 2,
        marginTop: 16,
        borderColor: Colors.lightBlue,
    },
    addFriendButton: {
        height: 48,
        marginTop: 16,
    },
    searchBarContainer: {
        marginBottom: 12,
    },
    buttonStyle: {
        width: BUTTON_WIDTH,
    },
});
