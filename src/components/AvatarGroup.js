import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { images } from '../../assets';
import Colors from '../utils/colors';
import CustText from './custText';
import CustView from './custView';
import { isUrl } from '../utils';

const AvatarGroup = ({ uri, number = 1, size = 42 }) => {
    const buildAvatarGroup = () => {
        if (number === 2) {
            // Build 2 avatar
            return (
                <>
                    <Image
                        source={isUrl(uri?.[0]) ? { uri: uri?.[0] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.6,
                                width: size * 0.6,
                                position: 'absolute',
                                left: 0,
                                zIndex: 3,
                                top: size * 0.22,
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <Image
                        source={isUrl(uri?.[1]) ? { uri: uri?.[1] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.6,
                                width: size * 0.6,
                                position: 'absolute',
                                right: 0,
                                zIndex: 2,
                                top: size * 0.22,
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                </>
            );
        } else if (number === 3) {
            // Build 3 avatar
            return (
                <>
                    <Image
                        source={isUrl(uri?.[0]) ? { uri: uri?.[0] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                zIndex: 3,
                                left: '25%',
                                bottom: '40%',
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <Image
                        source={isUrl(uri?.[1]) ? { uri: uri?.[1] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                left: 0,
                                zIndex: 2,
                                bottom: '10%',
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <Image
                        source={isUrl(uri?.[2]) ? { uri: uri?.[2] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                right: 0,
                                zIndex: 1,
                                bottom: '10%',
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                </>
            );
        } else {
            // Build more than 3 avatar
            return (
                <>
                    <Image
                        source={isUrl(uri?.[0]) ? { uri: uri?.[0] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 3,
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <Image
                        source={isUrl(uri?.[1]) ? { uri: uri?.[1] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                zIndex: 2,
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <Image
                        source={isUrl(uri?.[2]) ? { uri: uri?.[2] } : images.account}
                        style={[
                            styles.img,
                            {
                                height: size * 0.55,
                                width: size * 0.55,
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                zIndex: 1,
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    />
                    <CustView
                        center
                        style={[
                            styles.img,
                            {
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                zIndex: 3,
                                height: size * 0.55,
                                width: size * 0.55,
                                backgroundColor: 'white',
                                borderWidth: 0.1,
                                borderColor: '#CECECE',
                            },
                        ]}
                    >
                        {Boolean(number) && (
                            <CustText color={Colors.black} size={number > 99 ? 10 : 12}>
                                +{number - 3}
                            </CustText>
                        )}
                    </CustView>
                </>
            );
        }
    };

    return (
        <View style={[styles.imageContainer, { height: size, width: size }]}>
            {buildAvatarGroup()}
        </View>
    );
};

export default AvatarGroup;

const styles = StyleSheet.create({
    imageContainer: {
        borderColor: '#CECECE',
        borderRadius: 24,
    },
    img: {
        borderRadius: 24,
        backgroundColor: '#F7F7F7',
    },
});
