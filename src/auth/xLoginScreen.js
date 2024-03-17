import React, { memo, useRef, useState, useEffect } from 'react';
import { CustBaseView, CustButton, CustText, CustTextField, CustView } from '../components';
import { StatusBar, Text } from 'react-native';
import CustImage from '../components/custImage';
import { images } from '../../assets';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SkypeIndicator } from 'react-native-indicators';
import { Formik } from 'formik';
import { object, string } from 'yup';
import { isEmpty } from 'lodash';
import { validateNumber, validateEmail } from '../utils/stringUtil';
import { updateLogin, updateProfile } from '../redux/authSlice';
import Colors from '../utils/colors';
import { useGetProfileMutation, useLoginMutation } from '../services/authApi';
import { alertError, alertWarning } from '../components/alert';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import messaging from '@react-native-firebase/messaging';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getCurrentAppVersion, isANDROID, isIOS, touchArea } from '../utils';
import { useDebounce } from '../utils/debounce';
import { useAddFCMTokenMutation } from '../services/notificationApi';

const loginValidation = object().shape({
    username: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Email / Số điện thoại không được chứa khoảng trắng')
        .min(9, 'Email / Số điện thoại phải ít nhất 9 ký tự')
        .max(50, 'Email chỉ tối đa 50 ký tự')
        .required('Vui lòng nhập Email / Số điện thoại'),
    password: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Mật khẩu không được chứa khoảng trắng')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
        .max(20, 'Mật khẩu chỉ tối đa 20 ký tự')
        .required('Vui lòng nhập mật khẩu'),
});

const XLoginScreen = ({ navigation }) => {
    const refForm = useRef();
    const refPassword = useRef();
    const dispatch = useDispatch();
    const { debounce } = useDebounce();

    const [loader, setLoader] = useState(false);
    const [getProfile, { isLoading }] = useGetProfileMutation();
    const [toggleCheckBox, setToggleCheckBox] = useState(false);
    const isDarkMode = useSelector((state) => state?.setting?.isDarkMode);
    const [addFCMToken] = useAddFCMTokenMutation();
    const [login] = useLoginMutation();

    const initialValues = {
        username: '',
        password: '',
    };

    // TODO: Refactor code AsyncStorage
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('login-info');
            if (value !== null) {
                return value;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const storeData = async (value) => {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem('login-info', jsonValue);
        } catch (e) {
            console.log('error save login info', e);
        }
    };

    const getLoginInfo = async () => {
        const loginInfo = await getData();
        const dataParse = JSON.parse(loginInfo);
        if (!_.isEmpty(dataParse)) {
            const usernameParse = dataParse.username;
            const passwordParse = dataParse?.password;
            refForm?.current?.setFieldValue('username', usernameParse);
            refForm?.current?.setFieldValue('password', passwordParse);
            setToggleCheckBox(true);
        }
    };

    useEffect(() => {
        getLoginInfo();
    }, []);

    const onPressSignUp = () => {
        navigation.navigate('xSignUpScreen');
    };

    const onForgotPasswordPress = () => {
        alertWarning('Vui lòng liên hệ admin để đặt lại mật khẩu !', 'Thông báo');
    };

    const onPressSignIn = (values) => {
        // Check email format
        if (!validateNumber(values.username)) {
            if (!validateEmail(values.username)) {
                refForm.current?.setFieldError('username', 'Vui lòng nhập đúng định dạng Email');
                return;
            }
        }
        setLoader(true);
        // Check email or phone data
        const loginData = { password: values?.password };
        if (validateNumber(values?.username)) {
            loginData['phoneNumber'] = values?.username;
        } else {
            loginData['email'] = values?.username.toLowerCase();
        }

        if (toggleCheckBox) {
            storeData({
                username: refForm?.current?.values?.username,
                password: refForm?.current?.values?.password,
            });
        } else {
            storeData({});
        }

        login(loginData)
            .unwrap()
            .then(async (response) => {
                if (response?.data) {
                    dispatch(
                        updateLogin({
                            userId: response?.requestId,
                            token: response.data?.accessToken,
                            refreshToken: response.data?.refreshToken,
                        })
                    );
                    dispatch(updateProfile(response?.data));
                    setLoader(false);
                    const token = await messaging().getToken();
                    addFCMToken({
                        deviceToken: token,
                        deviceType: isANDROID ? 'ANDROID' : 'IOS',
                    })
                        .unwrap()
                        .then(() => {})
                        .catch((err) => {
                            console.log('Add FCM token error =>', err?.data?.message);
                        });
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'xHome' }],
                    });
                } else {
                    setLoader(false);
                    alertError('Vui lòng kiểm tra Email / Số điện thoại và mật khẩu!');
                }
            })
            .catch((err) => {
                alertError(err?.data?.message ?? 'Có lỗi xảy ra, Vui lòng thử lại sau!');
                setLoader(false);
            })
            .finally(() => {});
    };

    return (
        <CustBaseView isEnableBackground>
            <StatusBar
                translucent={true}
                backgroundColor={'transparent'}
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            />
            <Formik
                innerRef={refForm}
                initialValues={initialValues}
                validationSchema={loginValidation}
                validateOnChange={false}
                onSubmit={onPressSignIn}
            >
                {({ handleChange, handleSubmit, setFieldError, values, touched, errors }) => {
                    return (
                        <ScrollView>
                            <View style={styles.container}>
                                <CustImage source={images.xLogo} style={styles.logo} />
                                <View>
                                    <CustText
                                        h2
                                        bold
                                        align={'center'}
                                        style={styles.largeMarginVertical}
                                    >
                                        WELCOME!
                                    </CustText>
                                    <CustTextField
                                        autoCorrect={false}
                                        spellCheck={false}
                                        value={values.username}
                                        leftIcon={images.mail}
                                        title={'Email / Số điện thoại'}
                                        placeHolder={'Email / Số điện thoại'}
                                        onSubmitEditingText={() => refPassword.current?.focus()}
                                        returnKeyType={'next'}
                                        onChangeText={(text) => {
                                            handleChange('username')(text);
                                            setFieldError('username', '');
                                        }}
                                    />
                                    {!isEmpty(errors?.username) && (
                                        <CustText numberOfLines={2} style={styles.errorMessage}>
                                            {errors?.username}
                                        </CustText>
                                    )}
                                    <CustTextField
                                        isPassword
                                        customRef={refPassword}
                                        value={values.password}
                                        title={'Mật khẩu'}
                                        placeHolder={'Mật khẩu'}
                                        leftIcon={images.lock}
                                        containerStyle={styles.password}
                                        onSubmitEditingText={handleSubmit}
                                        onChangeText={(text) => {
                                            handleChange('password')(text),
                                                setFieldError('password', '');
                                        }}
                                    />
                                    {!isEmpty(errors?.password) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.password}
                                        </CustText>
                                    )}
                                    <CustView row style={styles.savePassSection} transparentBg>
                                        <CustView transparentBg row centerVertical>
                                            <CheckBox
                                                disabled={false}
                                                value={toggleCheckBox}
                                                onValueChange={(newValue) =>
                                                    setToggleCheckBox(newValue)
                                                }
                                                style={styles.checkBox}
                                                tintColors={{ true: '#47C3ED', false: 'grey' }}
                                            />
                                            <CustText>Ghi nhớ đăng nhập</CustText>
                                        </CustView>
                                        <CustButton
                                            title="Quên mật khẩu"
                                            isLinkButton
                                            hitSlop={touchArea}
                                            onPress={() => debounce(onForgotPasswordPress, 5000)}
                                        />
                                    </CustView>
                                </View>
                                <CustButton
                                    title={
                                        loader ? (
                                            <SkypeIndicator count={7} size={20} color="#fff" />
                                        ) : (
                                            'Đăng nhập'
                                        )
                                    }
                                    containerStyle={styles.largeMarginVertical}
                                    onPress={handleSubmit}
                                />
                                <CustView row center transparentBg>
                                    <CustView transparentBg>
                                        <CustText>Bạn chưa có tài khoản? </CustText>
                                    </CustView>
                                    <CustButton
                                        title="Đăng ký"
                                        isLinkButton
                                        hitSlop={touchArea}
                                        onPress={onPressSignUp}
                                    />
                                </CustView>
                            </View>
                        </ScrollView>
                    );
                }}
            </Formik>
            {isIOS && <Text style={styles.versionText}>{getCurrentAppVersion()}</Text>}
        </CustBaseView>
    );
};

export default memo(XLoginScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 32,
        marginTop: '20%',
    },
    logo: {
        width: 72,
        height: 72,
        alignSelf: 'center',
    },
    largeMarginVertical: {
        marginVertical: 48,
    },
    savePassSection: {
        justifyContent: 'space-between',
        marginTop: 16,
    },
    password: { marginTop: 16 },
    errorMessage: {
        marginTop: 8,
        color: Colors.red,
    },
    checkBox: {
        height: 24,
        width: 24,
        marginRight: 8,
    },
    versionText: { position: 'absolute', right: 16, bottom: 12, color: '#DEDEDE' },
});
