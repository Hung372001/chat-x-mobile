import React from "react";
import {
    View,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    ImageBackground,
    StatusBar,
} from "react-native";
import {images} from "../../assets";
import { useSelector } from 'react-redux';

const CustBaseView = ({
    style,
    isEnableBackground,
    backgroundSrc,
    children,
    statusBarColor,
    statusBarStyle,
}) => {
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    return (
        <View style={[styles.container, style]}>
            <StatusBar
                backgroundColor={statusBarColor || "transparent"}
                barStyle={!isDarkMode ? "dark-content" : 'light-content'}
            />
            {!isEnableBackground ? (
                <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
            ) : (
                <ImageBackground
                    resizeMode={"cover"}
                    source={
                        backgroundSrc
                            ? backgroundSrc
                            : (!isDarkMode ? images.xBackground : images.xBackgroundDark)
                    }
                    style={[styles.container, style]}>
                    <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
                </ImageBackground>
            )}
        </View>
    );
};

export default CustBaseView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
