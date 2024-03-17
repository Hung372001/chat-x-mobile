import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, Platform } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";
import MusicPreview from "./musicPreview";
import DocumentPreview from "./documentPreview";
import VideoTemplate from "./videoTemplate";
import MapPreview from "./mapPreview";
import SimpleMessage from "./simpleMessage";
import MediaMessage from "./mediaMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer } from "../audioSlider/AudioPlayer";

const audioPreview = ({
  data_item,
  srcData,
  timeData,
  messageStat,
  sender,
  reply,
  replyType,
  chatType,
  replyBox,
}) => {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (timeData == "") {
      getCurrentTime();
    } else {
      getMessageTime(timeData);
    }
  }, []);

  const getCurrentTime = () => {
    var date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    setDateTime(strTime);
  };

  const getMessageTime = (timeData) => {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let date = null;
    const time = new Date(parseInt(timeData) * 1000);
    // const currentTimestamp = Date.now();
    // const diffTimestamp = currentTimestamp - time;
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
      month = time.getMonth() + 1;
      date = time.getDate() + "-" + month + "-" + time.getFullYear();
    }
    setDateTime(date);
    return date;
  };

  return (
    <SafeAreaView>
      <View
        style={{
          width: "100%",
          alignItems: sender == true ? "flex-end" : "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: replyType ? null : "#fff",
            width: replyType ? "100%" : "75%",
            marginHorizontal: replyType ? 0 : 15,
            marginTop: 10,
            marginBottom: 5,
            borderTopRightRadius: 13,
            borderTopLeftRadius: sender == true ? 13 : 0,
            borderBottomRightRadius: sender == true ? 0 : 13,
            borderBottomLeftRadius: 13,
            elevation: replyType ? 0 : 3,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
          }}
        >
          {reply != null && data_item != undefined ? (
            <>
              {sender != true && chatType == 2 && (
                <Text
                  style={{
                    marginTop: 10,
                    marginHorizontal: replyType ? 0 : 10,
                    fontFamily: "Urbanist-Bold",
                    lineHeight: 22,
                    fontSize: 15,
                    letterSpacing: 0.5,
                    color: "#FF7300",
                  }}
                >
                  {data_item.userName}
                </Text>
              )}
              {data_item.replyMessage.messageType == "0" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <SimpleMessage
                      messageData={data_item.replyMessage.message}
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "1" &&
                data_item.replyMessage.attachmentsData.attachmentType ==
                  "images" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <MediaMessage
                      srcData={
                        data_item.replyMessage.attachmentsData.attachments
                      }
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "1" &&
                data_item.replyMessage.attachmentsData.attachmentType ==
                  "video" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <VideoTemplate
                      srcData={
                        data_item.replyMessage.attachmentsData.attachments
                      }
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "3" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    {data_item.replyMessage.attachmentsData.attachments !=
                      undefined && (
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          marginTop: replyType ? 5 : 15,
                          marginBottom: 5,
                          alignItems: "center",
                          paddingRight: 10,
                          justifyContent: "center",
                        }}
                      >
                        <AudioPlayer
                          url={
                            data_item.replyMessage.attachmentsData
                              .attachments[0].file
                          }
                        />
                      </View>
                    )}
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "1" &&
                data_item.replyMessage.attachmentsData.attachmentType ==
                  "file" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <DocumentPreview
                      srcData={
                        data_item.replyMessage.attachmentsData.attachments
                      }
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "1" &&
                data_item.replyMessage.attachmentsData.attachmentType ==
                  "audio" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <MusicPreview
                      srcData={
                        data_item.replyMessage.attachmentsData.attachments
                      }
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "2" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    margin: 10,
                    borderRadius: 4,
                  }}
                >
                  <View style={{ width: "12%" }}>
                    {reply != null && (
                      <Feather
                        name={"corner-left-down"}
                        type={"corner-left-down"}
                        color={"#999999"}
                        size={18}
                        style={{
                          alignSelf: "center",
                          justifyContent: "center",
                        }}
                      />
                    )}
                  </View>
                  <View style={{ width: "88%" }}>
                    <MapPreview
                      srcData={data_item.replyMessage.message}
                      timeData={data_item.timeStamp}
                      sender={data_item.isSender}
                      replyType={true}
                    />
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
          {reply == null && sender != true && chatType == 2 && (
            <Text
              style={{
                paddingTop: 10,
                marginHorizontal: replyType ? 0 : 10,
                fontFamily: "Urbanist-Bold",
                lineHeight: 22,
                fontSize: 15,
                letterSpacing: 0.5,
                color: "#FF7300",
              }}
            >
              {data_item.userName}
            </Text>
          )}
          {srcData != undefined && (
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                marginTop: replyType ? 5 : reply ? 5 : chatType == 2 ? 5 : 15,
                marginBottom: reply ? 0 : 5,
                alignItems: "center",
                paddingLeft: replyType ? 0 : reply ? 5 : 10,
                paddingRight: replyType ? 10 : 20,
                justifyContent: "center",
              }}
            >
              <AudioPlayer
                url={
                  replyType
                    ? replyBox
                      ? timeData == ""
                        ? srcData
                        : srcData[0].files
                      : srcData[0].file
                    : timeData == ""
                    ? srcData
                    : srcData[0].file
                }
              />
            </View>
          )}
        </View>
        {!replyType && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: sender == true ? "flex-end" : "flex-start",
              marginHorizontal: 15,
            }}
          >
            <Text
              style={{
                marginRight: 2,
                marginHorizontal: sender == true ? 5 : 0,
                fontFamily: "OpenSans-Regular",
                fontSize: 10,
                color: "#999999",
              }}
            >
              {dateTime}
            </Text>
            {sender == true && (
              <Ionicons
                name={
                  messageStat == "0"
                    ?  chatType == 2
                    ? data_item.messageSeenIds && data_item.messageSeenIds.length >= 1
                      ? "checkmark-done"
                      : "md-checkmark-sharp"
                    : "md-checkmark-sharp"
                    : messageStat == "1"
                    ? "checkmark-done"
                    : messageStat == "2"
                    ? "close-circle-outline"
                    : messageStat == "3"
                    ? "sync-circle"
                    : null
                }
                color={
                  messageStat == "0"
                    ? "#999999"
                    : messageStat == "1"
                    ? "#3C57E5"
                    : messageStat == "2"
                    ? "#999999"
                    : messageStat == "3"
                    ? "#999999"
                    : null
                }
                size={16}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default audioPreview;
