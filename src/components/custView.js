import React from "react";
import {StyleSheet, View} from "react-native";
import { useSelector } from 'react-redux';

const CustView = ({
    row = false,
    col = false,
    center = false,
    fillWidth = false,
    fillHeight = false,
    wrap = false,
    leftContent = false,
    bottomContent = false,
    rightContent = false,
    centerHorizontal = false,
    centerVertical = false,
    fillParent = false,
    shrink = false,
    style,
    children,
    transparentBg
}) => {
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    var viewStyle = [
        // make row or col
        row ? {flexDirection: "row"} : {},
        col ? {flexDirection: "column"} : {},
        transparentBg ? {backgroundColor: 'transparent'} : {},

        // fast styles
        center ? styles.center : null,
        wrap ? styles.wrap : null,
        leftContent ? styles.leftContent : null,
        bottomContent ? styles.bottomContent : null,
        rightContent ? styles.rightContent : null,
        centerHorizontal ? styles.centerHorizontal : null,
        centerVertical ? styles.centerVertical : null,
        fillParent ? styles.fillParent : null,
        fillWidth ? styles.fillWidth : null,
        fillHeight ? styles.fillHeight : null,
        shrink ? styles.shrink : null,
    ];

    return <View style={[{backgroundColor: isDarkMode ? '#333333' : 'white'}, ...viewStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    containerRoot: {flex: 1, backgroundColor: "white"},
    wrap: {flexWrap: "wrap"},
    center: {justifyContent: "center", alignItems: "center"},
    bottomContent: {justifyContent: "flex-end"},
    leftContent: {justifyContent: "flex-start"},
    rightContent: {justifyContent: "flex-end"},
    centerHorizontal: {justifyContent: "center"},
    centerVertical: {alignItems: "center"},
    shrink: {flexShrink: 1},
    fillParent: {alignSelf: "stretch", flex: 1, flexShrink: 1},
    fillWidth: {alignSelf: "stretch", flexGrow: 1, flexShrink: 1},
    fillHeight: {flex: 1},
});

export default CustView;
