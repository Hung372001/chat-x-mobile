import React, { memo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
    BackHeader,
    CustBaseView,
    CustButton,
    CustText,
    CustTextField,
    CustView,
} from '../components';
import { metrics, touchArea } from '../utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/colors';
import Avatar from '../components/Avatar';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Checkbox from '../components/checkBox';
import { useSelector } from 'react-redux';
import ImagePicker from '../components/imagePicker';
import { alertError, alertSuccess } from '../components/alert';
import { useGetProfileMutation, useUpdateUserProfileMutation } from '../services/authApi';
import { dispatch } from '../redux/Store';
import { updateProfile } from '../redux/authSlice';
import { Formik } from 'formik';
import { object, string } from 'yup';
import { isEmpty } from 'lodash';
import { goBack } from '../navigation/navigationUtils';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-simple-toast';

const GENDER_DATA = [
    { id: 1, title: 'Nam', type: 'Male' },
    { id: 2, title: 'Nữ', type: 'Female' },
    { id: 3, title: 'Khác', type: 'Others' },
];

const loginValidation = object().shape({
    name: string()
        .max(50, 'Tên hiển thị chỉ tối đa 50 ký tự')
        .required('Vui lòng nhập Tên hiển thị'),
    phone: string()
        .min(9, 'Số điện thoại phải ít nhất 9 ký tự')
        .max(10, 'Số điện thoại chỉ tối đa 11 ký tự')
        .required('Vui lòng nhập số điện thoại'),
});

const XProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const refForm = useRef();
    const refImagePicker = useRef();
    const userProfile = useSelector((state) => state.auth.userProfile);
    const [getProfile, { isLoading }] = useGetProfileMutation();
    const [updateUserProfile, { isLoading: isLoadingProfile }] = useUpdateUserProfileMutation();

    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const initialValues = {
        name: userProfile?.username || '',
        phone: userProfile?.phoneNumber || '',
        gender: userProfile.profile?.gender || 'Male',
    };

    const onUploadImageSuccess = () => {
        getProfile()
            .unwrap()
            .then(async (value) => {
                dispatch(updateProfile(value?.data));
            })
            .catch((err) => {})
            .finally(() => alertSuccess('Cập nhật ảnh đại diện thành công'));
    };

    const onUpdatePress = (values) => {
        updateUserProfile({
            username: values?.name,
            gender: values?.gender,
            phoneNumber: values?.phone,
        })
            .unwrap()
            .then(async (value) => {
                dispatch(updateProfile(value?.data));
                alertSuccess('Lưu hồ sơ thành công');
                goBack();
            })
            .catch((err) => {
                alertError(err.data?.message || 'Cập nhật thông tin thất bại');
            })
            .finally();
    };

    const buildSpecialTitle = (title) => {
        return (
            <CustText size={15}>
                {title} <CustText color={Colors.lightBlue}>*</CustText>
            </CustText>
        );
    };

    const onPressCopy = () => {
        Clipboard?.setString(refForm?.current?.values?.phone ?? '');
        Toast.showWithGravity('Copy to clipboard', Toast.LONG, Toast.BOTTOM);
    };

    const buildCopyButton = () => {
        return (
            <TouchableOpacity onPress={onPressCopy} hitSlop={touchArea} style={styles.copyButton}>
                <Ionicons
                    size={24}
                    color={isDarkMode ? Colors.white : Colors.grey}
                    name={'copy-outline'}
                />
            </TouchableOpacity>
        );
    };

    return (
        <CustBaseView isEnableBackground>
            {/* Header  */}
            <BackHeader title={'Hồ sơ'} />
            <Formik
                innerRef={refForm}
                initialValues={initialValues}
                validationSchema={loginValidation}
                validateOnChange={false}
                onSubmit={onUpdatePress}
            >
                {({ handleChange, handleSubmit, setFieldError, values, touched, errors }) => {
                    return (
                        <CustView
                            style={[
                                styles.contentView,
                                { paddingBottom: Boolean(insets.bottom) ? 0 : 12 },
                            ]}
                        >
                            <ScrollView
                                style={styles.scrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                <CustView center>
                                    <CustView>
                                        <Avatar
                                            size={metrics.screenWidth * 0.25}
                                            uri={userProfile?.profile?.avatar}
                                        />
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            hitSlop={touchArea}
                                            onPress={() => refImagePicker?.current?.open()}
                                            style={styles.editButton}
                                        >
                                            <CustView center style={styles.editIcon}>
                                                <AntDesign
                                                    name={'edit'}
                                                    size={14}
                                                    color={Colors.white}
                                                />
                                            </CustView>
                                        </TouchableOpacity>
                                    </CustView>
                                </CustView>
                                <CustView>
                                    {/* Point View */}
                                    {/* <CustView row centerVertical>
                            <CustView center style={[styles.pointContainer, { marginRight: 15 }]}>
                                <CustText size={15}>
                                    Điểm hoạt động <CustText color={Colors.lightBlue}>*</CustText>
                                </CustText>
                                <CustText
                                    bold
                                    size={16}
                                    color={Colors.lightBlue}
                                    style={{ marginTop: 7 }}
                                >
                                    100/100
                                </CustText>
                            </CustView>
                            <CustView center style={styles.pointContainer}>
                                <CustText size={15}>
                                    Điểm hoạt động <CustText color={Colors.lightBlue}>*</CustText>
                                </CustText>
                                <CustText
                                    bold
                                    size={16}
                                    color={Colors.lightBlue}
                                    style={{ marginTop: 7 }}
                                >
                                    100/100
                                </CustText>
                            </CustView>
                        </CustView> */}
                                    {/* Name Input*/}
                                    <CustTextField
                                        value={values.name}
                                        title={buildSpecialTitle('Tên hiển thị')}
                                        placeHolder={'Nhập họ và tên'}
                                        onChangeText={(text) => {
                                            handleChange('name')(text);
                                            setFieldError('name', '');
                                        }}
                                        containerStyle={{ marginTop: 33 }}
                                        textInputContainerStyle={styles.textInputContainer}
                                    />
                                    {!isEmpty(errors?.name) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.name}
                                        </CustText>
                                    )}
                                    {/* Phone Input */}
                                    <CustTextField
                                        maxLength={10}
                                        value={values.phone}
                                        title={buildSpecialTitle('Số điện thoại')}
                                        placeHolder={'Nhập số điện thoại'}
                                        containerStyle={{ marginTop: 25 }}
                                        onChangeText={(text) => {
                                            handleChange('phone')(text);
                                            setFieldError('phone', '');
                                        }}
                                        rightIcon={buildCopyButton}
                                        keyboardType={'phone-pad'}
                                        textInputContainerStyle={styles.textInputContainer}
                                    />
                                    {!isEmpty(errors?.phone) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.phone}
                                        </CustText>
                                    )}
                                    {/* Gender */}
                                    <CustView style={{ marginTop: 25 }}>
                                        {buildSpecialTitle('Giới tính')}
                                        <CustView row centerVertical style={styles.genderView}>
                                            {GENDER_DATA.map((genderItem) => {
                                                const isSelected =
                                                    genderItem?.type == values?.gender;
                                                return (
                                                    <TouchableOpacity
                                                        key={genderItem?.id}
                                                        hitSlop={touchArea}
                                                        onPress={() => {
                                                            handleChange('gender')(
                                                                genderItem?.type
                                                            );
                                                        }}
                                                    >
                                                        <CustView row centerVertical>
                                                            <Checkbox
                                                                value={isSelected}
                                                                isMultiple
                                                            />
                                                            <CustText style={{ marginLeft: 10 }}>
                                                                {genderItem?.title}
                                                            </CustText>
                                                        </CustView>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </CustView>
                                    </CustView>
                                    {!isEmpty(errors?.gender) && (
                                        <CustText style={styles.errorMessage}>
                                            {errors?.gender}
                                        </CustText>
                                    )}
                                </CustView>
                                <CustView style={{ height: 80 }} />
                            </ScrollView>
                            {/* Button View */}
                            <CustView row center>
                                <CustButton
                                    title="Cập nhật hồ sơ"
                                    activeOpacity={0.6}
                                    onPress={handleSubmit}
                                    buttonStyle={styles.updateButton}
                                    containerStyle={styles.buttonStyle}
                                />
                            </CustView>
                        </CustView>
                    );
                }}
            </Formik>
            <ImagePicker
                isAvatar
                optionsProps={{ maxWidth: 1024, maxHeight: 1024, quality: 1, mediaType: 'photo' }}
                modalRef={refImagePicker}
                isDarkMode={isDarkMode}
                onUploadSuccess={onUploadImageSuccess}
            />
        </CustBaseView>
    );
};

export default memo(XProfileScreen);

const styles = StyleSheet.create({
    contentView: {
        flex: 1,
        paddingHorizontal: 32,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
    },
    updateButton: {
        width: metrics.screenWidth * 0.85,
    },
    editIcon: {
        height: 26,
        width: 26,
        borderRadius: 13,
        backgroundColor: Colors.lightBlue,
    },
    pointContainer: {
        marginTop: 33,
        borderRadius: 10,
        paddingVertical: 22,
        backgroundColor: Colors.blue200,
        width: (metrics.screenWidth - 79) / 2,
    },
    textInputContainer: {
        height: 45,
        marginTop: 7,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#8A9AA9',
    },
    copyButton: {
        height: 24,
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    genderView: {
        paddingTop: 15,
        justifyContent: 'space-between',
    },
    scrollView: { paddingTop: 25 },
    editButton: { position: 'absolute', bottom: 0, right: 0 },
    errorMessage: {
        marginTop: 8,
        color: Colors.red,
    },
});
