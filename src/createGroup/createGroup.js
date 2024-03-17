import React, { useState, useEffect, useRef } from "react";
import {
  Platform,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { updateTab } from "../redux/TabSlice";
import { useSelector, useDispatch } from "react-redux";
import Notification from "../components/Notification";

const createGroup = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState([]);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [checkAdmin, setCheckAdmin] = useState(null);
  const [checkUsers, setCheckUsers] = useState(null);
  const [selectedAdminitem, setSelectedAdminitem] = useState(false);
  const [selectedUseritem, setSelectedUseritem] = useState(false);
  const [data, setData] = useState([]);
  const [refreshList, setRefreshList] = useState(false);
  const [primary, setPrimary] = useState("");
  const [secondry, setSecondry] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    setColorData();
    groupUsersList();
  }, [search]);

  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("dark-content", true);
    } else {
      StatusBar.setBarStyle("dark-content", true);
      StatusBar.setBackgroundColor(secondry);
    }
  }, []);

  const groupUsersList = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "get-guppy-group-users?offset=0" +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + JSON.parse(token),
        },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setOffset(20);
        setData(responseJson.guppyGroupUsers);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  const loadMore = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "get-guppy-group-users?offset=" +
        offset +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + JSON.parse(token),
        },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setOffset(offset + 20);
        let users = responseJson.guppyGroupUsers;
        setData(data.concat(users));
        setRefreshList(!refreshList);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const searchUsersData = (val) => {
    setSearch(val);
    setOffset(0);
  };
  const PushInArray = (item, index) => {
    setCheckUsers(index);
    if (selectedGroupUsers.includes(item.userId)) {
      const index = selectedGroupUsers.indexOf(item.userId);
      if (index > -1) {
        selectedGroupUsers.splice(index, 1);
        selectedGroupAdmin.splice(index, 1);
      }
      setSelectedUseritem(false);
    } else {
      selectedGroupUsers.push(item.userId);
      setSelectedUseritem(true);
    }
  };

  const PushInArrayAdmin = (item, index) => {
    setCheckAdmin(index);
    if (selectedGroupAdmin.includes(item.userId)) {
      const index = selectedGroupAdmin.indexOf(item.userId);
      if (index > -1) {
        selectedGroupAdmin.splice(index, 1);
      }
      setSelectedAdminitem(false);
    } else {
      selectedGroupAdmin.push(item.userId);
      setSelectedAdminitem(true);
    }
  };

  const setColorData = async () => {
    const primaryColor = await AsyncStorage.getItem("primaryColor");
    const secondaryColor = await AsyncStorage.getItem("secondaryColor");
    setPrimary(primaryColor);
    setSecondry(secondaryColor);
  };

  const createGroup = async () => {
    if (selectedGroupUsers.length >= 1 || selectedGroupAdmin.length >= 1) {
      const token = await AsyncStorage.getItem("token");
      const id = await AsyncStorage.getItem("id");

      const formData = new FormData();
      formData.append("userId", JSON.parse(id));
      formData.append("groupId", "");
      formData.append("disableReply", route.params.disableReplies);
      formData.append("groupTitle", route.params.title);
      formData.append("memberIds", selectedGroupUsers.toString());
      formData.append("adminIds", selectedGroupAdmin.toString());

      formData.append("removeImage", "");
      if (route.params.image != null) {
        formData.append("groupImage", {
          name: Platform.OS == "ios" ? route.params.image.filename : "name.jpg",
          type: route.params.image.mime,
          uri:
            Platform.OS == "ios"
              ? route.params.image.sourceURL
              : route.params.image.path,
          error: 0,
          size: JSON.parse(route.params.image.size),
        });
      }

      axios
        .post(CONSTANT.BaseUrl + "update-guppy-group", formData, {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        })
        .then(async (response) => {
          if (response.status === 200) {
            dispatch(updateTab("private_chats"));
            navigation.navigate("homeScreen");
          } else if (response.status === 203) {
            setStatusLoader(false);
          }
        })
        .catch((error) => {
        });
    } else {
      setShowAlert(true);
      setAlertType("error");
      setTitle("Oops!");
      setDesc("Must select atleast one member");
    }
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (data.length >= 20) {
        loadMore();
        onEndReachedCalledDuringMomentum.current = true;
      }
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: secondry, flex: 1 }}>
      <Notification
        show={showAlert}
        hide={hideAlert}
        type={alertType}
        title={title}
        desc={desc}
      />
      <View
        style={{
          height: 66,
          backgroundColor: secondry,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Ionicons
          onPress={() => navigation.goBack()}
          style={{ paddingHorizontal: 10, marginLeft: 5 }}
          name="chevron-back"
          type="chevron-back"
          color={"#fff"}
          size={25}
        />
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontFamily: "Urbanist-Bold",
          }}
        >
          Select group users
        </Text>
        <Text style={{ color: primary }}>*</Text>
      </View>
      <View
        style={{
          paddingVertical: 10,
          borderBottomColor: "#DDDDDD",
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          backgroundColor: "#fff",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text
            style={{
              marginVertical: 10,
              color: secondry,
              fontSize: 18,
              fontFamily: "Urbanist-Bold",
            }}
          >
            Select group users
          </Text>
          <Text style={{ color: primary }}>*</Text>
        </View>
        <View
          style={{
            height: 47,
            backgroundColor: "#ffffff",
            borderRadius: 5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            borderColor: "#DDDDDD",
            borderWidth: 1,
          }}
        >
          <Feather
            onPress={() => {}}
            style={{ paddingHorizontal: 15 }}
            name="search"
            type="search"
            color={"#727372"}
            size={15}
          />
          <TextInput
            style={{
              flex: 1,
              height: 45,
              fontSize: 16,
              paddingHorizontal: 4,
              color: "#000",
            }}
            placeholder={"Search user here"}
            placeholderTextColor={"#727372"}
            autoCorrect={false}
            textContentType="email_address"
            value={search}
            onChangeText={searchUsersData}
          />
        </View>
      </View>
      <View style={{ backgroundColor: "#fff", flex: 1 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          keyExtractor={(x, i) => i.toString()}
          onEndReached={() => onEndReachedHandler()}
          onEndReachedThreshold={0.1}
          onMomentumScrollBegin={() => {
            onEndReachedCalledDuringMomentum.current = false;
          }}
          extraData={refreshList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => PushInArray(item, index)}
              style={{ backgroundColor: "#fff" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: 5,
                  marginHorizontal: 20,
                  marginVertical: 5,
                  alignItems: "center",
                  alignContent: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",

                    alignContent: "center",
                  }}
                >
                  {selectedGroupUsers.includes(item.userId) ? (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: "#22C55E",
                        borderRadius: 4,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FontAwesome
                        name="check"
                        type="check"
                        color={"#fff"}
                        size={14}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderColor: "#DDDDDD",
                        borderWidth: 1,
                        borderRadius: 4,
                      }}
                    ></View>
                  )}
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 30 / 2,
                      marginLeft: 10,
                    }}
                    source={{
                      uri:
                        item.userAvatar.slice(0, 5) == "https"
                          ? item.userAvatar
                          : "https:" + item.userAvatar,
                    }}
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      color: secondry,
                      fontSize: 14,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    {item.userName}
                  </Text>
                </View>
                {selectedGroupUsers.includes(item.userId) ? (
                  <>
                    {selectedGroupAdmin.includes(item.userId) ? (
                      <TouchableOpacity
                        onPress={() => PushInArrayAdmin(item, index)}
                        style={{
                          backgroundColor: "#22C55E",
                          borderRadius: 4,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesome
                          style={{}}
                          name="check"
                          type="check"
                          color={"#fff"}
                          size={12}
                        />
                        <Text
                          style={{
                            color: "#ffff",
                            marginLeft: 5,
                            fontSize: 12,
                            fontFamily: "Urbanist-Bold",
                          }}
                        >
                          ADMIN
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => PushInArrayAdmin(item, index)}
                        style={{
                          borderColor: "#999999",
                          borderWidth: 0.5,
                          paddingHorizontal: 10,
                          borderRadius: 4,
                          paddingVertical: 5,
                          flexDirection: "row",
                        }}
                      >
                        <Text
                          style={{
                            color: "#999999",
                            fontSize: 12,
                            fontFamily: "Urbanist-Bold",
                          }}
                        >
                          MAKE ADMIN
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          onPress={() => createGroup()}
          style={{
            backgroundColor: primary,
            marginHorizontal: 20,
            alignItems: "center",
            borderRadius: 3,
            marginVertical: 15,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              marginVertical: 15,
              fontFamily: "Urbanist-Bold",
            }}
          >
            Create group
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default createGroup;
