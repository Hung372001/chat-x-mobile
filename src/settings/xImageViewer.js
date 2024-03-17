import { isEmpty } from 'lodash';
import React from 'react';
import { StyleSheet } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { CustText, CustView } from '../components';

const XImageViewer = ({ data, visible = false, hideBottom = false, onClose }) => {
    if (!isEmpty(data?.images)) {
        return (
            <ImageView
                visible={visible}
                imageIndex={data?.currentIndex}
                images={data?.images}
                onRequestClose={onClose}
                FooterComponent={({ imageIndex }) =>
                    hideBottom ? (
                        <></>
                    ) : (
                        <CustView height={64} center backgroundColor={'#00000077'}>
                            <CustText fS17 white>{`${imageIndex + 1} / ${
                                data?.images?.length || 0
                            }`}</CustText>
                        </CustView>
                    )
                }
            />
        );
    } else {
        return <></>;
    }
};

export default XImageViewer;
