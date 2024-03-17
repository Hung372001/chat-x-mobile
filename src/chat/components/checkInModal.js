import React, {useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import Modal from "react-native-modal";
import {CustText, CustView, CustButton} from "../../components";
import CustImage from "../../components/custImage";
import {images} from "../../../assets";
import {Calendar} from "react-native-calendars";
import moment from "moment";
import {useSelector} from "react-redux";
import {
    useGetRollCallMutation,
    usePutRollCallMutation,
} from "../../services/authApi";
import {SkypeIndicator} from "react-native-indicators";
import Colors from "../../utils/colors";
import _ from "lodash"

function CheckInModal({isShowModal = false}) {
    const [showModal, setShowModal] = useState(isShowModal);
    const [rollCallList, setRollCallList] = useState([]);
    const isDarkMode = useSelector((state) => state.setting.isDarkMode);

    const [getRollCall, {isLoading: isLoadingGetRollCall}] = useGetRollCallMutation();
    const [putRollCall, {isLoading: isLoadingPutRollCall}] = usePutRollCallMutation();

    useEffect(() => {
        putRollCall()
            .unwrap()
            .then(() => {
                setShowModal(true);

                getRollCall()
                    .unwrap()
                    .then(async (value) => {
                        const listCheckInItems = value.data.items;
                        const formatDateList = listCheckInItems.map((item) => {
                            return {
                                [`${moment(item).format("YYYY-MM-DD")}`]: {
                                    marked: true,
                                },
                            };
                        });
                        setRollCallList(formatDateList);
                    })
                    .catch((err) => {})
                    .finally(() => {});
            })
            .catch((err) => {
                if (err) {
                    setShowModal(false);
                }
            })
            .finally(() => {});
    }, []);

    const data = rollCallList.reduce((accumulator, current) => {
        return {...accumulator, ...current};
    }, {});

    const BuildDayComponents = ({date, state, marking}) => {
        const today = moment().format("YYYY-MM-DD");
        const dateString = date.dateString;

        const textStyle = {
            color:
                state === "disabled"
                    ? "gray"
                    : dateString === today
                    ? "#1291D2"
                    : "black",
            fontWeight: dateString === today ? "bold" : "normal",
        };

        const todayTimestamp = moment(today);
        const dateTimestamp = moment(dateString);
        const isPastDay = todayTimestamp > dateTimestamp;

        return (
            <CustView
                center
                fillWidth
                style={[
                    styles.dayContainer,
                    // bg color dark mode
                    {backgroundColor: isDarkMode ? "#AFBAC5" : "#EEEEEE"},
                    // bg past day
                    isPastDay && {backgroundColor: "#9F9F9F"},
                ]}>
                {marking?.marked && (
                    <CustView center style={styles.check}>
                        <CustImage source={images.check} />
                    </CustView>
                )}
                <CustText
                    center
                    style={[textStyle, isPastDay && {color: "black"}]}>
                    {date.day}
                </CustText>
            </CustView>
        );
    };

    return (
        <View>
            <Modal
                isVisible={showModal}
                style={styles.modal}
                statusBarTranslucent
                onBackdropPress={() => {}}
                onBackButtonPress={() => {}}>
                <CustView style={[styles.container]}>
                    <CustView row transparentBg>
                        <CustView fillWidth transparentBg />
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <CustImage style={styles.x} source={images.x} />
                        </TouchableOpacity>
                    </CustView>
                    <CustView center>
                        <CustText bold h2 center numberOfLines={1}>
                            Bảng điểm danh
                        </CustText>
                        <CustText bold h2 center numberOfLines={1}>
                            hằng ngày
                        </CustText>
                    </CustView>
                    <CustView style={styles.calendarContainer}>
                        {!isLoadingGetRollCall ? (
                            <Calendar
                                hideArrows
                                disableMonthChange
                                markingType={"custom"}
                                customHeaderTitle={<View></View>}
                                maxDate={moment().format("YYYY-MM-DD")}
                                theme={{
                                    calendarBackground: isDarkMode
                                        ? "#333333"
                                        : "white",
                                }}
                                style={{
                                    backgroundColor: isDarkMode
                                        ? "#333333"
                                        : "white",
                                }}
                                markedDates={data}
                                dayComponent={BuildDayComponents}
                            />
                        ) : (
                            <View style={{marginVertical: 52}}>
                                <SkypeIndicator
                                    count={7}
                                    size={20}
                                    color={Colors.lightBlue}
                                />
                            </View>
                        )}
                    </CustView>
                    <CustView style={styles.btn}>
                        <CustButton
                            title="Xác nhận"
                            onPress={() => setShowModal(false)}
                        />
                    </CustView>
                </CustView>
            </Modal>
        </View>
    );
}

export const styles = StyleSheet.create({
    modal: {
        justifyContent: "flex-end",
        margin: 0,
    },
    container: {
        padding: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    x: {
        width: 32,
        height: 32,
        padding: 12,
        margin: 12,
    },
    btn: {
        margin: 12,
        marginHorizontal: 32,
    },
    calendarContainer: {
        margin: 12,
        marginHorizontal: 32,
    },
    dayContainer: {
        marginHorizontal: "12%",
        paddingVertical: "12%",
        borderRadius: 4,
    },
    check: {
        borderRadius: 4,
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        backgroundColor: "#2FACE1",
    },
});

export default CheckInModal;
