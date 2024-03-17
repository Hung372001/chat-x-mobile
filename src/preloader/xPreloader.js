import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { isEmpty } from 'lodash';
import 'moment/locale/vi';
import { images } from '../../assets';
import Colors from '../utils/colors';
import { updateLocale } from '../utils/stringUtil';

const XPreloader = ({ navigation }) => {
    const userId = useSelector((state) => state.auth.userId);

    useEffect(() => {
        if (!isEmpty(userId)) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'xHome' }],
            });
        } else {
            const timeOut = setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'xAuthStack' }],
                });
                clearTimeout(timeOut);
            }, 2000);
        }

        updateLocale('vi');
    }, []);

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.white,
            }}
        >
            <Image
                source={images.xLogo}
                resizeMode={'contain'}
                style={{ width: 120, height: 120 }}
            />
        </View>
    );
};

export default XPreloader;
