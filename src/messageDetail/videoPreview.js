import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, SafeAreaView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import AsyncStorage from '@react-native-async-storage/async-storage';
const VideoPreview = ({ route, navigation }) => {
    const [data, setData] = useState([]);
    const [play, setPlay] = useState(true);
    const [primary, setPrimary] = useState('');
    const [secondry, setSecondry] = useState('');

    useEffect(() => {
        setColorData();
    }, []);

    const setColorData = async () => {
        const primaryColor = await AsyncStorage.getItem('primaryColor');
        const secondaryColor = await AsyncStorage.getItem('secondaryColor');
        setPrimary(primaryColor);
        setSecondry(secondaryColor);
    };
    return (
        <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
            <View style={{ backgroundColor: '#fff' }}>
                {/* <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              padding: 15,
              borderBottomColor: "#ddd",
              borderBottomWidth: 1,
              alignItems: "center",
              height:70
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 10
              }}
            >
              <Text
                style={{
                  color: secondry,
                  fontSize: 22,
                  fontFamily: "Urbanist-Bold",
                  marginLeft: 10
                }}
              >
                Video
              </Text>
            </View>
            <Entypo
              onPress={() => navigation.goBack()}
              name="cross"
              type="cross"
              color={secondry}
              size={28}
            />
          </View> */}

                <View style={{ height: '100%' }}>
                    <VideoPlayer
                        source={{ uri: route.params.videoData }}
                        onBack={() => navigation.goBack()}
                        disableVolume={true}
                        disableFullscreen={true}
                        paused={false}
                        repeat={true}
                        style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default VideoPreview;
