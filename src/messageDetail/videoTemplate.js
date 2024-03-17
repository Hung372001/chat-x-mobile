import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import Video from "react-native-video";
import VideoPlayer from "react-native-video-controls";
import moment from "moment";
import AudioPreview from "./audioPreview";
import DocumentPreview from "./documentPreview";
import MusicPreview from "./musicPreview";
import MapPreview from "./mapPreview";
import SimpleMessage from "./simpleMessage";
import MediaMessage from "./mediaMessage";

videoTemplate = ({
  data_item,
  srcData,
  timeData,
  messageStat,
  sender,
  reply,
  replyType,
  chatType,
  replyBox
}) => {
  const navigationforword = useNavigation();
  const [dateTime, setDateTime] = useState("");
  const [sending, setSending] = useState(true);

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
    setSending(true);
    setDateTime(strTime);
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
      month = time.getMonth() + 1;
      date = time.getDate() + "-" + month + "-" + time.getFullYear();
    }
    setDateTime(date);
    return date;
  };

  return (
    <SafeAreaView
      style={{
        flexDirection: "row",
        justifyContent: sender == true ? "flex-end" : "flex-start",
        alignItems: "center",
        width: "100%",
      }}
    >
      {Platform.OS == "android" && sender && !replyType ? (
        <View style={{ width: "10%" }}>
          <Feather
            onPress={() =>
              navigationforword.navigate("videoPreview", {
                videoData: srcData[0].file,
              })
            }
            name="maximize-2"
            type="maximize-2"
            color={"#999999"}
            size={20}
          />
        </View>
      ) : null}
      <View
        style={{
          width: replyType ? "100%" : "75%",
          alignItems:
            sender == true
              ? "flex-end"
              : replyType == true
              ? "flex-end"
              : "flex-start",
        }}
      >
        <View
          style={{
            backgroundColor: replyType ? null : "#fff",
            width: "100%",
            marginHorizontal: replyType ? 0 : 15,
            marginTop: replyType ? 5 : 10,
            marginBottom: 5,
            borderTopRightRadius: 13,
            borderTopLeftRadius: sender == true ? 13 : 0,
            borderBottomRightRadius: sender == true ? 0 : 13,
            borderBottomLeftRadius: 13,
            elevation: replyType ? 0 : 3,
            shadowOffset: { width: 0, height: 1 },
            shadowColor: "#000000",
            shadowOpacity: 0.1,
            justifyContent: "space-between",
            alignItems: sender ? "flex-end" : "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
        >
          {reply != null && data_item != undefined ? (
            <>
              {(sender != true && chatType == 2 )&& (
                <Text
                  style={{
                    paddingBottom: 5,
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
                    marginBottom: 10,
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
                    backgroundColor: "#F7F7F7",
                    marginBottom: 10,
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
                  <View style={{ width: "88%", alignItems: "flex-start" }}>
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
                    marginBottom: 10,
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
                    <View
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#F7f7f7",
                        paddingVertical: 10,
                        paddingRight: 10,
                        borderRadius: 5,
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          width: "100%",
                          height: 120,
                        }}
                      >
                        {Platform.OS == "ios" ? (
                          <Video
                            source={{
                              uri: data_item.replyMessage.attachmentsData
                                .attachments[0].file,
                            }}
                            paused={true}
                            fullscreen={true}
                            controls={true}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              width: "100%",
                            }}
                          />
                        ) : (
                          <VideoPlayer
                            source={
                              data_item.replyMessage.attachmentsData
                                .attachments[0].file
                            }
                            paused={true}
                            onEnterFullScreen={() =>
                              navigationforword.navigate("videoPreview", {
                                videoData: srcData[0].file,
                              })
                            }
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              width: "100%",
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : data_item.replyMessage.messageType == "3" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f7f7f7",
                    marginBottom: 10,
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
                    <AudioPreview
                      srcData={
                        data_item.replyMessage.attachmentsData.attachments
                      }
                      timeData={data_item.time}
                      sender={data_item.isSender}
                      replyType={true}
                    />
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
                    marginBottom: 10,
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
                    marginBottom: 10,
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
                    marginBottom: 10,
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
          {(reply == null && sender != true && chatType == 2) && (
            <Text
              style={{
                paddingBottom: 5,
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
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              style={{
                width: "100%",
                height: replyType ? 120 : 180,
                borderRadius: 5,
              }}
            >
              {Platform.OS == "ios" ? (
                <Video
                  // source={
                  //   timeData == ""
                  //     ? { uri: srcData.sourceURL }
                  //     : { uri: srcData[0].file }
                  // }
                  source={replyType ? 
                    replyBox ?  timeData == ""
                    ? {uri: srcData.sourceURL}
                    : { uri: srcData[0].file } :
                    { uri: srcData[0].file } :
                    timeData == ""
                      ? {uri: srcData.sourceURL}
                      : { uri: srcData[0].file } 
                }
                  paused={true}
                  fullscreen={true}
                  controls={true}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: "100%",
                  }}
                />
              ) : (
                <VideoPlayer
                  source={replyType ? 
                    replyBox ?  timeData == ""
                    ? {uri: srcData.path}
                    : { uri: srcData[0].file } :
                    { uri: srcData[0].file } :
                    timeData == ""
                      ? {uri: srcData.path}
                      : { uri: srcData[0].file } 
                }
                  seekColor={"#FF7300"}
                  disableBack={true}
                  disableVolume={true}
                  disableFullscreen={true}
                  // onError={err => console.log(err)}
                  paused={true}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: "100%",
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
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
                    ? chatType == 2
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

      {Platform.OS == "android" && !sender && !replyType ? (
        <View style={{ width: "10%", marginHorizontal: 20 }}>
          <Feather
            onPress={() =>
              navigationforword.navigate("videoPreview", {
                videoData: srcData[0].file,
              })
            }
            name="maximize-2"
            type="maximize-2"
            color={"#999999"}
            size={20}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default videoTemplate;
