import { View, Text, TouchableOpacity } from "react-native";
import React, { useState,useEffect } from "react";
import Feather from "react-native-vector-icons/Feather";
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
} from "react-native-popup-dialog";

const Notification = ({ show, hide, type, title, desc ,time}) => {
  
  return (
    <View>
      <Dialog
        dialogStyle={{
          marginHorizontal: 20,
          backgroundColor: "#fff",
          width: "75%",
          borderColor: "#DDDDDD",
          borderWidth: 1,
        }}
        visible={show}
        onTouchOutside={() => {
          hide();
        }}
        footer={
          <DialogFooter>
            {!time && (
              <DialogButton
                textStyle={{ fontSize: 15, fontWeight: "700", color: "#000" }}
                text={"Cancel"}
                onPress={() => hide()}
              />
            )}
          </DialogFooter>
        }
      >
        <DialogContent>
          <View style={{ height: 20 }}></View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Feather
              style={{ marginBottom: 5 }}
              name={type == "success" ? "check-circle" : "alert-circle"}
              size={40}
              color={type == "success" ? "#22C55E" : "#EF4444"}
            />
            <Text
              style={{
                fontSize: 18,
                lineHeight: 26,
                fontFamily: "Urbanist-Bold",
                letterSpacing: 0.5,
                marginRight: 10,
                color: "#1C1C1C",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 15,
                lineHeight: 24,
                fontFamily: "OpenSans-Medium",
                letterSpacing: 0.5,
                color: "#1C1C1C",
                textAlign: "center",
                paddingLeft: 10,
              }}
            >
              {desc}
            </Text>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
};

export default Notification;
