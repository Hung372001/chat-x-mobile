import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ImageBackground, FlatList, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import Entypo from "react-native-vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";

const imagesListPreview = ({ route, navigation }) => {
  const [data, setData] = useState([]);
  const [primary , setPrimary] = useState("")
  const [secondry , setSecondry] = useState("")

  useEffect(() => {
    setData(JSON.parse(route.params.imagesData));
  }, []);

  useEffect(() => {
    setColorData()
  }, []);

  const setColorData = async()=>{
    const primaryColor = await AsyncStorage.getItem("primaryColor");
    const secondaryColor = await AsyncStorage.getItem("secondaryColor");
    setPrimary(primaryColor)
    setSecondry(secondaryColor)
  }

  return (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
          borderBottomColor: "#ddd",
          borderBottomWidth: 1,
          alignItems: "center"
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
            Images
          </Text>
        </View>
        <Entypo
          onPress={() => navigation.goBack()}
          name="cross"
          type="cross"
          color={secondry}
          size={28}
        />
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        keyExtractor={(x, i) => i.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("imagePreview", { image: JSON.stringify(item) , isSend :  route.params.isSend })}
            style={{ width: '100%', height: 400, paddingHorizontal: 10, marginVertical: 10, alignItems: "flex-end",backgroundColor:"#EAEFF0" }}>
            <Image
              resizeMode={"contain"}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 5,

              }}
              source={{
                uri: route.params.isSend
                ? Platform.OS == "ios"
                  ? item.sourceURL
                  : item.path
                : item.file,
              }}
            />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>

  );
}

export default imagesListPreview;
