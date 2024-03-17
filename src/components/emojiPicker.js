import React from 'react';
import { StyleSheet } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Colors from '../utils/colors';
import { metrics } from '../utils';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';

const EmojiPicker = ({ modalRef, onSelect, isDarkMode = false }) => {
    const onPress = (data) => {
        onSelect(data);
        modalRef?.current?.close();
    };

    return (
        <RBSheet
            ref={modalRef}
            height={metrics.screenHeight * 0.5}
            duration={250}
            customStyles={{
                container: {
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderTopEndRadius: 16,
                    borderTopStartRadius: 16,
                    backgroundColor: isDarkMode ? Colors.dark : Colors.white,
                },
            }}
        >
            <EmojiSelector
                category={Categories.emotion}
                showSectionTitles={false}
                showSearchBar
                columns={8}
                onEmojiSelected={(emoji) => onPress(emoji)}
            />
        </RBSheet>
    );
};

export default EmojiPicker;
const styles = StyleSheet.create({});
