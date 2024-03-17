import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import CustView from './custView';
import Colors from '../utils/colors';
import CustText from './custText';

const LoadMoreLoading = ({ isLoading, isMax, bottomHeight = 20, title = 'Không còn dữ liệu' }) => {
    const renderHeightOfBottomBar = () => {
        return <View style={{ height: bottomHeight }} />;
    };

    if (isMax) {
        return (
            <CustView center style={styles.maxView}>
                <CustText bold size={12} color={Colors.grey}>
                    {title}
                </CustText>
                {renderHeightOfBottomBar()}
            </CustView>
        );
    } else {
        if (isLoading) {
            return (
                <CustView center style={styles.loadingView}>
                    <ActivityIndicator size="small" color={Colors.black} />
                </CustView>
            );
        } else {
            return <></>;
        }
    }
};

export default LoadMoreLoading;

const styles = StyleSheet.create({
    maxView: { marginTop: 16, marginBottom: 16 },
    loadingView: { marginTop: -12, height: 60 },
});
