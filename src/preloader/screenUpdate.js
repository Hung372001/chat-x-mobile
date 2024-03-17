import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { CustView } from '../components';
import CustImage from '../components/custImage';
import Colors from '../utils/colors';
import { metrics } from '../utils';
import { images } from '../../assets';

const ScreenUpdate = ({ process = 0 }) => {
    const _process = process >= 100 ? 100 : process;
    return (
        <CustView style={styles.container}>
            <CustImage
                source={images.update}
                style={{
                    height: undefined,
                    width: metrics.screenWidth * 0.56,
                    aspectRatio: 1.18,
                    marginBottom: 30,
                }}
            />
            <CustView style={styles.progressBar}>
                <Animated.View
                    style={
                        ([StyleSheet?.absoluteFill],
                        {
                            backgroundColor: '#1291D2',
                            // borderRadius: 10,
                            width: `${Math.round(_process)}%`,
                            alignItems: 'center',
                            justifyContent: 'center',
                        })
                    }
                >
                    {_process > 0 ? (
                        <Animated.Text
                            adjustsFontSizeToFit
                            allowFontScaling
                            style={{
                                marginVertical: 2,
                                textAlign: 'center',
                                alignSelf: 'center',
                                color: '#fff',
                                marginHorizontal: 3,
                            }}
                        >
                            {Math.round(_process)}%
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            </CustView>
            <Text mV10>{'Đang cập nhật ...'}</Text>
        </CustView>
    );
};

export default ScreenUpdate;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    title: {
        fontSize: 18,
        lineHeight: 24,
        color: Colors.grey,
    },
    progressBar: {
        height: 20,
        flexDirection: 'row',
        width: '60%',
        backgroundColor: Colors.grey,
        borderColor: '#0002',
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
    },
});
