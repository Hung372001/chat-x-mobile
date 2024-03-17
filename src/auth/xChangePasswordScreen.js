import React, { memo, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
    BackHeader,
    CustBaseView,
    CustButton,
    CustText,
    CustTextField,
    CustView,
} from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../utils/colors';
import { Formik } from 'formik';
import { object, ref, string } from 'yup';
import { alertError, alertSuccess } from '../components/alert';
import { useChangePasswordMutation } from '../services/authApi';
import { isEmpty } from 'lodash';
import { goBack } from '../navigation/navigationUtils';

const loginValidation = object().shape({
    oldPassword: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Mật khẩu không được chứa khoảng trắng')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
        .max(20, 'Mật khẩu chỉ tối đa 20 ký tự')
        .required('Vui lòng nhập mật khẩu hiện tại'),
    newPassword: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Mật khẩu không được chứa khoảng trắng')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
        .max(20, 'Mật khẩu chỉ tối đa 20 ký tự')
        .required('Vui lòng nhập mật khẩu mới'),
    confirmPassword: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Mật khẩu không được chứa khoảng trắng')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
        .max(20, 'Mật khẩu chỉ tối đa 20 ký tự')
        .required('Vui lòng xác nhận mật khẩu')
        .oneOf([ref('newPassword'), ''], 'Mật khẩu không trùng khớp'),
});

const XChangePasswordScreen = () => {
    const refForm = useRef();
    const refNewPassword = useRef();
    const refConfirmPassword = useRef();
    const insets = useSafeAreaInsets();
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    const initialValues = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };

    const onChangePasswordPress = (values) => {
        const changePasswordData = {
            oldPassword: values?.oldPassword,
            newPassword: values?.newPassword,
            confirmedNewPassword: values?.newPassword,
        };

        changePassword(changePasswordData)
            .unwrap()
            .then(async (value) => {
                alertSuccess('Thay đổi mật khẩu thành công!');
                goBack();
            })
            .catch((err) => {
                alertError(err?.data?.message || 'Thay đổi mật khẩu thất bại!');
            })
            .finally(() => {});
    };

    return (
        <CustBaseView isEnableBackground>
            {/* Header  */}
            <BackHeader title={'Đổi mật khẩu'} />
            <CustView
                fillHeight
                style={[styles.contentView, { paddingBottom: Boolean(insets.bottom) ? 0 : 12 }]}
            >
                <Formik
                    innerRef={refForm}
                    initialValues={initialValues}
                    validationSchema={loginValidation}
                    validateOnChange={false}
                    onSubmit={onChangePasswordPress}
                >
                    {({ handleChange, handleSubmit, setFieldError, values, touched, errors }) => {
                        return (
                            <>
                                <ScrollView
                                    style={{ flex: 1 }}
                                    showsVerticalScrollIndicator={false}
                                >
                                    {/* Change password content */}
                                    <CustView fillHeight>
                                        <CustTextField
                                            isPassword
                                            placeHolder={''}
                                            value={values.oldPassword}
                                            title={'Mật khẩu hiện tại'}
                                            onSubmitEditingText={() =>
                                                refNewPassword.current?.focus()
                                            }
                                            returnKeyType={'next'}
                                            onChangeText={(text) => {
                                                handleChange('oldPassword')(text),
                                                    setFieldError('oldPassword', '');
                                            }}
                                            textInputContainerStyle={styles.textInputStyle}
                                        />
                                        {!isEmpty(errors?.password) && (
                                            <CustText style={styles.errorMessage}>
                                                {errors?.password}
                                            </CustText>
                                        )}

                                        <CustTextField
                                            isPassword
                                            customRef={refNewPassword}
                                            placeHolder={''}
                                            value={values.newPassword}
                                            title={'Mật khẩu mới'}
                                            onSubmitEditingText={() =>
                                                refConfirmPassword.current?.focus()
                                            }
                                            returnKeyType={'next'}
                                            onChangeText={(text) => {
                                                handleChange('newPassword')(text),
                                                    setFieldError('newPassword', '');
                                            }}
                                            containerStyle={{ marginTop: 30 }}
                                            textInputContainerStyle={styles.textInputStyle}
                                        />
                                        {!isEmpty(errors?.newPassword) && (
                                            <CustText style={styles.errorMessage}>
                                                {errors?.newPassword}
                                            </CustText>
                                        )}

                                        <CustTextField
                                            isPassword
                                            customRef={refConfirmPassword}
                                            placeHolder={''}
                                            value={values.confirmPassword}
                                            title={'Xác nhận mật khẩu'}
                                            onSubmitEditingText={handleSubmit}
                                            onChangeText={(text) => {
                                                handleChange('confirmPassword')(text),
                                                    setFieldError('confirmPassword', '');
                                            }}
                                            containerStyle={{ marginTop: 30 }}
                                            textInputContainerStyle={styles.textInputStyle}
                                        />
                                        {!isEmpty(errors?.confirmPassword) && (
                                            <CustText style={styles.errorMessage}>
                                                {errors?.confirmPassword}
                                            </CustText>
                                        )}
                                    </CustView>
                                </ScrollView>
                                {/* Button View */}
                                <CustView row centerVertical>
                                    <CustButton
                                        title="Cập nhật mật khẩu"
                                        activeOpacity={0.6}
                                        onPress={handleSubmit}
                                        buttonStyle={styles.updateButton}
                                        containerStyle={{ width: '100%' }}
                                    />
                                </CustView>
                            </>
                        );
                    }}
                </Formik>
            </CustView>
        </CustBaseView>
    );
};

export default memo(XChangePasswordScreen);

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        paddingTop: 46,
        paddingHorizontal: 32,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    textInputStyle: {
        height: 45,
        marginTop: 7,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: Colors.grey,
    },
    updateButton: {
        height: 48,
        marginTop: 16,
        marginBottom: 24,
    },
    errorMessage: {
        marginTop: 8,
        color: Colors.red,
    },
});
