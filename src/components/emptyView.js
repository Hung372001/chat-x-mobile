import { isEmpty } from 'lodash';
import React from 'react';
import { StyleSheet } from 'react-native';
import { metrics } from '../utils';
import CustView from './custView';
import CustText from './custText';

const EmptyView = ({
    title = 'Không có dữ liệu',
    height = metrics.screenHeight * 0.7,
    textStyle,
    children,
    isSearch = false,
}) => {
    return (
        <CustView center height={height}>
            {!isEmpty(children) ? (
                children
            ) : (
                <CustText style={textStyle}>{isSearch ? 'Không tìm thấy dữ liệu' : title}</CustText>
            )}
        </CustView>
    );
};

export default EmptyView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
