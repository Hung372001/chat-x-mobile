import React, { useRef, useState, memo } from 'react';
import { CustBaseView, CustButton, CustText, CustTextField, CustView } from '../components';
import CustImage from '../components/custImage';
import { images } from '../../assets';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import { boolean, object, string } from 'yup';
import { isEmpty } from 'lodash';
import axios from 'axios';
import { validateEmail, validateNumber } from '../utils/stringUtil';
import { SkypeIndicator } from 'react-native-indicators';
import Colors from '../utils/colors';
import { alertError } from '../components/alert';
import messaging from '@react-native-firebase/messaging';
import { updateLogin, updateProfile } from '../redux/authSlice';
import { useGetProfileMutation } from '../services/authApi';
import { useAddFCMTokenMutation } from '../services/notificationApi';
import { dispatch } from '../redux/Store';
import { isANDROID, metrics, touchArea } from '../utils';
import CheckBox from '@react-native-community/checkbox';
import { Text } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { config } from '../services/globalConfig';

const signUpValidation = object().shape({
    username: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Email / Số điện thoại không được chứa khoảng trắng')
        .min(9, 'Email / Số điện thoại phải ít nhất 9 ký tự')
        .max(50, 'Email / Số điện thoại chỉ tối đa 50 ký tự')
        .required('Vui lòng nhập Email / Số điện thoại'),
    password: string()
        .matches(/^\S$|^\S[\s\S]*\S$/, 'Mật khẩu không được chứa khoảng trắng')
        .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
        .max(20, 'Mật khẩu chỉ tối đa 20 ký tự')
        .required('Vui lòng nhập mật khẩu'),
    name: string()
        .min(1, 'Tên phải ít nhất 1 ký tự')
        .max(50, 'Tên chỉ tối đa 50 ký tự')
        .required('Vui lòng nhập tên hiển thị'),
    check: boolean().oneOf([true], 'Vui lòng đồng ý điều khoản để tiếp tục'),
});

const XSignUpScreen = ({ navigation }) => {
    const refForm = useRef();
    const refPassword = useRef();
    const refName = useRef();
    const refTermModal = useRef();
    const [loader, setLoader] = useState(false);
    const [getProfile, { isLoading }] = useGetProfileMutation();
    const [addFCMToken] = useAddFCMTokenMutation();
    const isDarkMode = useSelector((state) => state?.setting?.isDarkMode);

    const initialValues = {
        username: '',
        password: '',
        name: '',
        check: false,
    };

    const onPressSignIn = () => {
        navigation.goBack();
    };

    const onPressSignUp = (values) => {
        // Check email format
        if (!validateNumber(values.username)) {
            if (!validateEmail(values.username)) {
                refForm.current?.setFieldError('username', 'Vui lòng nhập đúng định dạng Email!');
                return;
            }
        }

        setLoader(true);
        // Check email or phone data
        const signUpData = { username: values?.name, password: values?.password };
        if (validateNumber(values?.username)) {
            signUpData['phoneNumber'] = values?.username;
        } else {
            signUpData['email'] = values?.username.toLowerCase();
        }

        axios
            .post(config.baseUrl + '/auth/sign-up', signUpData)
            .then(async (response) => {
                if (response.data?.success) {
                    if (response.data?.success) {
                        dispatch(
                            updateLogin({
                                userId: response.data?.requestId,
                                token: response.data?.data?.accessToken,
                                refreshToken: response.data?.data?.refreshToken,
                            })
                        );
                        dispatch(updateProfile(response?.data?.data));
                        setLoader(false);
                        // Get User Profile
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
                } else {
                    setLoader(false);
                    alertError('Vui lòng kiểm tra Email / Số điện thoại và mật khẩu');
                }
            })
            .catch((error) => {
                alertError(
                    error?.response?.data?.message ?? 'Có lỗi xảy ra, Vui lòng thử lại sau!'
                );
                setLoader(false);
            });
    };

    const onTermPress = () => {
        refTermModal?.current?.open();
    };

    const onCloseModalPress = () => {
        refTermModal?.current?.close();
    };

    return (
        <CustBaseView isEnableBackground>
            <Formik
                innerRef={refForm}
                initialValues={initialValues}
                validationSchema={signUpValidation}
                validateOnChange={false}
                onSubmit={onPressSignUp}
            >
                {({
                    handleChange,
                    handleSubmit,
                    setFieldValue,
                    setFieldError,
                    values,
                    touched,
                    errors,
                }) => {
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
                                        Tạo tài khoản!
                                    </CustText>
                                    <CustTextField
                                        value={values.username}
                                        leftIcon={images.mail}
                                        title={'Email / Số điện thoại'}
                                        placeHolder={'Email / Số điện thoại'}
                                        onSubmitEditingText={() => refPassword.current?.focus()}
                                        returnKeyType={'next'}
                                        onChangeText={(text) => {
                                            setFieldValue('username', text);
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
                                        onSubmitEditingText={() => refName.current?.focus()}
                                        returnKeyType={'next'}
                                        onChangeText={(text) => {
                                            setFieldValue('password', text);
                                            setFieldError('password', '');
                                        }}
                                    />
                                    {!isEmpty(errors?.password) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.password}
                                        </CustText>
                                    )}
                                    <CustTextField
                                        customRef={refName}
                                        value={values.name}
                                        title={'Tên hiển thị'}
                                        placeHolder={'Tên hiển thị'}
                                        leftIcon={images.iconUser}
                                        containerStyle={styles.password}
                                        onSubmitEditingText={() => handleSubmit()}
                                        onChangeText={(text) => {
                                            handleChange('name')(text), setFieldError('name', '');
                                        }}
                                    />
                                    {!isEmpty(errors?.name) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.name}
                                        </CustText>
                                    )}
                                </View>
                                <CustView
                                    row
                                    style={styles.checkBoxView}
                                    centerVertical
                                    transparentBg
                                    fillWidth
                                >
                                    <CheckBox
                                        disabled={false}
                                        value={values.check}
                                        onValueChange={(newValue) => {
                                            setFieldValue('check', newValue);
                                            setFieldError('check', '');
                                        }}
                                        style={styles.checkBox}
                                        tintColors={{ true: '#47C3ED', false: 'grey' }}
                                    />
                                    <CustView row transparentBg style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.row,
                                                { color: isDarkMode ? Colors.white : Colors.black },
                                            ]}
                                        >
                                            Tôi đã đọc và đồng ý với
                                            <Text style={styles.linkStyle} onPress={onTermPress}>
                                                {' '}
                                                Điều khoản sử dụng của Mailisa
                                            </Text>
                                        </Text>
                                    </CustView>
                                </CustView>
                                {!isEmpty(errors?.check) && (
                                    <CustText style={styles.errorMessage}>{errors?.check}</CustText>
                                )}
                                <CustButton
                                    title={
                                        loader ? (
                                            <SkypeIndicator count={7} size={20} color="#fff" />
                                        ) : (
                                            'Đăng ký'
                                        )
                                    }
                                    containerStyle={styles.largeMarginVertical}
                                    onPress={handleSubmit}
                                />
                                <CustView row center transparentBg>
                                    <CustView transparentBg>
                                        <CustText>Bạn đã có tài khoản? </CustText>
                                    </CustView>
                                    <CustButton
                                        title="Đăng nhập"
                                        isLinkButton
                                        hitSlop={touchArea}
                                        onPress={onPressSignIn}
                                    />
                                </CustView>
                            </View>
                        </ScrollView>
                    );
                }}
            </Formik>
            <RBSheet
                ref={refTermModal}
                height={metrics.screenHeight * 0.75}
                duration={250}
                customStyles={{
                    container: {
                        paddingHorizontal: 23,
                        borderTopEndRadius: 16,
                        borderTopStartRadius: 16,
                        backgroundColor: isDarkMode ? Colors.dark : Colors.white,
                    },
                }}
            >
                <CustView transparentBg center>
                    <CustView center style={{ height: 58 }}>
                        <CustText size={16} bold>
                            {'Điều khoản sử dụng'}
                        </CustText>
                    </CustView>
                    <TouchableOpacity onPress={onCloseModalPress} style={styles.closeButton}>
                        <Ionicons name={'close-circle-outline'} size={24} color={Colors.black} />
                    </TouchableOpacity>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ height: '100%' }}>
                        <CustText style={styles.contentTitle} bold>
                            Định nghĩa thông tin cá nhân
                        </CustText>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Là bất kì thông tin nào bạn cung cấp cho chúng tôi khi đăng ký, bao gồm tên tài khoản, giới tính và khoảng tuổi.'
                            }
                        </Text>
                        <CustText
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                            bold
                        >
                            Thu thập thông tin cá nhân
                        </CustText>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Chúng tôi không thu thập thông tin cá nhân của người dùng, ngoại trừ những thông tin bạn cung cấp khi đăng ký tài khoản.'
                            }
                        </Text>
                        <CustText style={styles.contentTitle} bold>
                            Mục đích và giới hạn sử dụng thông tin cá nhân
                        </CustText>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Chúng tôi sử dụng thông tin cá nhân nhằm quản lý người dùng và để cung cấp dịch vụ tốt hơn. Chúng tôi không tiết lộ thông tin cho bên thứ ba.'
                            }
                        </Text>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Thông tin bạn chia sẻ với người dùng khác Mailisa hoạt động dựa trên tiêu chí đảm bảo người dùng là ẩn danh, không ai biết bạn là ai trừ khi bạn nói ra.'
                            }
                        </Text>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Để đảm bảo thông tin cá nhân được bảo vệ, bạn được khuyến nghị không chia sẻ thông tin số điện thoại, tài khoản Facebook, địa chỉ email cho người lạ khi sử dụng ứng dụng này.'
                            }
                        </Text>
                        <CustText style={styles.contentTitle} bold>
                            Xóa tài khoản Để xóa tài khoản
                        </CustText>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Hãy truy cập vào ứng dụng chọn Cài đặt Xóa tài khoản rồi làm theo hướng dẫn. Toàn bộ thông tin của bạn sẽ được xóa khỏi hệ thống của Mailisa khi hoàn tất việc xóa tài khoản.'
                            }
                        </Text>
                        <CustText style={styles.contentTitle} bold>
                            Chúng tôi xây dựng phương pháp kiểm duyệt nội dung dựa trên bốn trụ cột:
                        </CustText>
                        <Text
                            style={[
                                styles.contentLine,
                                { color: isDarkMode ? Colors.white : Colors.black },
                            ]}
                        >
                            {
                                'Xóa nội dung vi phạm các tiêu chuẩn của chúng tôi khỏi nền tảng. Giới hạn độ tuổi xem nội dung dành cho người trưởng thành để chỉ người dùng (từ 18 tuổi trở lên mới được xem) Duy trì các tiêu chuẩn về tính đủ điều kiện cho trang Dành cho bạn (For You Feed – FYF) để đảm bảo rằng mọi nội dung được quảng bá trên hệ thống đề xuất của chúng tôi đều phù hợp với đối tượng đại chúng Trao quyền lựa chọn cho cộng đồng thông qua việc cung cấp thông tin, công cụ và tài nguyên.'
                            }
                        </Text>
                        <CustView style={{ height: metrics.screenHeight * 0.15 }} />
                    </ScrollView>
                </CustView>
            </RBSheet>
        </CustBaseView>
    );
};

export default memo(XSignUpScreen);

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
    checkBoxView: {
        marginTop: 16,
        // width: '100%',
    },
    checkBox: {
        height: 24,
        width: 24,
        marginRight: 8,
    },
    linkStyle: {
        color: Colors.lightBlue,
        textDecorationLine: 'underline',
    },
    contentLine: {
        lineHeight: 17,
        marginTop: 8,
        textAlign: 'justify',
    },
    contentTitle: { marginTop: 12, marginBottom: -4 },
    closeButton: { position: 'absolute', top: 16, right: 0 },
    row: {
        justifyContent: 'center',
        flexDirection: 'row',
    },
});
