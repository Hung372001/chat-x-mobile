import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import ListCard from "./home/listCard";
import { SearchBar } from "react-native-elements";
import RBSheet from "react-native-raw-bottom-sheet";
import Feather from "react-native-vector-icons/Feather";
import * as CONSTANT from "./constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUsers,
  updateUsersRequest,
  updateAutoInvite,
} from "./redux/mainListingSlice";

const contactList = () => {
  const users = useSelector((state) => state.listing.users);
  const usersRequest = useSelector((state) => state.listing.requestUsers);
  const translation = useSelector((state) => state.setting.translations);
  const settings = useSelector((state) => state.setting.settings);
  const autoInvite = useSelector((state) => state.listing.autoInvite);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [search, setSearch] = useState("");
  const [searchRequest, setSearchRequest] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [newData, setNewData] = useState([]);
  const [newDataRequest, setNewDataRequest] = useState([]);
  const [offset, setOffset] = useState(0);
  const [offsetRequest, setOffsetRequest] = useState(0);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [contactsTab, setContactsTab] = useState(true);
  const [loader, setLoader] = useState(false);
  const [statusRequest, setStatusRequest] = useState("");
  const [requestedUser, setRequestedUser] = useState("");
  const [indicator, setIndicator] = useState("");
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [spinner, setSpinner] = useState(true);
  const respondRequestRBSheet = useRef();
  const [acceptRequest, setAcceptRequest] = useState(false);

  useEffect(() => {
    // if(isFocused){
    // setOffset(0)
    fetchUserList();
    fetchUserRequestList();
    // }
  }, [searchOn, contactsTab]);

  useEffect(() => {
    setOffset(0);
    // fetchUserList();
  }, [acceptRequest]);

  const fetchUserList = async () => {
    setOffset(0);
    // setSpinner(true);
    newData.length = 0;
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-users?offset=0" +
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
        dispatch(updateAutoInvite(responseJson.autoInvite));
        Object.entries(responseJson.guppyUsers).map(([key, value]) => {
          newData.push(value);
        });
        dispatch(updateUsers(JSON.parse(JSON.stringify(newData))));
        setSpinner(false);
        newData.length = 0;
        setRefreshFlatList(!refreshFlatlist);
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };
  const loadMoreData = async () => {
    setLoader(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return (
      fetch(
        CONSTANT.BaseUrl +
          "load-guppy-users?offset=" +
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
        //Sending the currect offset with get request
        .then((response) => response.json())
        .then((responseJson) => {
          let storeData = JSON.parse(JSON.stringify(users));
          setOffset(offset + 20);
          Object.entries(responseJson.guppyUsers).map(([key, value]) => {
            storeData.push(value);
          });
          dispatch(updateUsers(JSON.parse(JSON.stringify(storeData))));
          setRefreshFlatList(!refreshFlatlist);
          setLoader(false);
        })
        .catch((error) => {
          console.error(error);
        })
    );
  };
  const fetchUserRequestList = async () => {
    setOffsetRequest(0);
    // setSpinner(true);
    newDataRequest.length = 0;
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-friend-requests?offset=0" +
        "&search=" +
        searchRequest +
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
        setOffsetRequest(20);
        setSpinner(false);

        Object.entries(responseJson.guppyFriendRequests).map(([key, value]) => {
          newDataRequest.push(value);
        });
        dispatch(
          updateUsersRequest(JSON.parse(JSON.stringify(newDataRequest)))
        );
        newDataRequest.length = 0;
        setRefreshFlatList(!refreshFlatlist);
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };
  const LoadMoreRequestList = async () => {
    setLoader(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-friend-requests?offset=" +
        offsetRequest +
        "&search=" +
        searchRequest +
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
        setOffsetRequest(offsetRequest + 20);
        let storeData = JSON.parse(JSON.stringify(usersRequest));
        Object.entries(responseJson.guppyFriendRequests).map(([key, value]) => {
          storeData.push(value);
        });
        dispatch(updateUsersRequest(JSON.parse(JSON.stringify(storeData))));
        setRefreshFlatList(!refreshFlatlist);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (contactsTab == true) {
        if (users.length >= 20) {
          loadMoreData();
          onEndReachedCalledDuringMomentum.current = true;
        }
      } else {
        if (usersRequest.length >= 20) {
          LoadMoreRequestList();
          onEndReachedCalledDuringMomentum.current = true;
        }
      }
    }
  };
  const changeStatus = (index) => {
    let storeData = JSON.parse(JSON.stringify(users));
    storeData[index].statusText = "sent";
    dispatch(updateUsers(JSON.parse(JSON.stringify(storeData))));
    setRefreshFlatList(!refreshFlatlist);
  };
  const showRespondSheet = (item) => {
    setStatusRequest("");
    var date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    setDateTime(strTime);
    setRequestedUser(item);
    if (item.statusText == "respond") {
      respondRequestRBSheet.current.open();
    }
  };
  const sendRequestresponse = async (val) => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    if (val == "1") {
      setIndicator("accept");
    } else if (val == "2") {
      setIndicator("decline");
    } else if (val == "3") {
      setIndicator("block");
    }
    axios
      .post(
        CONSTANT.BaseUrl + "update-user-status",
        {
          actionTo: requestedUser.userId,
          userId: JSON.parse(id),
          groupId: 0,
          statusType: val,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          fetchUserRequestList();
          setOffset(0);
          setAcceptRequest(!acceptRequest);
          if (val == "1") {
            respondRequestRBSheet.current.close();
          } else if (val == "2") {
            setStatusRequest("decline");
          } else if (val == "3") {
            setStatusRequest("blocked");
          }
          setIndicator("");
        } else if (response.status === 203) {
          setIndicator("");
        }
      })
      .catch((error) => {});
  };
  const searchUsersData = (val) => {
    setSearch(val);
    setOffset(0);
    setSearchOn(!searchOn);
  };
  const searchRequestUsersData = (val) => {
    setSearchRequest(val);
    setOffsetRequest(0);
    setSearchOn(!searchOn);
  };

  return (
    <SafeAreaView forceInset={{ bottom: "never" }} style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          paddingTop: 16.5,
        }}
      >
        <TouchableOpacity
          onPress={() => setContactsTab(true)}
          style={{
            flexDirection: "row",
            borderBottomColor: contactsTab == true ? "#FF7300" : "#ddd",
            borderBottomWidth: contactsTab == true ? 1.5 : 0.6,
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
            paddingBottom: 15,
          }}
        >
          <Feather
            name={"user"}
            size={15}
            color={contactsTab == true ? "#1C1C1C" : "#999999"}
          />
          <Text
            style={{
              color: contactsTab == true ? "#1C1C1C" : "#999999",
              fontSize: 15,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 10,
              marginRight: 10,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.contacts}
          </Text>
          {/* <View
            style={{
              backgroundColor: "#EF4444",
              width: 6,
              height: 6,
              borderRadius: 6 / 2,
              marginBottom: 5,
            }}
          ></View> */}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setContactsTab(false)}
          style={{
            flexDirection: "row",
            borderBottomColor: contactsTab == false ? "#FF7300" : "#ddd",
            borderBottomWidth: contactsTab == false ? 1.5 : 0.6,
            alignItems: "center",
            justifyContent: "center",
            width: "50%",
            paddingBottom: 15,
          }}
        >
          <Feather
            name={"user-plus"}
            size={15}
            color={contactsTab == false ? "#1C1C1C" : "#999999"}
          />
          <Text
            style={{
              color: contactsTab == false ? "#1C1C1C" : "#999999",
              fontSize: 15,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 10,
              marginRight: 10,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.requests_heading}
          </Text>
          {/* <View
            style={{
              backgroundColor: "#EF4444",
              width: 6,
              height: 6,
              borderRadius: 6 / 2,
              marginBottom: 5,
            }}
          ></View> */}
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: "#ddd",
          borderBottomWidth: 0.6,
          backgroundColor: "#fff",
          height: 62,
        }}
      >
        <Feather
          style={{ paddingLeft: 15, paddingRight: 10 }}
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
          placeholder={translation.search}
          autoCorrect={false}
          placeholderTextColor={"#727372"}
          textContentType="email_address"
          value={contactsTab ? search : searchRequest}
          onChangeText={contactsTab ? searchUsersData : searchRequestUsersData}
        />
      </View>
      {users && users.length >= 1 ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={contactsTab ? users : usersRequest}
            keyExtractor={(x, i) => i.toString()}
            extraData={refreshFlatlist}
            onEndReached={() => onEndReachedHandler()}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <View
                style={{
                  marginTop: "60%",
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{
                    width: 90,
                    height: 90,
                    //borderRadius: 55 / 2
                  }}
                  source={require("../assets/gallery/Vector.png")}
                />
                <Text
                  style={{
                    color: "#999999",
                    fontSize: 18,
                    marginTop: 10,
                    fontFamily: "Urbanist-Regular",
                  }}
                >
                  {translation.no_results}
                </Text>
              </View>
            }
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => showRespondSheet(item)}
              >
                <ListCard
                  index={index}
                  item={item}
                  image={item.userAvatar}
                  name={item.userName}
                  type={autoInvite ? "start" : item.statusText}
                  sendTo={item.chatId}
                  status={changeStatus}
                  respondStatus={showRespondSheet}
                />
              </TouchableOpacity>
            )}
          />
          {loader == true && (
            <View style={{ marginBottom: 20 }}>
              <BarIndicator
                count={5}
                size={20}
                color={settings?.chatSetting?.secondaryColor}
              />
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spinner == false ? (
            <>
              <Image
                style={{
                  width: 90,
                  height: 90,
                  //borderRadius: 55 / 2
                }}
                source={require("../assets/gallery/Vector.png")}
              />
              <Text
                style={{
                  color: "#999999",
                  fontSize: 18,
                  marginTop: 10,
                  fontFamily: "Urbanist-Regular",
                }}
              >
                {translation.no_results}
              </Text>
            </>
          ) : (
            <UIActivityIndicator
              size={35}
              color={settings?.chatSetting?.secondaryColor}
            />
          )}
        </View>
      )}
      <RBSheet
        ref={respondRequestRBSheet}
        height={Dimensions.get("window").height * 0.8}
        duration={250}
        customStyles={{
          container: {
            backgroundColor: "transparent",
            paddingHorizontal: 15,
            paddingBottom: 20,
          },
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
          }}
        >
          <View style={{ width: "100%", height: "95%", alignItems: "center" }}>
            {statusRequest == "" && (
              <View
                style={{
                  width: "85%",
                  // height: "70%",
                  backgroundColor: "#fff",
                  marginTop: 30,
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  paddingHorizontal: 15,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: 30,
                  }}
                >
                  <Image
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 4,
                    }}
                    source={require("../assets/warning.png")}
                  />
                </View>
                <Text
                  style={{
                    color: settings?.chatSetting?.secondaryColor,
                    fontSize: 24,
                    fontFamily: "Urbanist-Bold",
                    textAlign: "center",
                  }}
                >
                  {requestedUser.userName}
                </Text>
                <Text
                  style={{
                    color: settings?.chatSetting?.secondaryColor,
                    fontSize: 15,
                    fontFamily: "OpenSans-Regular",
                    textAlign: "center",
                    lineHeight: 28,
                  }}
                >
                  {translation.invitation_top_desc}
                </Text>

                <TouchableOpacity
                  onPress={() => sendRequestresponse("1")}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    height: 50,
                    backgroundColor: "#22C55E",
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 5,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Urbanist-Bold",
                      color: "#fff",
                    }}
                  >
                    {translation.accept_invite}
                  </Text>
                  {indicator == "accept" && (
                    <View style={{ marginLeft: 15 }}>
                      <SkypeIndicator count={7} size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => sendRequestresponse("2")}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    height: 50,
                    backgroundColor: "#EF4444",
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 5,
                    marginVertical: 5,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Urbanist-Bold",
                      color: "#fff",
                    }}
                  >
                    {translation.decline_invite}
                  </Text>
                  {indicator == "decline" && (
                    <View style={{ marginLeft: 15 }}>
                      <SkypeIndicator count={7} size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                <View
                  style={{
                    height: Dimensions.get("window").height / 18,
                    padding: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: 5,
                    flexDirection: "row",
                  }}
                >
                  <Text
                    onPress={() => sendRequestresponse("3")}
                    style={{
                      fontSize: 18,
                      fontFamily: "Urbanist-Bold",

                      color: "#999999",
                    }}
                  >
                    {translation.block_user}
                  </Text>
                  {indicator == "block" && (
                    <View style={{ marginLeft: 15 }}>
                      <SkypeIndicator count={7} size={20} color="#000" />
                    </View>
                  )}
                </View>
              </View>
            )}
            {statusRequest == "decline" && (
              <View
                style={{
                  width: "80%",
                  height: "65%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    marginTop: 50,
                    borderRadius: 10,
                    shadowOffset: { width: 0, height: 1 },
                    shadowColor: "#000000",
                    shadowOpacity: 0.1,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      width: "90%",
                      paddingVertical: 15,
                      borderRadius: 5,
                      elevation: 3,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "OpenSans-Bold",
                        lineHeight: 25,
                        fontSize: 15,
                        color: "#999999",
                      }}
                    >
                      {translation.decline_invite}
                    </Text>
                    <Text
                      style={{
                        margin: 10,
                        fontFamily: "OpenSans-Regular",
                        lineHeight: 25,
                        fontSize: 15,
                        color: "#999999",
                      }}
                    >
                      {translation.decline_user}
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginHorizontal: 15,
                      fontFamily: "OpenSans-Regular",
                      lineHeight: 25,
                      fontSize: 13,
                      color: "#999999",
                    }}
                  >
                    {dateTime}
                  </Text>
                </View>
              </View>
            )}
            {statusRequest == "blocked" && (
              <View
                style={{
                  width: "80%",
                  height: "65%",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    marginTop: 50,
                    borderRadius: 10,
                    shadowOffset: { width: 0, height: 1 },
                    shadowColor: "#000000",
                    shadowOpacity: 0.1,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      width: "90%",
                      paddingVertical: 15,
                      borderRadius: 5,
                      elevation: 3,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "OpenSans-Bold",
                        lineHeight: 25,
                        fontSize: 15,
                        color: "#999999",
                      }}
                    >
                      {translation.blocked}
                    </Text>
                    <Text
                      style={{
                        margin: 10,
                        fontFamily: "OpenSans-Regular",
                        lineHeight: 25,
                        fontSize: 15,
                        color: "#999999",
                      }}
                    >
                      {translation.blocked_user_message}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            <View
              style={{
                width: "80%",
                // height: "20%",
                marginTop: 40,
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  width: "80%",
                  marginTop: 10,
                  marginBottom: 5,
                  borderTopRightRadius: 13,
                  borderTopLeftRadius: 13,
                  borderBottomLeftRadius: 13,
                  elevation: 3,
                  shadowOffset: { width: 0, height: 1 },
                  shadowColor: "#000000",
                  shadowOpacity: 0.1,
                }}
              >
                <Text
                  style={{
                    margin: 10,
                    fontFamily: "OpenSans-Regular",
                    lineHeight: 25,
                    fontSize: 15,
                    color: settings?.chatSetting?.secondaryColor,
                  }}
                >
                  {translation.invitaion_bottom_desc}
                </Text>
              </View>
              {/* <Text
              style={{
                marginHorizontal: 15,
                fontFamily: "OpenSans-Regular",
                lineHeight: 25,
                fontSize: 13,
                color: "#999999"
              }}
            >
              9:23 am
            </Text> */}
            </View>
          </View>
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

export default contactList;
