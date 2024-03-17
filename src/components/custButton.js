import React from 'react';
import { View, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { SkypeIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import CustText from './custText';
import { useDebounce } from '../utils/debounce';

const CustButton = ({
    onPress,
    title,
    isLoading,
    isLinkButton,
    containerStyle,
    color,
    textStyle,
    buttonStyle,
    activeOpacity = 1,
    hitSlop = undefined,
    duration = 500,
}) => {
    const { debounce } = useDebounce();
    const buildButton = () => {
        return (
            <LinearGradient
                start={{ x: 0.5, y: -0.5 }}
                end={{ x: 0.5, y: 0.8 }}
                colors={color || ['#47C3ED', '#79D3F2', '#47C3ED', '#1291D2']}
                style={[styles.btnContainer, buttonStyle]}
            >
                <CustText style={[styles.title, textStyle]}>{title}</CustText>
                {isLoading && (
                    <View style={styles.loading}>
                        <SkypeIndicator count={7} size={20} color="#fff" />
                    </View>
                )}
            </LinearGradient>
        );
    };

    const buildLinkButton = () => {
        return <CustText style={[styles.linkTitle, textStyle]}>{title}</CustText>;
    };

    const _onPress = () => {
        debounce(() => {
            onPress();
        }, duration);
    };

    return (
        <TouchableOpacity
            hitSlop={hitSlop}
            onPress={isLoading ? () => {} : _onPress}
            style={containerStyle}
            activeOpacity={activeOpacity}
        >
            {!isLinkButton ? buildButton() : buildLinkButton()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btnContainer: {
        marginTop: 10,
        width: '100%',
        height: 48,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 52,
        flexDirection: 'row',
    },
    title: {
        fontSize: 18,
        color: '#fff',
    },
    loading: { marginLeft: 15 },
    linkTitle: {
        fontStyle: 'italic',
        textDecorationLine: 'underline',
        color: 'grey',
    },
});

export default CustButton;
