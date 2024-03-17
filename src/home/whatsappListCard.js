import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  ImageBackground,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Button, Tooltip } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { useSelector, useDispatch } from "react-redux";
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  BarIndicator,
} from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";
var moments = require("moment-timezone");

const whatsappListCard = (props) => {
  const [statusLoader, setStatusLoader] = useState(false);
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const [dateTime, setDateTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const navigationforword = useNavigation();
  const [GMT, setGMT] = useState("");
  const [endTime, setEndTime] = useState("");
  const [whatsappOnline, setWhatsappOnline] = useState(false);

  useEffect(() => {
      getTimeZone();

  }, []);


  const getTimeZone = () => {
    let utcDate = moments.utc().format("YYYY-MM-DD HH:mm:ss"); // in utc
    let utcCutoff = moments.utc(utcDate, "YYYYMMDD HH:mm:ss");

    let timeZoneDate = utcCutoff.clone().tz(props.item.usertimeZone);
    let timeZoneDay = timeZoneDate.format("dddd").toLowerCase();
    let currentDate = timeZoneDate.format("YYYY-MM-DD");
    let currentDatetime = timeZoneDate.format("YYYY-MM-DD HH:mm:ss");

    let currentDay = props.item.availableTime[timeZoneDay];
    let isOnline = false;
    let GMTTimezone = 0;
    if (currentDay) {
      let startDateTime = `${currentDate} ${currentDay["start_time"]}`;
      let endDateTime = `${currentDate} ${currentDay["end_time"]}`;
      isOnline = moments(currentDatetime).isBetween(startDateTime, endDateTime);

      let currentTimeZone = moments.tz.guess();
      let currentUtcCutoff = utcCutoff.clone().tz(currentTimeZone, true);

      let userTimeZoneCutOff = Number(timeZoneDate.format("Z").split(":")[0]);
      let currentTimeZoneCutOff = Number(
        currentUtcCutoff.format("Z").split(":")[0]
      );

      let timeZoneDiff = currentTimeZoneCutOff - userTimeZoneCutOff;
      GMTTimezone = timeZoneDiff * -1;
      setGMT(GMTTimezone);
      let currentZoneDate = currentUtcCutoff.format("YYYY-MM-DD");
      let _startDateTime = `${currentZoneDate} ${currentDay["start_time"]}`;
      let _endDateTime = `${currentZoneDate} ${currentDay["end_time"]}`;
      setStartTime(moments(_startDateTime).format("hh:mm A"));
      setEndTime(moments(_endDateTime).format("hh:mm A"));
    }
    setWhatsappOnline(isOnline);
  };


  return (
    <TouchableOpacity
    activeOpacity={0.8}
    onPress={() =>
        navigationforword.navigate("whatsappSupport", {
          item: props.item,
          online: whatsappOnline
        })
      }
      style={{
        backgroundColor:whatsappOnline ? "#fff" : "#F7F7F7",
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
          }}
        >
          <View>
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
            {props.whatsapp ? (
              <View
                style={{
                  marginTop: -22,
                  zIndex: 1,
                  height: 30,
                  width: 30,
                  marginRight: -8,
                  borderColor: "#fff",
                  borderWidth: 3,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: whatsappOnline ? "#22C55E" : "#999999",
                  borderRadius: 30 / 2,
                  alignSelf: "flex-end",
                }}
              >
                <Icon name={"whatsapp"} size={16} color={"#fff"} />
              </View>
            ) : null}
          </View>

          <View style={{ marginLeft: props.whatsapp ? 10 : 0 }}>
            {props.whatsapp && (
              <Text
                style={{
                  marginLeft: 10,
                  color: "#3C57E5",
                  fontSize: 13,
                  lineHeight: 18,
                  letterSpacing: 0.5,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                {props.item.userDesignation}
              </Text>
            )}
            <Text
              style={{
                marginLeft: 10,
                color: settings.chatSetting.secondaryColor,
                fontSize: 15,
                lineHeight: 21,
                letterSpacing: 0.5,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {props.name.substring(0, 15)}
              {props.name.length > 15 && "..."}
            </Text>
            {props.whatsapp && (
              <>
                {GMT != "" ? (
                  <Text
                    style={{
                      marginLeft: 10,
                      color: "#64748B",
                      fontSize: 13,
                      lineHeight: 18,
                      letterSpacing: 0.5,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    {startTime} - {endTime} GMT {GMT}
                  </Text>
                ) : (
                  <Text
                    style={{
                      marginLeft: 10,
                      color: "#64748B",
                      fontSize: 13,
                      lineHeight: 18,
                      letterSpacing: 0.5,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    {translation.offline}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
          
      </View>
     
    </TouchableOpacity>
  );
};

export default whatsappListCard;
