import React, { useState, useEffect, useRef, useReducer } from "react";
import {
  View,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Text,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  PermissionsAndroid,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from "react-native-audio-recorder-player";
import axios from "axios";
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
} from "react-native-popup-dialog";
import DocumentPicker from "react-native-document-picker";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import Geolocation from "@react-native-community/geolocation";
import ImagePicker from "react-native-image-crop-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import MapView, { Marker } from "react-native-maps";
import RBSheet from "react-native-raw-bottom-sheet";
import RNFetchBlob from "rn-fetch-blob";
import SoundPlayer from "react-native-sound-player";
import { TouchableRipple } from "react-native-paper";
import { useIsFocused } from "@react-navigation/native";
import { UIActivityIndicator, WaveIndicator } from "react-native-indicators";
import * as CONSTANT from "../constant/constant";
import AudioPreview from "./audioPreview";
import DeletedMessage from "./deletedMessage";
import { useSelector, useDispatch } from "react-redux";
import DocumentPreview from "./documentPreview";
import MapPreview from "./mapPreview";
import MediaMessage from "./mediaMessage";
import MessageDetailHeader from "../header/messageDetailHeader";
import MusicPreview from "./musicPreview";
import SimpleMessage from "./simpleMessage";
import VideoTemplate from "./videoTemplate";
import InChatNotification from "./inChatNotification";
import Pusher from "pusher-js/react-native";
import SocketioService from "../socketio/socketio.service";
import { set } from "immer/dist/internal";

const messageDetail = ({ route, navigation }) => {
  // however you detect new items
  const socketService = SocketioService;
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const settings = useSelector((state) => state.setting.settings);
  const chatMessages = useSelector((state) => state.messages.chatMessages);
  const translation = useSelector((state) => state.setting.translations);
  const flatlistRef = useRef(null);
  const refVoiceRBSheet = useRef();
  const dispatch = useDispatch();
  const refPickerRBSheet = useRef();
  const audioRecorderPlayer = new AudioRecorderPlayer();
  const [data, setData] = useState([]);
  const [mediaAttachment, setMediaAttachment] = useState([]);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [reload, setReload] = useState(false);
  const [request, setRequest] = useState("");
  const [statusRequest, setStatusRequest] = useState("");
  const [showSend, setShowSend] = useState(false);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState("");
  const [selectedItemAttachments, setSelectedItemAttachments] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedMedia, setSelectedMedia] = useState("");
  const [multiImages, setMultiImages] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapInfo, setMapInfo] = useState([]);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setlongitude] = useState(0);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [replayType, setReplayType] = useState(null);
  const [messageId, setMessageId] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scrollEnd, setScrollEnd] = useState(true);
  const [play, setPlay] = useState(true);
  const [pause, setPause] = useState(false);
  const [notificationBell, setNotificationBell] = useState("");
  const [ring, setRing] = useState(false);
  const [mute, setMute] = useState(false);
  const [editableField, setEditableField] = useState(false);
  const [selectedSenderType, setSelectedSenderType] = useState("");
  const [selectedMessageType, setSelectedMessageType] = useState("");
  const [name, setName] = useState("");
  const [user_avatar, setAvatar] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingId, setTypingId] = useState("");
  const [typingType, setTypingType] = useState("");
  const [typingName, setTypingName] = useState("");
  const [typingSenderId, setTypingSenderId] = useState("");
  const [typingText, setTypingText] = useState("");
  const [seenMessagesIds, setSeenMessagesIds] = useState([]);
  const [updateSeen, setUpdateSeen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [network, setNetwork] = useState('')
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchMessageList();
    fetchUserProfile();
  }, []);

  function unsubscribe() {
    NetInfo.fetch().then(state => {
      setNetwork(state)
      setTimeout(function () {
        if (state.isConnected) {
          // any thing you want to load before navigate home screen
        } else {
          (false)
        }
      }, 500);
    })
  };

  useEffect(() => {
    if (data.length >= 1) {
      setOffset(data[0].messageId);
    }
  }, [reload]);

  useEffect(() => {
    if (isFocused) {
      updateMessagesStatus();
    }
  }, [updateSeen, isFocused]);

  const pusherData = async (messages) => {
    const id = await AsyncStorage.getItem("id");
    const pusherEnable = await AsyncStorage.getItem("pusherEnable");
    const key = await AsyncStorage.getItem("pusherKey");
    const cluster = await AsyncStorage.getItem("pusherCluster");

    if (pusherEnable == "true") {
      let pusher = new Pusher(key, {
        cluster: cluster,
        auth: {
          params: {
            userId: JSON.parse(id),
          },
        },
        authEndpoint: CONSTANT.BaseUrl + "channel-authorize",
      });

      let channel = pusher.subscribe("presence-user-" + JSON.parse(id));

      channel.bind("recChatData", async function (mydata) {
        setUpdateSeen(!updateSeen);
        recChatData(mydata, messages);
      });

      channel.bind("updateMessage", async function (mydata) {
        updateSeenStatus(mydata, messages);
      });

      channel.bind("isTyping", async function (mydata) {
        isTypingFunction(mydata);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      });

      channel.bind("groupChatData", async function (mydata, messages) {
      });

      // channel.bind("senderChatData", function (data) {
      //   senderChatData(data , messages);
      // });
    }
  };

  const socketData = async (messages) => {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    const socket = socketService.socketConnection(
      token,
      settings.chatSetting.socketHost,
      settings.chatSetting.socketPort
    );
    socketService.connectUser(JSON.parse(id));
    socket.on("receiverChatData", (mydata) => {
      setUpdateSeen(!updateSeen);
      recChatData(mydata, messages);
    });

    // socket.on("senderChatData", (mydata) => {
    //   senderChatData(mydata, messages);
    // });

    socket.on("isTyping", (mydata) => {
      isTypingFunction(mydata);
    });

    socket.on("updateMsgStatus", (mydata) => {
      updateSeenStatus(mydata, messages);
    });

    socket.on("groupChatData", (mydata) => {
    });
  };

  const isTypingFunction = (mydata) => {
    setIsTyping(true);
    setTypingId(mydata.chatId);
    setTypingType(mydata.chatType);
    setTypingName(mydata.typingName);
    setTypingSenderId(mydata.senderId);
    setTypingText(mydata.text);
  };

  const recChatData = (mydata, messages) => {
    setUpdateSeen(true);
    if (route.params.chatId == mydata.chatId) {
      messages.push(mydata.chatData);
      setData(messages);
      forceUpdate();
    }
  };

  const senderChatData = (mydata, messages) => {
    // forceUpdate();
    if (route.params.chatId == mydata.chatId) {
      for (var i = 0; i < messages.length; i++) {
        if (
          messages[i].messageId.toString() ==
          mydata.messagelistData.messageId.toString()
        ) {
          return;
        } else {
          if (i == messages.length - 1) {
            messages.push(mydata.chatData);
            setData(messages);
          }
        }
      }
      // setRefreshFlatList(!refreshFlatlist);
      forceUpdate();
    }
  };

  const updateSeenStatus = (mydata, messages) => {
    if (route.params.chatType == "1") {
      Object.entries(mydata.messageIds).map(([key, value]) => {
        seenMessagesIds.push(key);
      });
      for (var i = 0; i < seenMessagesIds.length; i++) {
        for (var j = 0; j < messages.length; j++) {
          if (seenMessagesIds[i].toString() == messages[j].messageId) {
            messages[j].messageStatus = "1";
          }
        }
      }
    } else if (route.params.chatType == "2") {
      Object.entries(mydata.detail).map(([key, value]) => {
        for (var i = 0; i < messages.length; i++) {
          if (key == messages[i].messageId) {
            messages[i].messageSeenIds = value.seenids;
            if ("seen" in value == true && value.seen == true) {
              messages[i].messageStatus = "1";
            }
          }
        }
      });
    } else if (route.params.chatType == "0") {
      Object.entries(mydata.messageIds).map(([key, value]) => {
        seenMessagesIds.push(key);
      });
      for (var i = 0; i < seenMessagesIds.length; i++) {
        for (var j = 0; j < messages.length; j++) {
          if (seenMessagesIds[i].toString() == messages[j].messageId) {
            messages[j].messageStatus = "1";
          }
        }
      }
    }

    setData(messages);
    setRefreshFlatList(!refreshFlatlist);
    forceUpdate();
    seenMessagesIds.length = 0;
  };

  const updateMessagesStatus = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "update-guppy-message",
        {
          chatId: route.params.chatId,
          chatType: parseInt(route.params.chatType),
          userId: JSON.parse(id),
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        setUpdateSeen(false);
        if (settings?.chatSetting?.socketEnable == true) {
          if (route.params.chatType == "1") {
            let payload = {
              senderId: response.data.senderId,
              chatId: response.data.chatId,
              messageIds: response.data.messageIds,
              messageCounter: response.data.messageCounter,
              chatType: response.data.chatType,
            };
            socketService.updateMsgStatus(payload);
          } else if (route.params.chatType == "2") {
            let payload = {
              chatId: response.data.chatId,
              messageSenders: response.data.messageSenders,
              messageCounter: response.data.messageCounter,
              chatType: response.data.chatType,
              userId: JSON.parse(id),
            };
            socketService.updateMsgStatus(payload);
          } else if (route.params.chatType == "0") {
            let payload = {
              senderId: response.data.senderId,
              chatId: response.data.chatId,
              messageIds: response.data.messageIds,
              messageCounter: response.data.messageCounter,
              chatType: response.data.chatType,
            };
            socketService.updateMsgStatus(payload);
          }
          else if (route.params.chatType == "3") {
            let payload = {
              senderId: response.data.senderId,
              chatId: response.data.chatId,
              messageIds: response.data.messageIds,
              messageCounter: response.data.messageCounter,
              chatType: response.data.chatType,
            };
            socketService.updateMsgStatus(payload);
          }
        }
      })
      .catch((error) => {
      });
  };
  const setConversationMute = async () => {
    const chatMute = await AsyncStorage.getItem("notificationStatus");
    if (chatMute != null) {
      setRing(JSON.parse(chatMute));
    }
  };
  const onRefresh = () => {
    //set isRefreshing to true
    if (data.length >= 1) {
      loadMoreData();
    }
    // and set isRefreshing to false at the end of your callApiMethod()
  };

  const fetchUserProfile = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl + "load-profile-info?userId=" + JSON.parse(id),
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
        setMute(responseJson.userInfo.muteNotification);
        setName(responseJson.userInfo.userName);
        setAvatar(responseJson.userInfo.userAvatar);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchMessageList = async () => {
    var receiverId =
      route.params.chatType == "0"
        ? "&receiverId=" +
          route.params.postReceiverId +
          "&postId=" +
          route.params.receiverid
        : route.params.chatType == "2"
        ? "&groupId=" + route.params.receiverid
        : "&receiverId=" + route.params.receiverid;
    const notificationBellUrl = await AsyncStorage.getItem(
      "notificationBellUrl"
    );
    setNotificationBell(notificationBellUrl);
    if (data.length < 1) {
      setRequest("respond");
    }
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-chat?offset=" +
        "0" +
        "&search=&chatType=" +
        route.params.chatType +
        receiverId +
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
      .then(async (responseJson) => {

        setData(responseJson.chatMessages);
        if (settings?.chatSetting?.socketEnable == false) {
          pusherData(responseJson.chatMessages);
        } else {
          socketData(responseJson.chatMessages);
        }
        setMediaAttachment(responseJson.mediaAttachments);
        await AsyncStorage.setItem(
          "notificationStatus",
          JSON.stringify(responseJson.muteNotfication)
        );
        setRing(responseJson.muteNotfication);
        setRequest("");
        setEditableField(true);
        setReload(!reload);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const scrollToIndexFailed = (e) => {
    const offset = e.averageItemLength * e.index;
    flatlistRef.current.scrollToOffset({ offset });
  };

  const loadMoreData = async () => {
    var receiverId =
      route.params.chatType == "0"
        ? "&receiverId=" +
          route.params.postReceiverId +
          "&postId=" +
          route.params.receiverid
        : route.params.chatType == "2"
        ? "&groupId=" + route.params.receiverid
        : "&receiverId=" + route.params.receiverid;
    setScrollEnd(false);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return (
      fetch(
        CONSTANT.BaseUrl +
          "load-guppy-chat?offset=" +
          offset +
          "&search=&chatType=" +
          route.params.chatType +
          receiverId +
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
          let users = responseJson.chatMessages;
          setData(users.concat(data));
          setReload(!reload);
          // flatlistRef.current.scrollToIndex({ index: 20 })
          // setLoader(false)
        })
        .catch((error) => {
          console.error(error);
        })
    );
  };

  const choosePictureFromGallery = async () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 1200,
      multiple: true,
      mediaType: "photo",
      maxFiles: 30,
      useFrontCamera: true,
    }).then(async (images) => {
      refPickerRBSheet.current.close();
      // const imageUri = Platform.OS === "ios" ? image.sourceURL : image.path;
      // setImage(imageUri);
      setMultiImages(images);
      data.push({
        messageId: Date.now(),
        messageType: "1",
        messageStatus: "3",
        attachmentsData: {
          attachmentType: "images",
          attachments: images,
        },
        timeStamp: "",
        isSender: true,
      });
      setRefreshFlatList(!refreshFlatlist);
      await sendMessages("1", 0, 0, messageId, data[data.length - 1]);
    });
  };

  const chooseVideoFromGallery = async () => {
    ImagePicker.openPicker({
      mediaType: "video",
    }).then(async (video) => {
      refPickerRBSheet.current.close();
      //const videoUri = Platform.OS === "ios" ? video.sourceURL : video.path;
      data.push({
        messageId: Date.now(),
        messageType: "1",
        messageStatus: "3",
        attachmentsData: {
          attachmentType: "video",
          attachments: video,
        },
        timeStamp: "",
        isSender: true,
      });
      setRefreshFlatList(!refreshFlatlist);
      await sendMessages("1", 0, 0, messageId, data[data.length - 1]);
    });
  };

  const manageFoucus = () => {
    setShow(false);
    setShowSend(true);
  };

  const appendInArray = async () => {
    if (message != "") {
      data.push({
        messageId: Date.now(),
        messageType: "0",
        messageStatus: "3",
        message: message,
        timeStamp: "",
        isSender: true,
      });

      // flatlistRef.scrollToEnd({animated: true})
      setRefreshFlatList(!refreshFlatlist);
      setMessage("");
      await sendMessages("0", 0, 0, messageId, data[data.length - 1]);
    }
  };

  const handlerLongClick = (index, item) => {
    if (item.messageStatus != "2") {
      setVisible(true);
      setIndex(index);
      setReplayType(null);
      setMessageId(item.messageId);
      if (item.hasOwnProperty("isSender")) {
        setSelectedSenderType(item.isSender);
      } else {
        setSelectedSenderType(false);
      }
      setSelectedMessageType(item.messageStatus);
      if (item.messageType == "0") {
        setSelectedItem(item);
      }
      if (item.messageType.toString() != "0") {
        setSelectedItemAttachments(item.attachmentsData.attachments);
        setSelectedItem(item);
        setSelectedMedia(item.attachmentsData.attachmentType);
      } else {
        setSelectedMedia("");
      }
    }
  };

  const deletedMessageData = async () => {
    // setVisible(false);
    // data[index].type = "delete";

    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "delete-guppy-message",
        {
          messageId: messageId,
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
          setMessageId(0);
          setVisible(false);
          setReplayType(null);
          fetchMessageList();
          setRefreshFlatList(!refreshFlatlist);
        } else if (response.status === 203) {
          setMessageId(0);
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  };

  const pickDocumentfromDevice = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      data.push({
        messageId: Date.now(),
        messageType: "1",
        messageStatus: "3",
        attachmentsData: {
          attachmentType: "file",
          attachments: res,
        },
        timeStamp: "",
        isSender: true,
      });
      await sendMessages("1", 0, 0, messageId, data[data.length - 1]);
      setRefreshFlatList(!refreshFlatlist);
      refPickerRBSheet.current.close();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const pickAudiofromDevice = async () => {
    var date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    const strTime = `${hours}:${minutes} ${ampm}`;
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        copyTo: "documentDirectory",
      });

      data.push({
        messageId: Date.now(),
        messageType: "1",
        messageStatus: "3",
        attachmentsData: {
          attachmentType: "audio",
          attachments: res,
        },
        timeStamp: "",
        isSender: true,
      });
      await sendMessages("1", 0, 0, messageId, data[data.length - 1]);
      setRefreshFlatList(!refreshFlatlist);
      refPickerRBSheet.current.close();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  const showMapPreview = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setlongitude(position.coords.longitude);
        setError(null);
        setMapInfo(position.coords);

      },
      (error) => setError(error)
      //{enableHighAccuracy:true,timeout:20000,maximumAge:2000}
    );
    setShowMap(true);
    //
  };

  const sendCurrentLocation = async () => {
    setShowMap(false);
    var date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";

    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    const strTime = `${hours}:${minutes} ${ampm}`;
    data.push({
      messageId: Date.now(),
      messageType: "2",
      messageStatus: "3",
      message: mapInfo,
      timeStamp: "",
      isSender: true,
    });
    await sendMessages(
      "2",
      mapInfo.latitude,
      mapInfo.longitude,
      messageId,
      data[data.length - 1]
    );
    setRefreshFlatList(!refreshFlatlist);
    refPickerRBSheet.current.close();
  };

  const sendMessages = async (val, lat, long, messageid, messageData) => {
    setReplayType(null);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    var formData = new FormData();
    formData.append("userId", JSON.parse(id));
    formData.append(
      "receiverId",
      route.params.chatType == "0"
        ? route.params.postReceiverId
        : route.params.chatType != "2"
        ? route.params.receiverid
        : ""
    );
    formData.append(
      "groupId",
      route.params.chatType == "2" ? route.params.receiverid : 0
    );
    formData.append(
      "postId",
      route.params.chatType == "0" ? route.params.receiverid : 0
    );
    formData.append("chatType", route.params.chatType);
    formData.append("messageType", val);
    formData.append("message", messageData.message);
    formData.append("replyId", messageid);
    formData.append("latitude", lat);
    formData.append("longitude", long);
    // formData.append("longitude", 0);

    if (val == "1") {
      if (data[data.length - 1].attachmentsData.attachmentType == "images") {
        if (data[data.length - 1].attachmentsData.attachments != null) {
        
          data[data.length - 1].attachmentsData.attachments.forEach(
            (item, i) => {
              formData.append(i, {
                name: Platform.OS == "ios" ? item.filename : "name.jpg",
                type: item.mime,
                uri: Platform.OS == "ios" ? item.sourceURL : item.path,
                error: 0,
                size: JSON.parse(item.size),
              });
            }
          );
        }
      }
      if (data[data.length - 1].attachmentsData.attachmentType == "video") {
        if (data[data.length - 1].attachmentsData.attachments != null) {
      
          formData.append(0, {
            name:
              Platform.OS == "ios"
                ? data[data.length - 1].attachmentsData.attachments.filename
                : "video.mp4",
            type: data[data.length - 1].attachmentsData.attachments.mime,
            uri:
              Platform.OS == "ios"
                ? data[data.length - 1].attachmentsData.attachments.sourceURL
                : data[data.length - 1].attachmentsData.attachments.path,
            error: 0,
            size: JSON.parse(
              data[data.length - 1].attachmentsData.attachments.size
            ),
          });
        }
      }
      if (data[data.length - 1].attachmentsData.attachmentType == "file") {
        if (data[data.length - 1].attachmentsData.attachments != null) {
         
          formData.append(0, {
            name: data[data.length - 1].attachmentsData.attachments[0].name,
            type: data[data.length - 1].attachmentsData.attachments[0].type,
            uri: data[data.length - 1].attachmentsData.attachments[0].uri,
            error: 0,
            size: JSON.parse(
              data[data.length - 1].attachmentsData.attachments[0].size
            ),
          });
        }
      }
      if (data[data.length - 1].attachmentsData.attachmentType == "audio") {
        if (data[data.length - 1].attachmentsData.attachments != null) {
          
          formData.append(0, {
            name: data[data.length - 1].attachmentsData.attachments[0].name,
            type: data[data.length - 1].attachmentsData.attachments[0].type,
            uri: data[data.length - 1].attachmentsData.attachments[0].uri,
            error: 0,
            size: JSON.parse(
              data[data.length - 1].attachmentsData.attachments[0].size
            ),
          });
        }
      }
    }
    if (val == "3") {
      formData.append(0, {
        name: "sound.mp3",
        type: "audio/mp3",
        uri: data[data.length - 1].attachmentsData.attachments,
        error: 0,
        size: 20394,
      });
    }

    axios
      .post(CONSTANT.BaseUrl + "send-guppy-message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + JSON.parse(token),
        },
      })
      .then(async (response) => {
        if (response.status === 200) {
          messageData.messageStatus = "0";
          messageData.messageId = response.data.chatData.messageId.toString();
          messageData.replyMessage = response.data.chatData.replyMessage;
          setMessageId(0);
          setMultiImages(null);
          setReplayType(null);
          setSelectedItem("");
          setMessage("");
          forceUpdate();
          if (settings?.chatSetting?.socketEnable == true) {
            handleChangeText("");
            let chatType = response.data.chatType;
            let groupMembersArray = [];
            if (chatType == 2) {
              groupMembersArray = response.data.groupMembers;
            }
            let payload = {
              chatData: JSON.parse(JSON.stringify(response.data.chatData)),
              messagelistData: JSON.parse(
                JSON.stringify(response.data.messagelistData)
              ),
              groupMembers: groupMembersArray,
              userName: chatType == 2 ? "" : name,
              userAvatar: chatType == 2 ? "" : user_avatar,
              userId: JSON.parse(id),
              chatType: response.data.chatType,
              muteNotfication: mute,
            };
            socketService.sendMessage(payload);
          }
        } else if (response.status === 203) {
        }
      })
      .catch((error) => {
        // console.log(error);
      });
  };
  const checkPermission = async () => {
    if (Platform.OS === "ios") {
      downloadMedia();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "App needs access to your storage to download Photos",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log("permission granted..");
          downloadMedia();
        } else {
          Alert.alert("Storage Permission Not Granted");
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const downloadMedia = () => {
    setVisible(false), setReplayType(null), setMessageId(0);
    for (var i = 0; i < selectedItemAttachments.length; i++) {
      let date = new Date();
      let URL = selectedItemAttachments[i].file;
      let ext = selectedItemAttachments[i].fileName;
      const { config, fs } = RNFetchBlob;
      // const {dirs:{DocumentDir,PictureDir}} = RNFetchBlob.fs
      // const devicePath = Platform.select({ios:DocumentDir,android:PictureDir});
      let options;
      let PictureDir = fs.dirs.PictureDir;
      if (selectedMedia == "images") {
        options = Platform.select({
          ios: {
            fileCache: true,
            path:
              PictureDir +
              `/Guppy/Guppy Images/Guppy_IMG_` +
              Math.floor(date.getTime() + date.getSeconds() / 2) +
              ext,
            appendExt: selectedItemAttachments[i].fileType,
          },
          android: {
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true, // <-- this is the only thing required
              // Optional, override notification setting (default to true)
              notification: true,
              path:
                PictureDir +
                "/Guppy/Guppy Images/Guppy_IMG_" +
                Math.floor(date.getTime() + date.getSeconds() / 2) +
                ext,
              description: "Images",
            },
          },
        });
      }
      if (selectedMedia == "video") {
        options = Platform.select({
          ios: {
            fileCache: true,
            path:
              PictureDir +
              `/Guppy/Guppy Video/Guppy_VID_` +
              Math.floor(date.getTime() + date.getSeconds() / 2) +
              ext,
            appendExt: selectedItemAttachments[i].fileType,
          },
          android: {
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true, // <-- this is the only thing required
              // Optional, override notification setting (default to true)
              notification: true,
              path:
                PictureDir +
                "/Guppy/Guppy Video/Guppy_VID_" +
                Math.floor(date.getTime() + date.getSeconds() / 2) +
                ext,
              description: "videos",
            },
          },
        });
      }
      if (selectedMedia == "file") {
        options = Platform.select({
          ios: {
            fileCache: true,
            path:
              PictureDir +
              "/Guppy/Guppy Documents/" +
              selectedItemAttachments[i].fileName,
            appendExt: selectedItemAttachments[i].fileType,
          },
          android: {
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true, // <-- this is the only thing required
              // Optional, override notification setting (default to true)
              notification: true,
              path:
                PictureDir +
                "/Guppy/Guppy Documents/" +
                selectedItemAttachments[i].fileName,
              description: "Document",
            },
          },
        });
      }
      if (selectedMedia == "audio") {
        options = Platform.select({
          ios: {
            fileCache: true,
            path:
              PictureDir +
              "/Guppy/Guppy Music/" +
              selectedItemAttachments[i].fileName,
            appendExt: selectedItemAttachments[i].fileType,
          },
          android: {
            fileCache: true,
            addAndroidDownloads: {
              useDownloadManager: true, // <-- this is the only thing required
              // Optional, override notification setting (default to true)
              notification: true,
              path:
                PictureDir +
                "/Guppy/Guppy Music/" +
                selectedItemAttachments[i].fileName,
              description: "Music",
            },
          },
        });
      }
      config(options)
        .fetch("GET", URL)
        .then((res) => {
          if (Platform.OS === "ios") {
            RNFetchBlob.ios.openDocument(res.data);
          }
          
        });
    }
  };

  const manageReply = () => {
    setVisible(false);
    setMessageId(selectedItem.messageId);
    setReplayType(selectedItem.messageType);
  };

  const onStartRecorder = async () => {
    // setPlay(false)
    refVoiceRBSheet.current.open();
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };
    const meteringEnabled = false;
    const result = await audioRecorderPlayer.startRecorder(
      undefined,
      audioSet,
      meteringEnabled
    );
  };

  const onStopRecorder = async () => {
    const result = await audioRecorderPlayer.stopRecorder();

    data.push({
      messageId: Date.now(),
      messageType: "3",
      messageStatus: "3",
      attachmentsData: {
        attachmentType: "voice_note",
        attachments: result,
      },
      timeStamp: "",
      isSender: true,
    });
    setRefreshFlatList(!refreshFlatlist);
    await sendMessages("3", 0, 0, messageId, data[data.length - 1]);
    refVoiceRBSheet.current.close();
  };

  const handleChangeText = async (message) => {
    const id = await AsyncStorage.getItem("id");
    let groupMembersArray = [];
    if (route.params.chatType == 2) {
      Object.entries(route.params.groupDetail.memberAvatars).map(
        ([key, value]) => {
          if (key != JSON.parse(id)) {
            groupMembersArray.push(key);
          }
        }
      );
    }
    if (settings?.chatSetting?.socketEnable == true) {
      let payload = {
        userName: name,
        chatType: route.params.chatType,
        chatId: route.params.chatId,
        senderId: JSON.parse(id),
        text: message,
        groupMembers: groupMembersArray,
      };
      socketService.isTyping(payload);
    } else if (settings.chatSetting.pusherEnable == true) {
      pusherIsTyping(message);
    }
  };

  const pusherIsTyping = async (message) => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    let payload = {
      userName: name,
      chatType: route.params.chatType,
      chatId: route.params.chatId,
      senderId: JSON.parse(id),
      text: message,
      userId: JSON.parse(id),
    };
    axios
      .post(CONSTANT.BaseUrl + "user-typing", payload, {
        headers: {
          Authorization: "Bearer " + JSON.parse(token),
        },
      })
      .then(async (response) => {})
      .catch((error) => {
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MessageDetailHeader
        name={route.params.name}
        image={
          route.params.chatType == "2"
            ? route.params.groupImage
            : route.params.image
        }
        attachments={mediaAttachment}
        id={route.params.receiverid}
        chatId={route.params.chatId}
        blockedId={route.params.blockedId}
        isOnline={route.params.isOnline}
        chatType={route.params.chatType}
        groupDetail={route.params.groupDetail}
        groupTitle={route.params.groupTitle}
        groupImage={route.params.groupImage}
        isTyping={isTyping}
        typingId={typingId}
        typingSenderId={typingSenderId}
        typingType={typingType}
        typingName={typingName}
        typingText={typingText}
      />
      <View style={{ flex: 1, backgroundColor: "#f7f7f7" }}>
        {request != "respond" ? (
          <FlatList
            inverted={true}
            showsVerticalScrollIndicator={false}
            data={JSON.parse(JSON.stringify(data)).reverse()}
            ref={flatlistRef}
            extraData={refreshFlatlist}
            listKey={(x, i) => x.messageId}
            keyExtractor={(x, i) => x.messageId}
            onScrollBeginDrag={() => loadMoreData()}
            renderItem={({ item, index }) => (
              <TouchableRipple
                activeOpacity={1}
                underlayColor={"#f7f7f7"}
                onPress={() => {}}
                onLongPress={() => handlerLongClick(index, item)}
                rippleColor={"#f7f7f7"}
              >
                <>
                  {item.messageType == "0" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <SimpleMessage
                          data_item={item}
                          messageData={item.message}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "1" &&
                    item.attachmentsData.attachmentType == "images" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <MediaMessage
                          data_item={item}
                          srcData={item.attachmentsData.attachments}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "1" &&
                    item.attachmentsData.attachmentType == "video" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <VideoTemplate
                          data_item={item}
                          srcData={item.attachmentsData.attachments}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "3" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <AudioPreview
                          data_item={item}
                          srcData={item.attachmentsData.attachments}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "1" &&
                    item.attachmentsData.attachmentType == "file" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <DocumentPreview
                          data_item={item}
                          srcData={item.attachmentsData.attachments}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "1" &&
                    item.attachmentsData.attachmentType == "audio" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <MusicPreview
                          data_item={item}
                          srcData={item.attachmentsData.attachments}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "2" ? (
                    <>
                      {item.messageStatus == "2" ? (
                        <DeletedMessage
                          data_item={item}
                          timeData={item.timeStamp}
                          sender={item.isSender}
                          messageStat={item.messageStatus}
                          chatType={route.params.chatType}
                        />
                      ) : (
                        <MapPreview
                          data_item={item}
                          srcData={item.message}
                          timeData={item.timeStamp}
                          messageStat={item.messageStatus}
                          sender={item.isSender}
                          reply={item.replyMessage}
                          chatType={route.params.chatType}
                        />
                      )}
                    </>
                  ) : item.messageType == "4" ? (
                    <>
                      <InChatNotification
                        data_item={item}
                        messageData={item.message}
                        timeData={item.timeStamp}
                        sender={item.isSender}
                        chatType={route.params.chatType}
                        user={item.userName}
                        members={item.membersUpdate}
                      />
                    </>
                  ) : null}
                </>
              </TouchableRipple>
            )}
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "95%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UIActivityIndicator
              size={35}
              color={settings.chatSetting.primaryColor}
            />
          </View>
        )}
      </View>
      {/* {
        route.params.groupDetail != null && */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          // backgroundColor:"#000",
          elevation: 3,
          shadowOffset: { width: 0, height: 1 },
          shadowColor: "#000000",
          shadowOpacity: 0.1,
        }}
      >
        {replayType != null && (
          <>
            <View
              style={{
                width: "100%",
                paddingHorizontal: 20,
                flexDirection: "row",
                marginTop: 15,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: "90%",
                  backgroundColor: "#f7f7f7",
                  flexDirection: "row",
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              >
                <View
                  style={{
                    backgroundColor: settings.chatSetting.primaryColor,
                    width: 5,
                  }}
                ></View>
                <View style={{ width: "90%", paddingHorizontal: 20 }}>
                  {replayType == "1" && selectedMedia == "audio" && (
                    <MusicPreview
                      srcData={selectedItem.attachmentsData.attachments}
                      timeData={selectedItem.timeStamp}
                      sender={selectedItem.isSender}
                      messageStat={selectedItem.messageStatus}
                      replyType={true}
                      replyBox={true}
                    />
                  )}

                  {replayType == "1" && selectedMedia == "file" && (
                    <DocumentPreview
                      srcData={selectedItem.attachmentsData.attachments}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                      replyBox={true}
                    />
                  )}

                  {replayType == "3" && selectedMedia == "voice_note" && (
                    <AudioPreview
                      srcData={selectedItem.attachmentsData.attachments}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                      replyBox={true}
                    />
                  )}

                  {replayType == "1" && selectedMedia == "images" && (
                    <MediaMessage
                      srcData={selectedItem.attachmentsData.attachments}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                      replyBox={true}
                    />
                  )}

                  {replayType == "2" && (
                    <MapPreview
                      srcData={selectedItem.message}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                    />
                  )}

                  {replayType == "1" && selectedMedia == "video" && (
                    <VideoTemplate
                      srcData={selectedItem.attachmentsData.attachments}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                      replyBox={true}
                    />
                  )}

                  {replayType == "0" && (
                    <SimpleMessage
                      messageData={selectedItem.message}
                      timeData={selectedItem.timeStamp}
                      messageStat={selectedItem.messageStatus}
                      sender={selectedItem.isSender}
                      replyType={true}
                    />
                  )}
                </View>
              </View>
              <View
                style={{
                  width: "10%",
                  marginHorizontal: 15,
                  marginBottom: 5,
                  marginTop: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather
                  onPress={() => {
                    setReplayType(null), setMessageId(0);
                  }}
                  name="x"
                  type="x"
                  color={settings.chatSetting.secondaryColor}
                  size={24}
                />
              </View>
            </View>
          </>
        )}

        {!route.params.blockedUser ? (
          <>
            {!route.params.item.userDisableReply ? (
              <>
                {!route.params.item.memberDisable ? (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      paddingVertical: 10,
                    }}
                  >
                    <Feather
                      onPress={() => refPickerRBSheet.current.open()}
                      style={{ width: "10%", textAlign: "center" }}
                      name="upload"
                      type="upload"
                      color={"#999999"}
                      size={22}
                    />
                    {/* <View style={{height:40 }}> */}
                    <TextInput
                      style={{
                        fontSize: 15,
                        maxHeight: 120,
                        minHeight: 35,
                        width: "78%",
                        color: "#323232",
                        fontFamily: "Urbanist-Regular",
                        borderColor: "#DDDDDD",
                        borderWidth: 1,
                        borderRadius: 4,
                        paddingHorizontal: 10,
                        lineHeight: 20,
                      }}
                      multiline={true}
                      editable={editableField}
                      underlineColorAndroid="transparent"
                      name={"messgae"}
                      autoCorrect={false}
                      placeholder={
                        translation.type_message != ""
                          ? "Type your message here"
                          : translation.type_message
                      }
                      placeholderTextColor="#807f7f"
                      value={message}
                      onChangeText={(message) => {
                        setMessage(message), handleChangeText(message);
                      }}
                      onFocus={() => manageFoucus()}
                      onBlur={() => setShowSend(false)}
                    />
                    {/* </View> */}
                    {showSend == true ? (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => appendInArray()}
                        style={{
                          width: "12%",
                          alignItems: "center",
                          height: "100%",
                          paddingTop: Platform.OS === "ios" ? 5 : 15,
                        }}
                      >
                        <Feather
                          onPress={() => appendInArray()}
                          name="send"
                          type="send"
                          color={"#999999"}
                          size={22}
                        />
                      </TouchableOpacity>
                    ) : (
                      <>
                        {settings.chatSetting.shareVoiceNote ? (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => onStartRecorder()}
                            style={{
                              width: "12%",
                              alignItems: "center",
                              height: "100%",
                              paddingTop: Platform.OS === "ios" ? 5 : 15,
                            }}
                          >
                            <Feather
                              name={"mic"}
                              type={"mic"}
                              color={"#999999"}
                              size={22}
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => appendInArray()}
                            style={{
                              width: "12%",
                              alignItems: "center",
                              height: "100%",
                              paddingTop: Platform.OS === "ios" ? 5 : 15,
                            }}
                          >
                            <Feather
                              name="send"
                              type="send"
                              color={"#999999"}
                              size={22}
                            />
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      paddingVertical: 10,
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
                      {route.params.item.message.type == 4
                        ? "You left this group"
                        : "Admin removed you from this group"}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  paddingVertical: 10,
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
                  {translation.disable_reply_txt}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              paddingVertical: 10,
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
              {route.params.receiverid != route.params.blockedId
                ? translation.you_are_blocked
                : "You have blocked this user."}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
      {/* } */}

      <Dialog
        onTouchOutside={() => {
          setVisible(false), setReplayType(null), setMessageId(0);
        }}
        dialogStyle={{
          overflow: "hidden",
        }}
        visible={visible}
        footer={
          <DialogFooter style={{ marginTop: -20 }}>
            <DialogButton
              textStyle={{
                fontSize: 15,
                fontWeight: "700",
                fontFamily: "Urbanist-Regular",
                color: "#999",
              }}
              text={"Cancel"}
              onPress={() => {
                setVisible(false), setReplayType(null), setMessageId(0);
              }}
            />
          </DialogFooter>
        }
      >
        <DialogContent>
          <View
            style={{
              width: Dimensions.get("window").width / 1.5,
              backgroundColor: "#fff",
            }}
          >
            {selectedMedia != "" && selectedSenderType == false && (
              <>
                <View style={{ flexDirection: "row", paddingVertical: 15 }}>
                  <Feather
                    onPress={() => {
                      setVisible(false);
                      checkPermission();
                    }}
                    style={{ width: 20, textAlign: "center" }}
                    name="download"
                    type="download"
                    color={"#999999"}
                    size={20}
                  />
                  <Text
                    onPress={() => {
                      setVisible(false);
                      checkPermission();
                    }}
                    style={{
                      color: settings.chatSetting.secondaryColor,
                      fontSize: 16,
                      fontFamily: "Urbanist-Regular",
                      marginLeft: 10,
                    }}
                  >
                    {translation.download}
                  </Text>
                </View>
                {/* <View
                  style={{ borderColor: "#999", borderBottomWidth: 0.6 }}
                ></View> */}
              </>
            )}

            <TouchableOpacity
              onPress={() => manageReply()}
              style={{ flexDirection: "row", paddingVertical: 15 }}
            >
              <Feather
                onPress={() => {
                  setShow(!show);
                  Keyboard.dismiss();
                }}
                style={{ width: 20, textAlign: "center" }}
                name="message-circle"
                type="message-circle"
                color={"#999999"}
                size={20}
              />
              <Text
                style={{
                  color: settings.chatSetting.secondaryColor,
                  fontSize: 16,
                  fontFamily: "Urbanist-Regular",
                  marginLeft: 10,
                }}
              >
                {translation.reply_message}
              </Text>
            </TouchableOpacity>

            {settings.chatSetting.deleteMessageOption && (
              <>
                {selectedSenderType == true && selectedMessageType == "0" && (
                  <TouchableOpacity
                    onPress={() => deletedMessageData()}
                    style={{ flexDirection: "row", paddingVertical: 15 }}
                  >
                    <Feather
                      style={{ width: 20, textAlign: "center" }}
                      name="trash"
                      type="trash"
                      color={"#999999"}
                      size={20}
                    />
                    <Text
                      style={{
                        color: settings.chatSetting.secondaryColor,
                        fontSize: 16,
                        fontFamily: "Urbanist-Regular",
                        marginLeft: 10,
                      }}
                    >
                      {translation.delete}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </DialogContent>
      </Dialog>

      <RBSheet
        ref={refVoiceRBSheet}
        duration={250}
        closeOnPressMask={false}
        closeOnPressBack={false}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: "transparent",
          },
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: settings.chatSetting.secondaryColor,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Recording Start
          </Text>

          <View
            style={{
              width: "100%",
              height: "95%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WaveIndicator
              count={4}
              size={135}
              color={settings.chatSetting.primaryColor}
            />
            <TouchableOpacity
              onPress={() => onStopRecorder()}
              style={{
                marginTop: 10,
                width: "100%",
                height: Dimensions.get("window").height / 15,
                backgroundColor: "#FFFFFF",
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Urbanist-Bold",
                  color: "#999999",
                }}
              >
                Stop
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>

      <RBSheet
        ref={refPickerRBSheet}
        // height={Dimensions.get("window").height * 0.35}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 20,
            backgroundColor: "transparent",
          },
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            paddingBottom: 30,
          }}
        >
          <TouchableOpacity
            onPress={() => chooseVideoFromGallery()}
            style={{ flexDirection: "row", padding: 15 }}
          >
            <Feather
              style={{ textAlign: "center", marginHorizontal: 5 }}
              name="video"
              type="video"
              color={"#999999"}
              size={20}
            />
            <Text
              style={{
                fontFamily: "Urbanist-Regular",
                fontSize: 16,
                color: settings.chatSetting.secondaryColor,
              }}
            >
              {translation.video}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              borderBottomColor: "#ddd",
              borderBottomWidth: 1,
            }}
          ></View>

          <TouchableOpacity
            onPress={() => pickAudiofromDevice()}
            style={{ flexDirection: "row", padding: 15 }}
          >
            <Feather
              style={{ textAlign: "center", marginHorizontal: 5 }}
              name="headphones"
              type="headphones"
              color={"#999999"}
              size={20}
            />
            <Text
              style={{
                fontFamily: "Urbanist-Regular",
                fontSize: 16,
                color: settings.chatSetting.secondaryColor,
              }}
            >
              {translation.audio}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              flexDirection: "row",
              borderBottomColor: "#ddd",
              borderBottomWidth: 1,
            }}
          ></View>

          <TouchableOpacity
            onPress={() => choosePictureFromGallery()}
            style={{ flexDirection: "row", padding: 15 }}
          >
            <Feather
              style={{ textAlign: "center", marginHorizontal: 5 }}
              name="image"
              type="image"
              color={"#999999"}
              size={20}
            />
            <Text
              style={{
                fontFamily: "Urbanist-Regular",
                fontSize: 16,
                color: settings.chatSetting.secondaryColor,
              }}
            >
              {translation.photo}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              alignItems: "center",
              flexDirection: "row",
              borderBottomColor: "#ddd",
              borderBottomWidth: 1,
            }}
          ></View>

          <TouchableOpacity
            onPress={() => pickDocumentfromDevice()}
            style={{ flexDirection: "row", padding: 15 }}
          >
            <Ionicons
              style={{ textAlign: "center", marginHorizontal: 5 }}
              name="document-text-outline"
              type="document-text-outline"
              color={"#999999"}
              size={20}
            />
            <Text
              style={{
                fontFamily: "Urbanist-Regular",
                fontSize: 16,
                color: settings.chatSetting.secondaryColor,
              }}
            >
              {translation.document}
            </Text>
          </TouchableOpacity>
          {settings.chatSetting.shareLocation && (
            <>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  borderBottomColor: "#ddd",
                  borderBottomWidth: 1,
                }}
              ></View>

              <TouchableOpacity
                onPress={() => showMapPreview()}
                style={{ flexDirection: "row", padding: 15 }}
              >
                <Ionicons
                  style={{ textAlign: "center", marginHorizontal: 5 }}
                  name="ios-location-outline"
                  type="ios-location-outline"
                  color={"#999999"}
                  size={20}
                />
                <Text
                  style={{
                    fontFamily: "Urbanist-Regular",
                    fontSize: 16,
                    color: settings.chatSetting.secondaryColor,
                  }}
                >
                  {translation.location}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View
            style={{ flex: 1, alignItems: "center", flexDirection: "row" }}
          ></View>
        </View>

        <Modal
          style={{ flex: 1 }}
          animationType={"slide"}
          transparent={true}
          visible={showMap}
          onRequestClose={() => setShowMap(false)}
        >
          <View style={{ flex: 1, marginTop: 40 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 15,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
                alignItems: "center",
                backgroundColor: "#fff",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    color: settings.chatSetting.secondaryColor,
                    fontSize: 22,
                    fontFamily: "Urbanist-Bold",
                    marginLeft: 10,
                  }}
                >
                  Map
                </Text>
              </View>
              <Entypo
                onPress={() => setShowMap(false)}
                name="cross"
                type="cross"
                color={settings.chatSetting.secondaryColor}
                size={28}
              />
            </View>
            <MapView
              // mapType={Platform.OS == "android" ? "none" : "standard"}
              style={{ flex: 1 }}
              loadingEnabled={true}
              // showsUserLocation={true}
              region={{
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              <Marker
                coordinate={{ latitude: latitude, longitude: longitude }}
              />
            </MapView>

            <View style={{ width: "100%", backgroundColor: "#fff" }}>
              <TouchableOpacity
                onPress={() => sendCurrentLocation()}
                style={{
                  backgroundColor: settings.chatSetting.primaryColor,
                  marginHorizontal: 25,
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
                  Send current location
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </RBSheet>
    </SafeAreaView>
  );
};

export default messageDetail;
