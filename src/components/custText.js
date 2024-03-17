import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Colors from '../utils/colors';
import { useSelector } from 'react-redux';

const CustText = ({
    color,
    size,
    align,
    h1,
    h2,
    h3,
    h4,
    bold,
    style,
    children,
    numberOfLines = 1,
}) => {
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    var textStyle = [
        color ? { color: color } : {},
        size ? { fontSize: size } : {},
        align ? { alignSelf: align } : {},
        h1 ? { fontSize: 32 } : {},
        h2 ? { fontSize: 24 } : {},
        h3 ? { fontSize: 16 } : {},
        h4 ? { fontSize: 8 } : {},
        bold ? { fontFamily: 'Montserrat-SemiBold' } : {},
        style,
    ];

    return (
        <Text
            style={[isDarkMode ? styles.defaultTextDarkMode : styles.defaultText, textStyle]}
            numberOfLines={numberOfLines}
        >
            {children ?? '-'}
        </Text>
    );
};

const styles = StyleSheet.create({
    defaultTextDarkMode: {
        color: Colors.white,
        fontFamily: 'Montserrat-Regular',
    },
    defaultText: {
        color: Colors.black,
        fontFamily: 'Montserrat-Regular',
    },
});

export default CustText;
