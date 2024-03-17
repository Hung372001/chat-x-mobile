import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Avatar from '../../components/Avatar';
import Colors from '../../utils/colors';
import { images } from '../../../assets';
import { CustText, CustView } from '../../components';
import { useSelector } from 'react-redux';

const ListContact = (props) => {
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    return (
        <CustView style={styles.container}>
            <View style={styles.avatarSection}>
                <View style={{ alignItems: 'center' }}>
                    <Avatar uri={props.item?.profile?.avatar} />
                    {props.item?.lastMessage && (
                        <View style={styles.avatar}>
                            <Image source={images.topRectangle} style={{ alignSelf: 'center' }} />
                            <View style={styles.avatarText}>
                                <CustText size={10}>{props.item?.lastMessage}</CustText>
                            </View>
                        </View>
                    )}
                </View>
                <View style={{ marginLeft: 10 }}>
                    <CustText size={15} color={isDarkMode ? 'white' : '#292941'} bold>
                        {props.item?.nickname || props.item?.username}
                    </CustText>
                    {props.item?.lastMessage && (
                        <CustText size={12} style={{ marginTop: 4 }}>
                            {props.item?.lastMessage}
                        </CustText>
                    )}
                </View>
            </View>
            <CustView>
                {Boolean(props.item?.newMessage) && (
                    <CustView style={styles.newMessage}>
                        <CustText style={styles.newMessageText}>{props.item?.newMessage}</CustText>
                    </CustView>
                )}
                {Boolean(props.item?.newMessage) && (
                    <CustText
                        style={[styles.newMessageDate, { color: isDarkMode ? 'white' : '#AFBAC5' }]}
                    >
                        {props.item?.date}
                    </CustText>
                )}
            </CustView>
        </CustView>
    );
};

export default ListContact;

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
        alignSelf: 'flex-end',
    },
});
