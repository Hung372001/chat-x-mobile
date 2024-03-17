import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import AudioPreview from "./audioPreview";
import DocumentPreview from "./documentPreview";
import MusicPreview from "./musicPreview";
import MapPreview from "./mapPreview";
import VideoTemplate from "./videoTemplate";
import SimpleMessage from "./simpleMessage";

mediaMessage = ({
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
  const [sendingImage, setSendingImage] = useState(false);

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
    setSendingImage(true);
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
          alignItems:
            sender == true
              ? replyType
                ? "flex-start"
                : "flex-end"
              : "flex-start",
        }}
      >
        <View>
          <View
            style={{
              backgroundColor: replyType == true ? null : "#fff",
              width:
                replyType == true
                  ? srcData.length > 2
                    ? "95%"
                    : srcData.length < 2
                    ? "50%"
                    : "75%"
                  : reply
                  ? "75%"
                  : srcData.length > 2
                  ? "75%"
                  : srcData.length < 2
                  ? "25%"
                  : "50%",
              marginHorizontal: replyType ? 0 : 15,
              marginTop: replyType ? 0 : 10,
              marginBottom: replyType ? 0 : 5,
              borderTopRightRadius: 13,
              borderTopLeftRadius: sender == true ? 13 : 0,
              borderBottomRightRadius: sender == true ? 0 : 13,
              borderBottomLeftRadius: 13,
              elevation: replyType ? 0 : 3,
              shadowOffset: { width: 0, height: 1 },
              shadowColor: "#000000",
              shadowOpacity: 0.1,
              paddingHorizontal: reply
                ? chatType == "2"
                  ? 5
                  : 10
                : srcData.length < 2
                ? replyType
                  ? 0
                  : 10
                : 0,
              paddingVertical: replyType ? 5 : chatType == "2" ? 5 : 10,
            }}
          >
            {reply != null && data_item != undefined ? (
              <>
                {(sender != true && chatType == 2) && (
                  <Text
                    style={{
                      paddingBottom: 5,
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
                      marginHorizontal: 5,
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
                      paddingBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#f7f7f7",
                      borderRadius: 4,
                      marginHorizontal: 5,
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
                          flexDirection: "row",
                          justifyContent: "flex-start",
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            width:
                              data_item.replyMessage.attachmentsData.attachments
                                .length > 2
                                ? 60
                                : data_item.replyMessage.attachmentsData
                                    .attachments.length < 2
                                ? reply
                                  ? 60
                                  : "100%"
                                : reply
                                ? 60
                                : "45%",
                            height: reply ? 60 : 90,
                            borderRadius: 5,
                            marginTop: reply ? 10 : 0,
                            marginRight: reply ? 7 : 0,
                          }}
                          onPress={() =>
                            data_item.replyMessage.attachmentsData.attachments
                              .length > 1
                              ? navigationforword.navigate(
                                  "imagesListPreview",
                                  {
                                    imagesData: JSON.stringify(
                                      data_item.replyMessage.attachmentsData
                                        .attachments
                                    ),
                                    isSend: false
                                  }
                                )
                              : navigationforword.navigate("imagePreview", {
                                  image: JSON.stringify(
                                    data_item.replyMessage.attachmentsData
                                      .attachments[0]
                                  ),
                                  isSend: false
                                })
                          }
                        >
                          <Image
                            // resizeMode={"contain"}
                            style={{
                              width: reply ? 60 : "100%",
                              height: reply ? 60 : 90,
                              borderRadius: 5,
                            }}
                            source={{
                              uri:data_item.replyMessage.attachmentsData
                                    .attachments[0].thumbnail,
                            }}
                          />
                        </TouchableOpacity>
                        {data_item.replyMessage.attachmentsData.attachments
                          .length > 1 && (
                          <TouchableOpacity
                            style={{
                              width:
                                data_item.replyMessage.attachmentsData
                                  .attachments.length > 2
                                  ? 60
                                  : data_item.replyMessage.attachmentsData
                                      .attachments.length < 2
                                  ? reply
                                    ? "75%"
                                    : "100%"
                                  : reply
                                  ? 60
                                  : "45%",
                              height: reply ? 60 : 90,
                              borderRadius: 5,
                              marginTop: reply ? 10 : 0,
                              marginRight: reply ? 7 : 0,
                            }}
                            onPress={() =>
                              navigationforword.navigate("imagesListPreview", {
                                imagesData: JSON.stringify(
                                  data_item.replyMessage.attachmentsData
                                    .attachments
                                ),
                                isSend: false
                              })
                            }
                          >
                            <Image
                              // resizeMode={"contain"}
                              style={{
                                width: reply ? 60 : "100%",
                                height: reply ? 60 : 90,
                                borderRadius: 5,
                              }}
                              source={{
                                uri:data_item.replyMessage.attachmentsData
                                      .attachments[1].thumbnail,
                              }}
                            />
                          </TouchableOpacity>
                        )}
                        {data_item.replyMessage.attachmentsData.attachments
                          .length == 3 && (
                          <TouchableOpacity
                            style={{
                              width:
                                data_item.replyMessage.attachmentsData
                                  .attachments.length > 2
                                  ? 60
                                  : data_item.replyMessage.attachmentsData
                                      .attachments.length < 2
                                  ? "100%"
                                  : "45%",
                              height: reply ? 60 : 90,
                              borderRadius: 5,
                              marginTop: reply ? 10 : 0,
                            }}
                            onPress={() =>
                              navigationforword.navigate("imagesListPreview", {
                                imagesData: JSON.stringify(
                                  data_item.replyMessage.attachmentsData
                                    .attachments
                                ),
                                isSend: false
                              })
                            }
                          >
                            <Image
                              // resizeMode={"contain"}
                              style={{
                                width: reply ? 60 : "100%",
                                height: reply ? 60 : 90,
                                borderRadius: 5,
                              }}
                              source={{
                                uri:data_item.replyMessage.attachmentsData
                                      .attachments[2].thumbnail,
                              }}
                            />
                          </TouchableOpacity>
                        )}
                        {data_item.replyMessage.attachmentsData.attachments
                          .length > 3 && (
                          <TouchableOpacity
                            style={{
                              width:
                                data_item.replyMessage.attachmentsData
                                  .attachments.length > 3
                                  ? 60
                                  : data_item.replyMessage.attachmentsData
                                      .attachments.length < 2
                                  ? "100%"
                                  : "45%",
                              height: reply ? 60 : 90,
                              borderRadius: 5,
                              marginTop: reply ? 10 : 0,
                              overflow: "hidden",
                            }}
                            onPress={() =>
                              navigationforword.navigate("imagesListPreview", {
                                imagesData: JSON.stringify(
                                  data_item.replyMessage.attachmentsData
                                    .attachments
                                ),
                                isSend: false
                              })
                            }
                          >
                            <View
                              style={{
                                width: "100%",
                              }}
                            >
                              <ImageBackground
                                // resizeMode={"contain"}
                                style={{
                                  width: reply ? 60 : "100%",
                                  height: reply ? 60 : 90,
                                  borderRadius: 5,
                                }}
                                source={{
                                  uri: data_item.replyMessage.attachmentsData
                                        .attachments[2].thumbnail,
                                }}
                              >
                                <View
                                  style={{
                                    flex: 1,
                                    backgroundColor: "#00000070",
                                    borderRadius: 5,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#fff",
                                      fontSize: 25,
                                      fontFamily: "Urbanist-Regular",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {"+"}
                                    {data_item.replyMessage.attachmentsData
                                      .attachments.length - 3}
                                  </Text>
                                </View>
                              </ImageBackground>
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
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
                      marginHorizontal: 5,
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
                      marginHorizontal: 5,
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
                      marginHorizontal: 5,
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
                      marginHorizontal: 5,
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
                      marginHorizontal: 5,
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
            <View
              style={{
                width: replyType ? "90%" : "100%",
                flexDirection: "row",
                justifyContent: replyType
                  ? "flex-start"
                  : reply
                  ? "flex-start"
                  : "space-evenly",
                paddingVertical: replyType ? 5 : 0,
                paddingHorizontal: reply ? 5 : 0,
              }}
            >
              <TouchableOpacity
                style={{
                  width:
                    srcData.length > 2
                      ? "30%"
                      : srcData.length < 2
                      ? reply
                        ? "30%"
                        : "100%"
                      : reply
                      ? "30%"
                      : "40%",
                  height: replyType ? 60 : 90,
                  borderRadius: 5,
                  marginTop: reply ? 10 : 0,
                  marginRight: reply ? 5 : 0,
                }}
                onPress={() =>
                  srcData.length > 1
                    ? navigationforword.navigate("imagesListPreview", {
                        imagesData: JSON.stringify(srcData),
                        isSend: sendingImage
                      })
                    : navigationforword.navigate("imagePreview", {
                        image: JSON.stringify(srcData[0]),
                        isSend: sendingImage
                      })
                }
              >
                <Image
                  // resizeMode={"contain"}
                  style={{
                    width: replyType ? 60 : "100%",
                    height: replyType ? 60 : 90,
                    borderRadius: 5,
                  }}
                  source={{
                    uri: replyType ? 
                    replyBox ?  sendingImage
                    ? Platform.OS == "ios"
                      ? srcData[0].sourceURL
                      : srcData[0].path
                    : srcData[0].thumbnail :
                    srcData[0].thumbnail :
                    sendingImage
                      ? Platform.OS == "ios"
                        ? srcData[0].sourceURL
                        : srcData[0].path
                      : srcData[0].thumbnail  ,
                  }}
                />
              </TouchableOpacity>
              {srcData.length > 1 && (
                <TouchableOpacity
                  style={{
                    width:
                      srcData.length > 2
                        ? "30%"
                        : srcData.length < 2
                        ? reply
                          ? "75%"
                          : "100%"
                        : reply
                        ? "30%"
                        : "45%",
                    height: replyType ? 60 : 90,
                    borderRadius: 5,
                    marginTop: reply ? 10 : 0,
                    marginRight: reply ? 5 : 0,
                  }}
                  onPress={() =>
                    navigationforword.navigate("imagesListPreview", {
                      imagesData: JSON.stringify(srcData),
                      isSend: sendingImage
                    })
                  }
                >
                  <Image
                    // resizeMode={"contain"}
                    style={{
                      width: replyType ? 60 : "100%",
                      height: replyType ? 60 : 90,
                      borderRadius: 5,
                    }}
                    source={{
                        uri: replyType ? 
                        replyBox ?  sendingImage
                        ? Platform.OS == "ios"
                          ? srcData[1].sourceURL
                          : srcData[1].path
                        : srcData[1].thumbnail :
                        srcData[1].thumbnail :
                        sendingImage
                          ? Platform.OS == "ios"
                            ? srcData[1].sourceURL
                            : srcData[1].path
                          : srcData[1].thumbnail  ,
                    }}
                  />
                </TouchableOpacity>
              )}
              {srcData.length == 3 && (
                <TouchableOpacity
                  style={{
                    width:
                      srcData.length > 2
                        ? "30%"
                        : srcData.length < 2
                        ? "100%"
                        : "45%",
                    height: replyType ? 60 : 90,
                    borderRadius: 5,
                    marginTop: reply ? 10 : 0,
                  }}
                  onPress={() =>
                    navigationforword.navigate("imagesListPreview", {
                      imagesData: JSON.stringify(srcData),
                      isSend: sendingImage
                    })
                  }
                >
                  <Image
                    // resizeMode={"contain"}
                    style={{
                      width: replyType ? 60 : "100%",
                      height: replyType ? 60 : 90,
                      borderRadius: 5,
                    }}
                    source={{
                      uri: replyType ? 
                      replyBox ?  sendingImage
                      ? Platform.OS == "ios"
                        ? srcData[2].sourceURL
                        : srcData[2].path
                      : srcData[2].thumbnail :
                      srcData[2].thumbnail :
                      sendingImage
                        ? Platform.OS == "ios"
                          ? srcData[2].sourceURL
                          : srcData[2].path
                        : srcData[2].thumbnail  ,
                  }}
                  />
                </TouchableOpacity>
              )}
              {srcData.length > 3 && (
                <TouchableOpacity
                  style={{
                    width:
                      srcData.length > 3
                        ? "30%"
                        : srcData.length < 2
                        ? "100%"
                        : "45%",
                    height: replyType ? 60 : 90,
                    borderRadius: 5,
                    marginTop: reply ? 10 : 0,
                    overflow: "hidden",
                  }}
                  onPress={() =>
                    navigationforword.navigate("imagesListPreview", {
                      imagesData: JSON.stringify(srcData),
                      isSend: sendingImage
                    })
                  }
                >
                  <View
                    style={{
                      width: "100%",
                    }}
                  >
                    <ImageBackground
                      // resizeMode={"contain"}
                      style={{
                        width: replyType ? 60 : "100%",
                        height: replyType ? 60 : 90,
                        borderRadius: 5,
                      }}
                      source={{
                        uri: replyType ? 
                        replyBox ?  sendingImage
                        ? Platform.OS == "ios"
                          ? srcData[2].sourceURL
                          : srcData[2].path
                        : srcData[2].thumbnail :
                        srcData[2].thumbnail :
                        sendingImage
                          ? Platform.OS == "ios"
                            ? srcData[2].sourceURL
                            : srcData[2].path
                          : srcData[2].thumbnail  ,
                    }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#00000070",
                          borderRadius: 5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 25,
                            fontFamily: "Urbanist-Regular",
                            fontWeight: "700",
                          }}
                        >
                          {"+"}
                          {srcData.length - 3}
                        </Text>
                      </View>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              )}
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
                      ?  chatType == 2
                      ?data_item.messageSeenIds && data_item.messageSeenIds.length >= 1
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
      </View>
    </SafeAreaView>
  );
};

export default mediaMessage;
