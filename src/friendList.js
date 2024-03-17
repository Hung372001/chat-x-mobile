import React, { useState } from 'react';
import { TouchableOpacity, FlatList, StyleSheet, RefreshControl } from 'react-native';

import Avatar from './components/Avatar';
import Checkbox from './components/checkBox';
import { CustText, CustView } from './components';
import { isEmpty, size } from 'lodash';
import { useSelector } from 'react-redux';
import AvatarGroup from './components/AvatarGroup';

const FriendList = ({
    data,
    isMultiple = false,
    isDisable = false,
    extraData,
    onPress,
    onEndReached,
    onRefreshPage,
    listFooterComponent,
    selected,
    placeHolder,
}) => {
    const userProfile = useSelector((state) => state.auth.userProfile);
    const [selectedFriend, setSelectedFriend] = useState(selected || []);

    const onSelectFriendPress = (item) => {
        if (isDisable) {
            return;
        }
        if (isMultiple) {
            // Multiple pick
            if (isEmpty(selectedFriend)) {
                setSelectedFriend([item]);
            } else {
                // find exist item to remove
                const findExistFriend = selectedFriend.find(
                    (filterItem) => filterItem?.id === item?.id
                );
                if (!isEmpty(findExistFriend)) {
                    const removeExistItem = selectedFriend.filter(
                        (filterFriend) => filterFriend?.id !== findExistFriend?.id
                    );
                    setSelectedFriend(removeExistItem);
                } else {
                    setSelectedFriend([...selectedFriend, item]);
                }
            }
        } else {
            // Single pick
            setSelectedFriend([item]);
        }
    };

    const checkName = (item) => {
        if (!isEmpty(item?.type)) {
            if (item?.name) {
                return item?.name;
            } else {
                const findFriend = item?.members?.find(
                    (memberItem) => memberItem?.id !== userProfile?.id
                );
                return findFriend?.nickname || findFriend?.username;
            }
        } else {
            return item?.nickname || item?.username || item?.name;
        }
    };

    const checkAvatar = (item) => {
        if (item?.type === 'Group') {
            let avatarList = item?.members.map((memberItem) => memberItem?.profile?.avatar);
            return <AvatarGroup uri={avatarList} size={50} number={size(item?.members)} />;
        } else {
            let avatarItem = item?.profile?.avatar;
            return <Avatar uri={avatarItem} />;
        }
    };

    const renderItem = (item, index) => {
        const isFirstItem = index == 0;

        const filterSelectedFriend = selectedFriend?.filter((filterFriend) => {
            return item?.id === filterFriend?.id;
        });
        const isSelected = filterSelectedFriend?.length > 0;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    onSelectFriendPress(item), onPress(item);
                }}
            >
                <CustView
                    row
                    centerVertical
                    style={[styles.itemStyle, { marginTop: isFirstItem ? 12 : 0 }]}
                >
                    <CustView row centerVertical fillHeight>
                        {checkAvatar(item)}
                        <CustView style={{ marginLeft: 10 }}>
                            <CustText size={15} bold>
                                {checkName(item)}
                            </CustText>
                        </CustView>
                    </CustView>
                    <CustView>
                        <Checkbox
                            value={isSelected}
                            isMultiple={isMultiple}
                            placeHolder={placeHolder}
                        />
                    </CustView>
                </CustView>
            </TouchableOpacity>
        );
    };

    return (
        <FlatList
            data={data}
            extraData={extraData}
            showsVerticalScrollIndicator={false}
            keyExtractor={(x, i) => i.toString()}
            onEndReached={() => (onEndReached ? onEndReached() : {})}
            onEndReachedThreshold={0.1}
            initialNumToRender={15}
            ListFooterComponent={listFooterComponent}
            refreshControl={
                <RefreshControl
                    refreshing={false}
                    onRefresh={() => onRefreshPage && onRefreshPage()}
                />
            }
            renderItem={({ item, index }) => renderItem(item, index)}
        />
    );
};

export default FriendList;

const styles = StyleSheet.create({
    itemStyle: {
        height: 80,
        paddingHorizontal: 15,
    },
});
