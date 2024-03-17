import { isFunction } from 'lodash';
import React, { forwardRef, useCallback, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import { metrics } from '../utils';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../utils/colors';

const ConfirmDialog = forwardRef(
    (
        {
            children,
            isVisible,
            title,
            submitText = 'Đồng ý',
            cancelText = 'Huỷ',
            hideOnOK,
            onOK = ({ data }) => {},
            onClose,
            onCancel,
            onBackdropPress,
            showCancelBtn,
            showOKBtn,
            useExternalVisibility,
            submitBtnStyle,
            isDarkMode = false,
        },
        ref
    ) => {
        const [data, setData] = useState({});
        const refCallbacks = useRef({});
        const [_isVisible, setVisible] = useState(false);

        //Toggle modal visibility
        const toggle = useCallback((callbacks) => {
            refCallbacks.current = callbacks;
            setVisible(!isVisible);
        }, []);

        const hide = useCallback(() => {
            setVisible(false);
        }, []);

        const show = useCallback((callbacks) => {
            refCallbacks.current = callbacks;
            setVisible(true);
        }, []);

        const open = useCallback((callbacks) => {
            refCallbacks.current = callbacks;
            setVisible(true);
        }, []);

        const close = useCallback(() => {
            setVisible(false);
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                // toggle
                toggle: (callbacks) => {
                    toggle(callbacks);
                },
                //show
                show: (callbacks) => {
                    show(callbacks);
                },
                //open
                open: (callbacks) => {
                    open(callbacks);
                },
                // close
                close: () => {
                    close();
                },
                // hide
                hide: () => {
                    hide();
                },
            }),
            []
        );

        const onHideBackdrop = () => {
            hide();
            onBackdropPress && onBackdropPress();
        };

        const visible = useExternalVisibility ? isVisible : _isVisible;

        if (!visible) return null;
        return (
            <KeyboardAvoidingView>
                <Modal
                    animationIn="fadeIn"
                    animationOut="fadeOut"
                    statusBarTranslucent
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    deviceHeight={metrics.screenHeight + 80}
                    useNativeDriver
                    isVisible={visible}
                    onBackdropPress={onHideBackdrop}
                >
                    <View
                        style={[
                            styles.basicModal,
                            { backgroundColor: isDarkMode ? Colors.dark : Colors.white },
                        ]}
                    >
                        <View>
                            {title && (
                                <Text
                                    style={[
                                        styles.title,
                                        { color: isDarkMode ? Colors.white : Colors.dark },
                                    ]}
                                >
                                    {title}
                                </Text>
                            )}
                            {isFunction(children) ? children({ data }) : children}
                        </View>
                        <View style={styles.btnView}>
                            {showCancelBtn && (
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        hide && hide();
                                        onCancel && onCancel();
                                    }}
                                    style={styles.btnCancelStyle}
                                >
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            alignSelf: 'center',
                                            color: isDarkMode ? Colors.white : Colors.dark,
                                        }}
                                    >
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {showOKBtn && (
                                <TouchableOpacity
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        if (hideOnOK) hide();
                                        onOK({ data });
                                        refCallbacks?.current?.onOK &&
                                            refCallbacks?.current?.onOK();
                                    }}
                                    style={[
                                        {
                                            width: showCancelBtn ? '45%' : '100%',
                                        },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['#47C3ED', '#79D3F2', '#47C3ED', '#1291D2']}
                                        style={[styles.btnOkStyle, submitBtnStyle]}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                color: '#FFFFFF',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            {submitText}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        );
    }
);
export const styles = StyleSheet.create({
    blurModal: {
        backgroundColor: 'transparent',
        borderRadius: 8,
        paddingVertical: 28,
        paddingHorizontal: 20,
        minHeight: 20,
    },
    basicModal: {
        minHeight: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 24,
        paddingHorizontal: 24,
        marginHorizontal: 10,
    },
    icClose: {
        fontSize: 30,
        color: '#ffffff',
    },
    title: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: 'bold',
        color: '#333333',
    },
    itemCard: {
        padding: 8,
        marginBottom: 8,
    },
    btnView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnOkStyle: {
        height: 48,
        width: '100%',
        justifyContent: 'center',
        borderRadius: 24,
        alignItems: 'center',
    },
    btnCancelStyle: {
        borderRadius: 24,
        width: '45%',
        height: 48,
        borderWidth: 2,
        borderColor: '#2FACE1',
        justifyContent: 'center',
        marginRight: '4%',
    },
});

export default ConfirmDialog;
