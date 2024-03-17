import React, { useState, useEffect, useReducer } from "react";
import {
  View,
  Image,
  ImageBackground,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Tooltip } from "react-native-elements";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { BarIndicator, DotIndicator } from "react-native-indicators";
import moment from "moment";
var moments = require("moment-timezone");

const listCard = (props) => {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const [groupImages, setGroupImeages] = useState([]);
  const navigationforword = useNavigation();
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  var groupSize = props.groupDetail ? props.groupDetail.totalMembers : null;

  const [statusLoader, setStatusLoader] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (props.groupDetail) {
      Object.entries(props.groupDetail.memberAvatars).map(([key, value]) => {
        if (props.groupDetail.memberAvatars[key].memberStatus == "1") {
          groupImages.push(value);
        }
      });
    }
    messageText(props.item, props.chatType);
    getMessageTime(props.time);
    forceUpdate();
  }, [props.time]);

  const messageText = (data_item, type) => {
    if (data_item != null && props.chat == "4") {
      let data = data_item;
      let chatType = type;
      let notifymessageData = data_item.message;
      let notifyType = Number(data_item.message.type);
      let membersUpdate = data_item.membersUpdate;
      let textMessage = "";
      if (chatType == 2) {
        if (notifyType == 1 || notifyType == 6) {
          // 1->for create new group, 6-> group update group and 8-> for delete bp group
          let transText =
            notifyType == 1
              ? translation.group_created_notify
              : translation.group_updated_notify; // last for 6 type
          if (data.isSender) {
            setNotificationMessage(
              transText.replace("((username))", translation.you)
            );
          } else {
            setNotificationMessage(
              transText.replace("((username))", data_item.userName)
            );
          }
        } else if (
          notifyType == 2 ||
          notifyType == 3 ||
          notifyType == 5 ||
          notifyType == 7
        ) {
          // 2-> add new group member, 3-> remove group members, 5-> Update group member role and 7-> join group member
          let notifyMemberIds = notifymessageData.memberIds;
          let totalRemovedMember = notifyMemberIds.length;
          let userName = "";
          let transText =
            notifyType == 2
              ? translation.add_grp_member_txt
              : notifyType == 5
              ? translation.updt_grp_role
              : notifyType == 7
              ? translation.join_grp_member_txt
              : translation.remove_grp_member_txt;
          notifyMemberIds.forEach((userId, index, array) => {
            if (membersUpdate[Number(userId)]) {
              if (index < 4) {
                userName += membersUpdate[userId];
                if (index !== array.length - 1) {
                  userName += ", ";
                }
              }
              if (index == 4) {
                userName += translation.grp_other_membert_txt.replace(
                  "((counter))",
                  totalRemovedMember - 4
                );
              }
            }
          });

          textMessage = transText.replace("“((username))”", userName);
          if (data.isSender) {
            textMessage = textMessage.replace("Admin", translation.you);
          }
          setNotificationMessage(textMessage);
        } else if (notifyType == 4) {
          let notifyMemberIds = notifymessageData.memberIds;
          if (data.isSender) {
            setNotificationMessage(
              translation.leave_grp_member_txt.replace(
                "((username))",
                translation.you
              )
            );
          } else {
            setNotificationMessage(
              translation.leave_grp_member_txt.replace(
                "((username))",
                membersUpdate[notifyMemberIds[0]]
              )
            );
          }
        }
      } else {
        if (notifyType == 1) {
          let transText = data.isSender
            ? translation.auto_inv_sender_msg
            : translation.auto_inv_receiver_msg;
          transText = transText.replace(/\\/g, "");
          transText = transText.replace("((sender_name))", translation.you);
          setNotificationMessage(
            transText.replace("((username))", data.userName)
          );
        }
      }
    }
  };

  const getMessageTime = (timeData) => {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let date = null;
    const time = new Date(parseInt(timeData) * 1000);
    var currentMessageDate = moment(time, "DD-MM-YYYY HH:mm:ss");
    var today = moment().endOf("day");
    let dateDifference = today.diff(currentMessageDate, "days");
    if (dateDifference == 0) {
      let hours = time.getHours();
      let minutes = time.getMinutes();
      hours %= 12;
      hours = hours || 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      const ampm = time.getHours() >= 12 ? "pm" : "am";
      date = hours + ":" + minutes + " " + ampm;
    } else if (dateDifference == 1) {
      date = "Yesterday";
    } else if (dateDifference > 1 && dateDifference < 7) {
      date = week[time.getDay()];
    } else {
      month = ("0" + (time.getMonth() + 1)).slice(-2);
      date =
        ("0" + time.getDate()).slice(-2) +
        "/" +
        month +
        "/" +
        time.getFullYear();
    }
    setDateTime(date);
    return date;
  };
  const sendInvite = async (val) => {
    setStatusLoader(true);
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    axios
      .post(
        CONSTANT.BaseUrl + "send-guppy-invite",
        {
          sendTo: props.sendTo,
          startChat: val,
          userId: JSON.parse(id),
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          if (val == 1) {
            navigationforword.navigate("messageDetail", {
              item: props.item,
              name: props.item.userName,
              image: props.item.userAvatar,
              chatId: props.item.chatId,
              receiverid: props.item.chatId.substring(
                0,
                props.item.chatId.length - 2
              ),
              isOnline: props.item.isOnline,
              chatType: props.item.chatType.toString(),
            });
          } else {
            props.status(props.index);
          }
          setStatusLoader(false);
        } else if (response.status === 203) {
          setStatusLoader(false);
        }
      })
      .catch((error) => {
      });
  };

  const unblockUser = async () => {
    // setStatusLoader(true)
    let actionTo = props.sendTo.split("_")[0];
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "update-user-status",
        {
          actionTo: actionTo,
          userId: JSON.parse(id),
          groupId: 0,
          statusType: "4",
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          props.status();
          props.status(props.index);
          // setStatusLoader(false)
        } else if (response.status === 203) {
          // setStatusLoader(false)
        }
      })
      .catch((error) => {
      });
  };
  return (
    <View
      style={{
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignContent: "center",
            // overflow: "hidden",
            width: "70%",
          }}
        >
          <View>
            {props.blockedFriend ? (
              <View
                style={{
                  marginBottom: -13,
                  zIndex: 1,
                  height: 15,
                  width: 15,
                  backgroundColor: "#fff",
                  borderRadius: 15 / 2,
                }}
              >
                <Feather name="slash" type="slash" color={"red"} size={15} />
              </View>
            ) : null}
            {props.chatType == "0" ? (
              <ImageBackground
                imageStyle={{ borderRadius: 45 / 2 }}
                style={{
                  width: 45,
                  height: 45,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
                source={
                  props.image == ""
                    ? require("../../assets/NoImage.png")
                    : { uri: props.image }
                }
              >
                <View
                  style={{
                    marginLeft: -10,
                    marginTop: -10,
                    width: 30,
                    height: 30,
                    borderRadius: 30 / 2,
                    borderColor: "#fff",
                    borderWidth: 5,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 22 / 2,
                    }}
                    source={{
                      uri:
                        props.postImage.slice(0, 5) == "https"
                          ? props.postImage
                          : "https:" + props.postImage,
                    }}
                  />
                </View>
              </ImageBackground>
            ) : props.chatType == "1" ? (
              <Image
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 45 / 2,
                }}
                source={{
                  uri:
                    props.image.slice(0, 5) == "https"
                      ? props.image
                      : "https:" + props.image,
                }}
              />
            ) : props.chatType == "2" &&
              groupImages.length >= 1 &&
              props.groupImage == "" ? (
              <>
                {groupSize == 2 ? (
                  <View
                    style={{
                      paddingRight: 13,
                      paddingLeft: 8,
                      paddingVertical: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30 / 2,
                        backgroundColor: "#fff",
                        zIndex: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 26 / 2,
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
                        width: 26,
                        height: 26,
                        borderRadius: 26 / 2,
                        marginLeft: 15,
                        marginTop: -8,
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
                        <Feather
                          name="plus"
                          type="plus"
                          color={"#fff"}
                          size={10}
                        />
                      </View>
                    </View>
                  </View>
                ) : (
                  <Image
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 45 / 2,
                    }}
                    source={{
                      uri: props.groupImage,
                    }}
                  />
                )}
              </>
            ) : props.chatType == "3" ? (
              <ImageBackground
                imageStyle={{ borderRadius: 45 / 2 }}
                resizeMode={"contain"}
                style={{
                  width: 45,
                  height: 45,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                }}
                source={
                  props.image == ""
                    ? require("../../assets/NoImage.png")
                    : { uri: props.image }
                }
              ></ImageBackground>
            ) : (
              <Image
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 45 / 2,
                  marginRight: 10,
                  marginLeft: 10,
                }}
                source={{
                  uri:
                    props.image.slice(0, 5) == "https"
                      ? props.image
                      : "https:" + props.image,
                }}
              />
            )}
            {((props.time && props.chatType == "1") || props.activeMark) && (
              <View
                style={{
                  backgroundColor: props.isOnline ? "#22C55E" : "#999999",
                  width: 15,
                  height: 15,
                  marginTop: -12,
                  marginRight: -3,
                  borderRadius: 15 / 2,
                  borderColor: "#fff",
                  borderWidth: 3,
                  alignSelf: "flex-end",
                }}
              ></View>
            )}
          </View>

          <View>
            <Text
              numberOfLines={1}
              style={{
                marginLeft: 10,
                color: settings.chatSetting.secondaryColor,
                fontSize: 15,
                lineHeight: 21,
                letterSpacing: 0.5,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {props.name}
            </Text>
            {!props.clearChat ? (
              <>
                {/* {props.item.memberDisable == true && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                      <Text
                        style={{
                          color: settings.chatSetting.secondaryColor,
                          fontSize: 14,
                          fontFamily: "Urbanist-Regular",
                        }}
                        numberOfLines={1}
                      >
                         {props.item.message.type == 4 ? "You left this group" : "Admin removed you from this group"}
                        {props.chatType == "2"
                          ? props.isSender
                            ? "You:"
                            : props.userName + ":"
                          : ""}
                        {props.chatType == 2 ? props.message : props.message}
                      </Text>
                  </View>
                )} */}
                {props.chat == "0" && props.messageStatus != "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                      <Text
                        style={{
                          color: settings.chatSetting.secondaryColor,
                          fontSize: 14,
                          fontFamily: "Urbanist-Regular",
                        }}
                        numberOfLines={1}
                      >
                        {props.chatType == "2"
                          ? props.isSender
                            ? "You:"
                            : props.userName + ":"
                          : ""}
                        {props.chatType == 2 ? props.message : props.message}
                      </Text>
                    )}
                  </View>
                )}
                {props.chat === "1" && props.messageStatus != "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                      width: "100%",
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                        <Text
                          style={{
                            color: settings.chatSetting.secondaryColor,
                            fontSize: 14,
                            fontFamily: "Urbanist-Regular",
                          }}
                        >
                          {props.chatType == "2"
                            ? props.isSender
                              ? "You:"
                              : props.userName + ":"
                            : ""}
                        </Text>
                        <Feather
                          style={{ marginLeft: 5 }}
                          name="paperclip"
                          type="paperclip"
                          color={"#999999"}
                          size={15}
                        />
                        {props.chatType != "2" && (
                          <Text
                            numberOfLines={1}
                            style={{
                              marginLeft: 5,
                              color: settings.chatSetting.secondaryColor,
                              fontSize: 14,
                              fontFamily: "Urbanist-Regular",
                            }}
                          >
                            {props.isSender
                              ? translation.you_sent_attachment
                              : translation.sent_you_attachment}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                )}
                {props.chat == "2" && props.messageStatus != "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                        <Text
                          style={{
                            color: settings.chatSetting.secondaryColor,
                            fontSize: 14,
                            fontFamily: "Urbanist-Regular",
                          }}
                        >
                          {props.chatType == "2"
                            ? props.isSender
                              ? "You:"
                              : props.userName + ":"
                            : ""}
                        </Text>
                        <Feather
                          style={{ marginLeft: 5 }}
                          name="map-pin"
                          type="map-pin"
                          color={"#999999"}
                          size={15}
                        />
                        {props.chatType != "2" && (
                          <Text
                            numberOfLines={1}
                            style={{
                              marginLeft: 5,
                              color: settings.chatSetting.secondaryColor,
                              fontSize: 14,
                              fontFamily: "Urbanist-Regular",
                            }}
                          >
                            {props.isSender
                              ? translation.you_sent_location
                              : translation.sent_you_location}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                )}
                {props.chat == "3" && props.messageStatus != "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                        <Text
                          style={{
                            color: settings.chatSetting.secondaryColor,
                            fontSize: 14,
                            fontFamily: "Urbanist-Regular",
                          }}
                        >
                          {props.chatType == "2"
                            ? props.isSender
                              ? "You:"
                              : props.userName + ":"
                            : ""}
                        </Text>
                        <Feather
                          name="headphones"
                          type="headphones"
                          color={"#999999"}
                          size={15}
                        />
                        {props.chatType != "2" && (
                          <Text
                            style={{
                              marginLeft: 5,
                              color: settings.chatSetting.secondaryColor,
                              fontSize: 14,
                              fontFamily: "Urbanist-Regular",
                            }}
                          >
                            {props.isSender
                              ? translation.you_sent_voice_note
                              : translation.sent_you_voice_note}
                          </Text>
                        )}
                      </>
                    )}
                  </View>
                )}
                {props.chat == "4" && props.messageStatus != "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                      <Text
                        style={{
                          color: settings.chatSetting.secondaryColor,
                          fontSize: 14,
                          fontFamily: "Urbanist-Regular",
                        }}
                        numberOfLines={1}
                      >
                        {notificationMessage}
                      </Text>
                    )}
                  </View>
                )}
                {props.messageStatus == "2" && (
                  <View
                    style={{
                      flexDirection: "row",
                      marginLeft: 10,
                      marginTop: 5,
                    }}
                  >
                    {props.typingText.length >= 1 &&
                    props.typingType == props.chatType &&
                    props.isTyping == true &&
                    props.item.chatId.split("_")[0] ==
                      (props.chatType != 1
                        ? props.typingId.split("_")[0]
                        : parseInt(props.typingSenderId)) ? (
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
                      <Text
                        style={{
                          color: settings.chatSetting.secondaryColor,
                          fontSize: 14,
                          fontFamily: "Urbanist-Regular",
                        }}
                        numberOfLines={1}
                      >
                        {translation.deleted_message}
                      </Text>
                    )}
                  </View>
                )}
              </>
            ) : null}
          </View>
        </View>
        {props.time && (
          <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
            {/* <Button
              titleStyle={{ fontSize: 13, color: "#999999" }}
              buttonStyle={{
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 15,
                fontFamily: "OpenSans-Bold",
              }}
              title={dateTime}
            /> */}
            <Text
              style={{
                // backgroundColor:"#EF4444",
                color: "#999999",
                paddingHorizontal: 15,
                fontSize: 11,
                fontFamily: "OpenSans-Medium",
              }}
            >
              {dateTime}
            </Text>
            {props.unread != 0 && (
              <View
                style={{
                  backgroundColor: "#EF4444",
                  marginHorizontal: 10,
                  padding: 4,
                  marginTop: 5,
                  borderRadius: 50,
                }}
              >
                <Text
                  style={{
                    // backgroundColor:"#EF4444",
                    color: "#fff",
                    fontSize: 9,
                    fontFamily: "OpenSans-Medium",
                  }}
                >
                  {props.unread.toString().length == 1
                    ? "0" + props.unread
                    : props.unread}
                  +
                </Text>
              </View>
            )}
          </View>
        )}

        {props.type == "start" && (
          <TouchableOpacity
            onPress={() => sendInvite(1)}
            style={{
              paddingHorizontal: 15,
              borderRadius: 5,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: "#22c55e",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: settings.chatSetting.secondaryColor,
                fontSize: 13,
                fontFamily: "OpenSans-Bold",
              }}
            >
              Start chat
            </Text>
          </TouchableOpacity>
        )}
        {props.type == "invite" && (
          <>
            {statusLoader == false ? (
              <Button
                onPress={() => sendInvite(0)}
                titleStyle={{ fontSize: 14, color: "#1DA1F2" }}
                buttonStyle={{
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 15,
                  fontFamily: "OpenSans-Regular",
                }}
                title={translation.invite + " +"}
              />
            ) : (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 15,
                }}
              >
                <BarIndicator
                  count={5}
                  size={12}
                  color={settings.chatSetting.primaryColor}
                />
              </View>
            )}
          </>
        )}
        {props.type == "sent" && (
          <>
            {statusLoader == false ? (
              <View
                style={{
                  padding: 15,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    color: "#999999",
                    fontSize: 13,
                    fontFamily: "Urbanist-Medium",
                  }}
                >
                  {translation.sent}
                </Text>
                <Feather
                  style={{ marginLeft: 5 }}
                  name="check"
                  type="check"
                  color={"#999999"}
                  size={15}
                />
              </View>
            ) : (
              <BarIndicator
                count={5}
                size={10}
                color={settings.chatSetting.primaryColor}
              />
            )}
          </>
        )}
        {props.type == "resend" && (
          <TouchableOpacity
            onPress={() => sendInvite(0)}
            style={{
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "OpenSans-Bold",
              backgroundColor: "#3c57e5",
              padding: 10,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 13,
                fontFamily: "OpenSans-Medium",
              }}
            >
              {"Resend +"}
            </Text>
          </TouchableOpacity>
        )}
        {props.type == "blocked" && (
          <Tooltip
            popover={<Text>Your request has been blocked by this user</Text>}
          >
            <Button
              titleStyle={{ fontSize: 14, color: "#EF4444" }}
              buttonStyle={{
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 15,
                fontFamily: "OpenSans-Bold",
              }}
              title="Blocked"
            />
          </Tooltip>
        )}
        {props.type == "respond" && (
          <Button
            onPress={() => props.respondStatus(props.item)}
            titleStyle={{
              fontSize: 14,
              color: "#fff",
              fontFamily: "OpenSans-Bold",
            }}
            buttonStyle={{
              backgroundColor: "#22C55E",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 15,
              fontFamily: "OpenSans-Bold",
            }}
            title={"Respond"}
          />
        )}
        {props.type == "unblock" && (
          <Tooltip popover={<Text>{translation.you_are_blocked}</Text>}>
            <Button
              onPress={() => unblockUser()}
              titleStyle={{ fontSize: 14, color: "#fff" }}
              buttonStyle={{
                backgroundColor: "#EF4444",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 15,
                fontFamily: "OpenSans-Bold",
              }}
              title={translation.unblock}
            />
          </Tooltip>
        )}
      </View>
    </View>
  );
};

export default listCard;
