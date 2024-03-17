import React from 'react';
import { StyleSheet, View } from 'react-native';
import { isNil } from 'lodash';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Checkbox = ({
    content = null,
    value = false,
    onChangeValue = (value) => {},
    placeHolder = false,
    disabled,
    containerStyle,
    style,
    isMultiple = false,
}) => {
    return (
        <View
            style={[styles.row, containerStyle]}
            onPress={
                disabled
                    ? undefined
                    : () => {
                          onChangeValue(!value);
                      }
            }
        >
            {value ? (
                <View
                    style={{
                        height: 20,
                        width: 20,
                        borderRadius: 16,
                        backgroundColor: '#2FACE1',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Ionicons name="checkmark-sharp" color={'#FFFFFF'} size={16} />
                </View>
            ) : isMultiple || placeHolder ? (
                <View
                    style={{
                        height: 20,
                        width: 20,
                        borderWidth: 1.5,
                        borderRadius: 16,
                        borderColor: '#8A9AA9',
                    }}
                >
                    <View style={{ height: 20, width: 20 }} />
                </View>
            ) : (
                <></>
            )}

            {!isNil(content) && <View style={{ marginLeft: 8 }}>{content}</View>}
        </View>
    );
};

export default Checkbox;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
