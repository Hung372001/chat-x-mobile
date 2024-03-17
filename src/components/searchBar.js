import React from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { touchArea } from '../utils/appUtil';
import { isEmpty } from 'lodash';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const SearchBar = ({
    placeholder,
    onChangeText,
    onBlur,
    autoFocus,
    keyboardType,
    value,
    placeholderTextColor = '#8A9AA9',
    textStyle,
    onSubmitEditing,
    returnKeyType,
    onFocus,
    inputRef,
    containerStyle,
    onPressIn,
    onPressOut,
    disabled = false,
    onCancelPress,
}) => {
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    return (
        <View style={[styles.row, styles.searchView, containerStyle]}>
            <Ionicons style={{ color: '#8A9AA9' }} name="search-outline" size={24} />
            <TextInput
                pointerEvents={disabled ? 'none' : 'auto'}
                editable={!disabled}
                ref={inputRef}
                onBlur={onBlur}
                autoFocus={autoFocus}
                onFocus={onFocus}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
                maxFontSizeMultiplier={1}
                keyboardType={keyboardType}
                value={value}
                placeholder={placeholder}
                onChangeText={onChangeText}
                placeholderTextColor={placeholderTextColor}
                style={[styles.textInput, { color: isDarkMode ? 'white' : '#292941', }, textStyle]}
                onSubmitEditing={onSubmitEditing}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                returnKeyType={returnKeyType || 'search'}
            />
            {onCancelPress && !isEmpty(value) && (
                <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={touchArea}
                    onPress={() => {
                        onCancelPress && onCancelPress();
                    }}
                >
                    <Ionicons name="close" color={'#8A9AA9'} size={20} />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchView: {
        height: 45,
        paddingHorizontal: 12,
        marginHorizontal: 14,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: '#8A9AA9',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        marginLeft: 10,
        minHeight: 45,
    },
});
