import { Dimensions, Platform, StatusBar } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
const { width, height } = Dimensions.get('window');
import { buildEnv, config } from '../services/globalConfig';
import CodePush from 'react-native-code-push';

export const isIOS = Platform.OS === 'ios';
export const isANDROID = Platform.OS === 'android';

export const metrics = {
    screenWidth: width < height ? width : height,
    screenHeight: width < height ? height : width,
};

export const touchArea = {
    left: 6,
    top: 6,
    right: 6,
    bottom: 6,
};

/** Check string is url or not. */
export const isUrl = (string) => {
    const regex = /^((http|https|ftp):\/\/)/;
    return regex.test(string);
};

/** Check previous value of state or props. */
export const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};

/** Show network loading indicator on status bar ios. */
export const useNetworkActivityStatusBar = (isVisible = false) => {
    if (Platform.OS === 'ios') {
        return StatusBar.setNetworkActivityIndicatorVisible(isVisible);
    }
};

/** Image picker using this one with permission features. */
export const handleImagePicker = (config) => {
    return ImagePicker.openPicker({
        width: config.width,
        height: config.height,
        cropping: true,
        compressImageMaxWidth: config.width,
        compressImageMaxHeight: config.height,
        compressImageQuality: 1,
        forceJpg: true,
    });
};

/**
 * Crop image
 * Read more example and properties: https://github.com/ivpusic/react-native-image-crop-picker
 *  */
export const handleCropImage = (path, props) => {
    return ImagePicker.openCropper({
        path: path,
        ...props,
    });
};

export const getCurrentAppVersion = () => {
    const [version, setVersion] = useState(config.currentVersion);
    useEffect(() => {
        CodePush.getUpdateMetadata().then((update) => {
            if (!update) {
                setVersion(
                    `${buildEnv === 'staging' ? 'Dev' : 'Version'} ${config.currentVersion}`
                );
            } else {
                const label = update?.label?.substring(1);
                setVersion(
                    `${buildEnv === 'staging' ? 'Dev' : 'Version'} ${
                        config.currentVersion
                    } rev.${label}`
                );
            }
        });
    }, []);
    return version;
};
