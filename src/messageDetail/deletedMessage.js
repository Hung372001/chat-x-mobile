import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";

deletedMessage = ({ timeData, sender, messageStat, chatType, data_item }) => {
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    getMessageTime(timeData);
  }, []);

  const getMessageTime = (timeData) => {
    const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let date = null;
    const time = new Date(parseInt(timeData) * 1000);
    const currentTimestamp = Date.now();
    const diffTimestamp = currentTimestamp - time;
    if (diffTimestamp < 24 * 60 * 60 * 1000) {
      let hours = time.getHours();
      let minutes = time.getMinutes();
      hours %= 12;
      hours = hours || 12;
      minutes = minutes < 10 ? `0${minutes}` : minutes;
      const ampm = time.getHours() >= 12 ? "pm" : "am";
      date = hours + ":" + minutes + " " + ampm;
    } else if (diffTimestamp < 48 * 60 * 60 * 1000) {
      date = "Yesterday";
    } else if (diffTimestamp < 7 * 24 * 60 * 60 * 1000) {
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
            backgroundColor: "#fff",
            width: "75%",
            marginHorizontal: 15,
            marginTop: 10,
            marginBottom: 5,
            borderTopRightRadius: 13,
            borderTopLeftRadius: sender == true ? 13 : 0,
            borderBottomRightRadius: sender == true ? 0 : 13,
            borderBottomLeftRadius: 13,
            elevation: 3,
            shadowOffset: { width: 0, height: 1 },
            shadowColor: "#000000",
            shadowOpacity: 0.1,
          }}
        >
          {(chatType == "2" && sender != true) && (
            <Text
              style={{
                paddingTop: 10,
                marginHorizontal: 10,
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
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Feather
              style={{ paddingLeft: 10 }}
              name="slash"
              type="slash"
              color={"#999999"}
              size={20}
            />

            <Text
              style={{
                margin: chatType == "2" ? 5 : 10,
                fontFamily: "OpenSans-Regular",
                lineHeight: 25,
                fontSize: 13,
                color: "#999999",
              }}
            >
              This message was deleted
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: sender == true ? "flex-end" : "flex-start",
            marginHorizontal: 5,
          }}
        >
          <Text
            style={{
              marginRight: 10,
              marginLeft: sender ? 0 : 10,
              marginHorizontal: 5,
              fontFamily: "OpenSans-Regular",
              fontSize: 11,
              color: "#999999",
              marginBottom: 5,
            }}
          >
            {dateTime}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default deletedMessage;
