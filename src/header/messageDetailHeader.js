import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import Octicons from "react-native-vector-icons/Octicons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TabRouter, useNavigation } from "@react-navigation/native";
import Geolocation from "@react-native-community/geolocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import Feather from "react-native-vector-icons/Feather";
import { BarIndicator, DotIndicator } from "react-native-indicators";

const messageDetailHeader = ({
  name,
  image,
  attachments,
  id,
  chatId,
  blockedId,
  isOnline,
  chatType,
  groupTitle,
  groupImage,
  groupDetail,
  isTyping,
  typingId,
  typingSenderId,
  typingType,
  typingName,
  typingText,
}) => {
  const settings = useSelector((state) => state.setting.settings);
  const navigationforword = useNavigation();

  const [primary, setPrimary] = useState("");
  const [secondry, setSecondry] = useState("");
  const [groupImages, setGroupImeages] = useState([]);

  if (chatType == 2 && groupDetail != null) {
    var groupSize = groupDetail ? groupDetail.totalMembers : null;
    if (groupDetail) {
      Object.entries(groupDetail.memberAvatars).map(([key, value]) => {
        if (groupDetail.memberAvatars[key].memberStatus == "1") {
          groupImages.push(value);
        }
      });
    }
  } else {
    var groupSize = 0;
  }

  useEffect(() => {
    setData();
  }, []);

  const setData = async () => {
    const primaryColor = await AsyncStorage.getItem("primaryColor");
    const secondaryColor = await AsyncStorage.getItem("secondaryColor");
    setPrimary(primaryColor);
    setSecondry(secondaryColor);
  };

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("dark-content", true);
    } else {
      StatusBar.setBarStyle("light-content", true);
    }
  }, []);
  return (
    <View
      style={{
        height: 70,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent:chatType != "3" ? "space-between" : "flex-start",
        width: "100%",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "25%",
        }}
      >
        <Ionicons
          onPress={() => navigationforword.goBack()}
          style={{ paddingHorizontal: 10 }}
          name="chevron-back"
          type="chevron-back"
          color={secondry}
          size={25}
        />
        {groupDetail != null && chatType == "2" && groupImage == "" ? (
          <>
            {groupSize == 2 ? (
              <View
                style={{
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 34 / 2,
                    backgroundColor: "#fff",
                    zIndex: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 30 / 2,
                    }}
                    source={{
                      uri:
                        groupImages[0].userAvatar.slice(0, 5) == "https"
                          ? groupImages[0].userAvatar
                          : "https:" + groupImages[0].userAvatar,
                    }}
                  />
                </View>

                <Image
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 30 / 2,
                    marginLeft: -8,
                  }}
                  source={{
                    uri:
                      groupImages[1].userAvatar.slice(0, 5) == "https"
                        ? groupImages[1].userAvatar
                        : "https:" + groupImages[1].userAvatar,
                  }}
                />
              </View>
            ) : groupSize == 3 ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                      marginRight: 7,
                    }}
                    source={{
                      uri:
                        groupImages[0].userAvatar.slice(0, 5) == "https"
                          ? groupImages[0].userAvatar
                          : "https:" + groupImages[0].userAvatar,
                    }}
                  />
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                    }}
                    source={{
                      uri:
                        groupImages[1].userAvatar.slice(0, 5) == "https"
                          ? groupImages[1].userAvatar
                          : "https:" + groupImages[1].userAvatar,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                    }}
                    source={{
                      uri:
                        groupImages[2].userAvatar.slice(0, 5) == "https"
                          ? groupImages[2].userAvatar
                          : "https:" + groupImages[2].userAvatar,
                    }}
                  />
                </View>
              </View>
            ) : groupSize >= 4 ? (
              <View
                style={{
                  padding: 8,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ flexDirection: "row", marginBottom: 5 }}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                      marginRight: 7,
                    }}
                    source={{
                      uri:
                        groupImages[0].userAvatar.slice(0, 5) == "https"
                          ? groupImages[0].userAvatar
                          : "https:" + groupImages[0].userAvatar,
                    }}
                  />
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                    }}
                    source={{
                      uri:
                        groupImages[1].userAvatar.slice(0, 5) == "https"
                          ? groupImages[1].userAvatar
                          : "https:" + groupImages[1].userAvatar,
                    }}
                  />
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20 / 2,
                      marginRight: 5,
                    }}
                    source={{
                      uri:
                        groupImages[2].userAvatar.slice(0, 5) == "https"
                          ? groupImages[2].userAvatar
                          : "https:" + groupImages[2].userAvatar,
                    }}
                  />
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: "#6366F1",
                      borderRadius: 20 / 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="plus" type="plus" color={"#fff"} size={10} />
                  </View>
                </View>
              </View>
            ) : null}
          </>
        ) : chatType == "3" ? (
          <TouchableOpacity
            onPress={() =>
              navigationforword.navigate("imagePreview", {
                imageData: image,
                profImage: "show",
              })
            }
          >
            <Image
              style={{
                width: 45,
                height: 45,
                borderRadius: 45 / 2,
              }}
              source={
                image != ""
                  ? {
                      uri:
                        image.slice(0, 5) == "https" ? image : "https:" + image,
                    }
                  : require("../../assets/NoImage.png")
              }
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() =>
              navigationforword.navigate("imagePreview", {
                imageData: image,
                profImage: "show",
              })
            }
          >
            <Image
              style={{
                width: 45,
                height: 45,
                borderRadius: 45 / 2,
              }}
              source={{
                uri:
                  image != undefined
                    ? image.slice(0, 5) == "https"
                      ? image
                      : "https:" + image
                    : groupImage.slice(0, 5) == "https"
                    ? groupImage
                    : "https:" + groupImage,
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          width: "60%",
          justifyContent: "center",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: "#0A0F26",
            fontSize: 18,
            fontFamily: "Urbanist-Bold",
            marginLeft: 10,
          }}
        >
          {chatType == 2 ? groupTitle : name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 10,
            marginTop: 5,
          }}
        >
          {typingText.length >= 1 &&
          typingType == chatType &&
          isTyping == true &&
          chatId.split("_")[0] ==
            (chatType != 1
              ? typingId.split("_")[0]
              : parseInt(typingSenderId)) ? (
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: settings.chatSetting.primaryColor,
                  fontSize: 14,
                  fontFamily: "Urbanist-Regular",
                }}
                numberOfLines={1}
              >
                typing
              </Text>
              <View style={{ marginTop: 5, marginLeft: 2 }}>
                <DotIndicator
                  count={3}
                  size={3}
                  color={settings.chatSetting.primaryColor}
                />
              </View>
            </View>
          ) : (
            <>
              {chatType == 1 && (
                <>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 8 / 2,
                      backgroundColor: isOnline == true ? "#22C55E" : "#dddddd",
                    }}
                  ></View>
                  <Text
                    style={{
                      color: "#0A0F26",
                      fontSize: 14,
                      fontFamily: "Urbanist-Regular",
                      marginLeft: 5,
                    }}
                  >
                    {isOnline == true ? "Online" : "Offline"}
                  </Text>
                </>
              )}
            </>
          )}
        </View>
      </View>

      {chatType != "3" &&
        <TouchableOpacity
        onPress={() => {
          chatType == 2
            ? navigationforword.navigate("groupMessageSettings", {
                mediaAttachments: attachments,
                friendId: id,
                blockedUser: blockedId,
                chatId: chatId,
                members: groupDetail != null ? groupDetail.memberAvatars : [],
                groupDetail: groupDetail != null ? groupDetail : null,
                groupTitle: groupTitle,
                groupImage: groupImage,
              })
            : navigationforword.navigate("singleMessageSettings", {
                mediaAttachments: attachments,
                friendId: id,
                chatId: chatId,
                blockedUser: blockedId,
                name: name,
                chatType: chatType,
              });
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
          width: "15%",
        }}
      >
        <Octicons
          style={{ paddingHorizontal: 10 }}
          name="settings"
          type="settings"
          color={secondry}
          size={25}
        />
        {/* <Text style={{fontSize:14 , color:'#fff' , fontFamily:'Urbanist-Regular'  , fontWeight:'700' , marginRight:10 }}>Create group +</Text> */}
      </TouchableOpacity>}
    </View>
  );
};

export default messageDetailHeader;
