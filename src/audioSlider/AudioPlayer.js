import React, { useState, useRef } from "react";
import { Text, View, TouchableOpacity, ActivityIndicator, LayoutAnimation, UIManager, Image, Platform } from "react-native";
import { styles } from "./styles";
import Video from "react-native-video";
import Slider from "@react-native-community/slider";
import { toHHMMSS } from "./utils";
import { Images } from "./assets/index";

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const volumeControlTime = 3000;

export const AudioPlayer = (props) => {
  const { url, style, repeatOnComponent, repeatOffComponent } = props;
  const [paused, setPaused] = useState(true);

  const videoRef = useRef(null);
  const controlTimer = useRef(0);

  const [totalLength, setTotalLength] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const [volumeControl, setVolumeControl] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const onSeek = (time) => {
    time = Math.round(time);
    videoRef && videoRef.current.seek(time);
    setCurrentPosition(time);
    setPaused(false);
  };

  const fixDuration = (data) => {
    setLoading(false);
    setTotalLength(Math.floor(data.duration));
  };

  const setTime = (data) => {
    setCurrentPosition(Math.floor(data.currentTime));
  };

  const togglePlay = () => {
    setPaused(!paused);
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  const muteToggleVolumeControl = () => {
    setVolume(0)
  };

  const unMuteToggleVolumeControl = () => {
    setVolume(1)
  };

  const setVolumeTimer = (setTimer = true) => {
    clearTimeout(controlTimer.current);
    controlTimer.current = 0;
    if (setTimer) {
      controlTimer.current = setTimeout(() => {
        LayoutAnimation.easeInEaseOut();
        setVolumeControl(false);
      }, volumeControlTime);
    }
  };

  const onVolumeChange = (vol) => {
    setVolumeTimer();
    setVolume(vol);
  };

  const resetAudio = () => {
    if (!repeat) {
      setPaused(true);
    }
    setCurrentPosition(0);
  };

  return (
    <View >
      <Video
        source={{ uri: url }}
        ref={videoRef}
        playInBackground={false}
        audioOnly={true}
        playWhenInactive={false}
        paused={paused}
        onEnd={resetAudio}
        onLoad={fixDuration}
        onLoadStart={() => setLoading(true)}
        onProgress={setTime}
        volume={volume}
        repeat={true}
        style={{ height: 0, width: 0 }}
      />

      <View>
        <View style={styles.rowContainer}>


          <View style={styles.sliderContainer}>
            {loading && (
              <View >
                <ActivityIndicator style={{marginRight:10 , marginTop:4}} size="small" color="#FF7300" />
              </View>
            ) || (
                <TouchableOpacity style={[styles.iconContainer, styles.playBtn, { width: '10%' , alignItems:'center'  ,  marginTop:1}]} onPress={togglePlay}>
                  <Image
                    source={paused ? Images.playIcon : Images.pauseIcon}
                    style={styles.playIcon}
                  />
                </TouchableOpacity>
              )}

            <View style={{width: "70%" , marginTop:2}}>
              <Slider
              style={styles.slider}
                minimumValue={0}
                maximumValue={Math.max(totalLength, 1, currentPosition + 1)}
                thumbImage={require('../../assets/dot.png')}
                minimumTrackTintColor={'#FF7300'}
                maximumTrackTintColor={'#ddd'}
                onSlidingComplete={onSeek}
                value={currentPosition}
              />
              {/* <View style={styles.durationContainer}>
                <Text style={styles.timeText}>
                  {toHHMMSS(currentPosition)}
                </Text>
                <Text style={styles.timeText}>
                  {toHHMMSS(totalLength)}
                </Text>
              </View> */}
            </View>
            {/* <TouchableOpacity
              hitSlop={{ bottom: 10, right: 10, left: 10 }}
              style={styles.iconContainer}
              onPress={toggleRepeat}
            >
              <Image source={Images.repeatIcon} style={styles.playIcon} />
              {!repeat && <View style={styles.crossLine} />}
            </TouchableOpacity> */}
             <View
                  style={
                    styles.volumeControlContainer}
                >
                  {/* <TouchableOpacity
                    hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
                    style={styles.iconContainer}
                    onPress={()=>  { volume === 0 ? unMuteToggleVolumeControl() : muteToggleVolumeControl()}}
                  >
                    <Image
                      source={volume === 0 ? Images.muteIcon : Images.soundIcon}
                      style={styles.playIcon}
                    />
                  </TouchableOpacity> */}
                   <Text style={styles.timeText}>
                  {toHHMMSS(totalLength)}
                </Text>
                  
                </View> 
               
          </View>
        </View>
      </View>
    </View>
  );
};
