import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CustText } from '../components';
import { isANDROID, touchArea } from '../utils/appUtil';
import { isNil } from 'lodash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { images } from '../../assets';
import { goBack } from '../navigation/navigationUtils';
import { useSelector } from 'react-redux';

const BackHeader = ({ title, style, children, hiddenBack = false, titleStyle = {} }) => {
    const insets = useSafeAreaInsets();
    const onBackPress = () => {
        goBack();
    };
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    return (
        <View style={[styles.container, { marginTop: isANDROID ? insets.top : 0 }, style]}>
            {!isNil(children) ? (
                children
            ) : (
                <View style={styles.row}>
                    {!hiddenBack && (
                        <TouchableOpacity
                            onPress={onBackPress}
                            hitSlop={touchArea}
                            style={styles.btnStyle}
                        >
                            <Image
                                source={images.iconBack}
                                resizeMode="stretch"
                                style={{
                                    width: 21.5,
                                    height: 18,
                                }}
                            />
                        </TouchableOpacity>
                    )}
                    <CustText size={25} bold color={isDarkMode ? 'white' : '#292941'} style={[{ lineHeight: 30 }, titleStyle]}>
                        {title}
                    </CustText>
                </View>
            )}
        </View>
    );
};

export default BackHeader;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        height: 76,
        marginHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnStyle: {
        height: 30,
        marginRight: 16,
        justifyContent: 'center',
    },
});
