import React, { useState } from 'react';
import {
    View,
    Platform,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { images } from '../../assets';
import CustImage from './custImage';
import CustText from './custText';
import { useSelector } from 'react-redux';

const CustTextField = ({
    customRef,
    title,
    placeHolder,
    value,
    isPassword,
    maxLength,
    editable,
    blurOnSubmit,
    autoFocus,
    isMultiline,
    containerStyle,
    textInputContainerStyle,
    titleStyle,
    textInputStyle,
    keyboardType,
    returnKeyLabel,
    returnKeyType,
    onChangeText,
    onSubmitEditingText,
    onFocus,
    leftIcon,
    rightIcon,
    autoCorrect,
    spellCheck,
}) => {
    const [isShowPassword, setIsShowPassword] = useState(isPassword);
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const changeShowPasswordState = () => {
        setIsShowPassword(!isShowPassword);
    };

    const onChangeTextInput = (text) => {
        onChangeText(text);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {title && <CustText style={titleStyle}>{title}</CustText>}
            <KeyboardAvoidingView
                behavior="padding"
                enabled
                keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}
            >
                <View
                    style={[
                        styles.textInputContainer,
                        { backgroundColor: isDarkMode ? '#B8B8B8' : 'white' },
                        textInputContainerStyle,
                    ]}
                >
                    {leftIcon && (
                        <View style={styles.iconPress}>
                            <CustImage
                                source={leftIcon}
                                style={[styles.icon, { marginLeft: 4, marginRight: 8 }]}
                            />
                        </View>
                    )}
                    <TextInput
                        onFocus={onFocus}
                        autoCorrect={autoCorrect}
                        spellCheck={spellCheck}
                        editable={editable}
                        multiline={isMultiline ? isMultiline : false}
                        keyboardType={keyboardType}
                        placeholderTextColor={'grey'}
                        style={[
                            styles.textInput,
                            { color: isDarkMode ? 'white' : 'black' },
                            textInputStyle,
                        ]}
                        placeholder={placeHolder}
                        secureTextEntry={isShowPassword}
                        maxLength={maxLength}
                        onChangeText={(text) => {
                            onChangeTextInput(text);
                        }}
                        value={value}
                        returnKeyLabel={returnKeyLabel}
                        returnKeyType={returnKeyType}
                        ref={customRef}
                        autoFocus={autoFocus}
                        onSubmitEditing={() => (onSubmitEditingText ? onSubmitEditingText() : {})}
                        blurOnSubmit={blurOnSubmit}
                    />
                    {rightIcon && rightIcon()}
                    {isPassword && (
                        <TouchableOpacity
                            style={styles.iconPress}
                            onPress={changeShowPasswordState}
                        >
                            <CustImage
                                source={
                                    !isShowPassword
                                        ? images.showPasswordEye
                                        : images.hidePasswordEye
                                }
                                style={[styles.icon, { width: 36, height: 36 }]}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default CustTextField;

const styles = StyleSheet.create({
    container: {},
    textInputContainer: {
        flexDirection: 'row',
        height: 48,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderRadius: 10,
        marginTop: 12,
    },
    textInput: {
        flex: 1,
        height: 48,
    },
    iconPress: {
        justifyContent: 'center',
    },
    icon: {
        height: 24,
        width: 24,
        tintColor: 'grey',
    },
});
