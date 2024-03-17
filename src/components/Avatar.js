import React from 'react';
import { Image, View } from 'react-native';
import { images } from '../../assets';
import CustImage from './custImage';
import CustView from './custView';
import { isUrl } from '../utils';

const Avatar = ({ uri, size = 50, hideBorder, borderWidth = 0, borderColor = '#CECECE' }) => {
    if (isUrl(uri))
        return (
            <Image
                source={{ uri }}
                resizeMode={'cover'}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size,
                    borderColor: borderColor,
                    backgroundColor: '#F7F7F7',
                    borderWidth: hideBorder ? 0 : borderWidth,
                }}
            />
        );

    return (
        <CustView
            style={{
                borderColor: borderColor,
                borderRadius: 50,
                backgroundColor: '#F7F7F7',
                borderWidth: hideBorder ? 0 : borderWidth,
            }}
        >
            <CustImage
                source={images.account}
                style={{ width: size, height: size, borderRadius: 50 }}
            />
        </CustView>
    );
};

export default Avatar;
