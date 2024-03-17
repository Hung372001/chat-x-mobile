import React, { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { BackHeader, CustBaseView, CustView, SearchBar } from '../components';
import FriendList from '../friendList';
import { metrics } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetSearchQuery } from '../services/chatApi';
import LoadMoreLoading from '../components/loadMoreBottom';
import { navigate } from '../navigation/navigationUtils';
import { size, uniqBy } from 'lodash';

const BUTTON_WIDTH = (metrics.screenWidth - 60) / 2;
const XSearchScreen = () => {
    const [searchValue, setSearchValue] = useState('');
    const [page, setPage] = useState(1);
    const [isMax, setIsMax] = useState(false);
    const insets = useSafeAreaInsets();
    const { data, isFetching, refetch } = useGetSearchQuery({
        searchValue: searchValue,
        page: page,
        type: 'ALL',
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

    const onUserPress = (item) => {
        navigate('xMessageScreen', { item, fromScreen: 'SEARCH' });
    };

    return (
        <CustBaseView isEnableBackground>
            <BackHeader title={'Tìm kiếm'} />
            <CustView
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                {/* Search View */}
                <SearchBar
                    value={searchValue}
                    placeholder={'Tìm kiếm tên tài khoản'}
                    onSubmitEditing={() => {}}
                    containerStyle={styles.searchContainer}
                    onCancelPress={() => setSearchValue('')}
                    onChangeText={(text) => setSearchValue(text)}
                />
                {/* Friend List */}
                <FriendList
                    isDisable
                    isMultiple={false}
                    data={userList}
                    onRefreshPage={onRefreshPage}
                    onEndReached={onEndReached}
                    listFooterComponent={<LoadMoreLoading isLoading={isFetching} isMax={isMax} />}
                    onPress={onUserPress}
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

export default memo(XSearchScreen);

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
