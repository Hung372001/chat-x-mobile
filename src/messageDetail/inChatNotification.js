import React, { useState, useEffect } from "react";
import { View, SafeAreaView, Text, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

inChatNotification = ({
  data_item,
  user,
  messageData,
  timeData,
  sender,
  chatType,
  members,
}) => {
  const [dateTime, setDateTime] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [membersUpdate, setMembersUpdate] = useState([]);
  //   const [dateTime, setDateTime] = useState("");
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);

  useEffect(() => {
    messageText(data_item, chatType, messageData, members);
    if (members != undefined && members != null) {
      Object.entries(members).map(([key, value]) => {
        membersUpdate.push(value);
      });
    }
    if (timeData == "") {
      getCurrentTime();
    } else {
      getMessageTime(timeData);
    }
  }, []);
  const messageText = (data_item, type, messageData, members) => {
    if (data_item != null) {
      let data = data_item;
      let chatType = type;
      let notifymessageData = data_item.message;
      let notifyType = Number(messageData.type);
      let membersUpdate = members;
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
          // 4-> Leave Group Member
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
        // for one to one chat
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
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            maxWidth: "75%",
            marginTop: 10,
            marginBottom: 5,
            borderRadius: 8,
            elevation: 3,
            shadowOffset: { width: 0, height: 1 },
            shadowColor: "#000000",
            shadowOpacity: 0.1,
            paddingHorizontal: 5,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              ellipsizeMode="tail"
              style={{
                margin: 5,
                fontFamily: "OpenSans-Regular",
                lineHeight: 25,
                fontSize: 10,
                letterSpacing: 0.5,
                color: "#999999",
                textAlign: "center",
              }}
            >
              {notificationMessage}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 15,
            marginVertical: 5,
          }}
        >
          <Text
            style={{
              fontFamily: "OpenSans-Regular",
              fontSize: 10,
              lineHeight: 18,
              letterSpacing: 0.5,
              color: "#999999",
            }}
          >
            {dateTime}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default inChatNotification;
