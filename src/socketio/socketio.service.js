import { io } from "socket.io-client";
import { GUPPYCHAT_SOCKET_ENDPOINT } from "../resources/constants";
class SocketioService {
  socket;
  constructor() {}

  // connect to socket server
  socketConnection(authToken, host, port) {
    this.socket = io(host + ":" + port, {
      auth: {
        token: authToken,
      },
      secure: true,
      reconnect: true,
    });
    return this.socket;
  }

  // connect user
  connectUser(userId) {
    if (this.socket) {
      this.socket.emit("addUser", { userId: userId });
    }
  }

  // send message
  sendMessage(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("receiverChatData", data);
      this.socket.emit("senderChatData", data);
    }
  }

  // update Message Status
  updateMsgStatus(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateMsgStatus", data);
    }
  }

  // update Message Status
  deleteMessage(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("deleteSenderMessage", data);
      this.socket.emit("deleteReceiverMessage", data);
    }
  }

  // is typing
  isTyping(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("isTyping", data);
    }
  }

  // update user
  updateUser(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateReceiverUser", data);
    }
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateSenderUser", data);
    }
  }

  // update Guppy group
  updateGuppyGroup(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("groupChatData", data);
    }
  }

  leaveGuppyGroup(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leaveGuppyGroup", data);
    }
  }
  // update mute notification status
  updateMuteChatNotify(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateMuteChatNotify", data);
    }
  }

  // clear Chat notification status
  clearChat(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("clearChat", data);
    }
  }
  // delete group
  deleteGroup(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("deleteGroup", data);
    }
  }

  // send online Status of a user
  updateOnlineStatus(data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("updateOnlineStatus", data);
    }
  }
}

export default new SocketioService();
