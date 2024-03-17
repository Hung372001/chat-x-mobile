import React from "react";
import {
    View,
    Image,
    StyleSheet,
} from "react-native";
import FastImage from 'react-native-fast-image'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { isUrl } from "../utils";
import { images } from "../../assets";

const CustImage = ({ source, style, resizeMode }) => {
    const [urlError, setUrlError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const loadingOn = () => setIsLoading(true);

    const loadingOff = () => setIsLoading(false);

    const buildLoading = () => {
        return (
            <View style={styles.loadingContainer}>
                <SkeletonPlaceholder speed={900}>
                    <View style={style} />
                </SkeletonPlaceholder>
            </View>
        );
    };

    return (
        <View>
            {isLoading && !urlError && buildLoading()}
            {typeof source === 'string' && isUrl(source) ? (
                <FastImage
                    source={{ uri: urlError ? images.emptyImg : source }}
                    style={style}
                    resizeMode={resizeMode ? resizeMode : 'contain'}
                    onError={() => {
                        setUrlError(true);
                    }}
                    onLoadStart={loadingOn}
                    onLoadEnd={loadingOff}
                />
            ) : (
                <Image
                    source={
                        typeof source === 'string'
                            ? { uri: urlError ? images.emptyImg : source }
                            : source
                    }
                    resizeMode={resizeMode ? resizeMode : 'contain'}
                    style={style}
                    onError={() => {
                        setUrlError(true);
                    }}
                />
            )}
        </View>
    );
};

export default CustImage;

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
});