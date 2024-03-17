import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Platform,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";

const imagePreview = ({ route, navigation }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (route.params.profImage != "show") {
      setData(JSON.parse(route.params.image));
    }
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        resizeMode={"contain"}
        style={{
          width: "100%",
          height: "100%",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
        source={{
          uri:
            route.params.profImage == "show"
              ? route.params.imageData
              : route.params.isSend
              ? Platform.OS == "ios"
                ? data.sourceURL
                : data.path
              : data.file,
        }}
      >
        <View
          style={{
            backgroundColor: "#000",
            width: 60,
            height: 60,
            borderRadius: 30,
            marginBottom: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Entypo
            onPress={() => navigation.goBack()}
            name="cross"
            type="cross"
            color={"#fff"}
            size={32}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default imagePreview;
