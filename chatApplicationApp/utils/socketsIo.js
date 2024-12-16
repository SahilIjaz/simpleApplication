const io = require("socket.io")();
const moment = require("moment");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Notification = require("../models/notificationModel");

// const { sendNotification } = require("./Notifications");

// const authentication = (cb) => async (userData) => {
//     const user = await User.findOne({ _id: userData._id });

//     if (!user) {
//       // Emit an error message and disconnect the socket if user is not authenticated
//       socket.emit("unauthenticated", {
//         message: "Unauthenticated",
//         success: false,
//         data: {},
//       });
//       return socket.disconnect();
//     }
//     // Invoke the callback with the authenticated user data
//     await cb({ user: JSON.parse(JSON.stringify(user)), ...userData });
//   };

let activeUsers = [];

const getOnlineUsers = () => {
  io.emit("online-users", {
    status: "success",
    message: "Online users fetched",
    activeUsers,
  });
};

io.on("connection", (socket) => {
  console.log("connected to socket.io", socket.id);

  socket.on("user-enter", (userData) => {
    //console.log(userData)
    if (!userData) {
      console.log("UserData not Found");
    }
    if (!activeUsers.some((user) => user.userId === userData._id)) {
      activeUsers.push({
        userId: userData._id,
        socketId: socket.id,
      });
    }

    console.log(activeUsers);
    // console.log("CONSOLE LOG INSIDE SETUP:", userData._id);

    // const fetchNotificationAndMessages = async() =>{
    //   try{
    //     const Notification = await Notification.find({

    //     })
    //   }catch(err){

    //   }
    // }

    socket.join(userData._id);
    //socket.emit("connected");
    getOnlineUsers();
  });

  socket.on("get-online-users", () => {
    console.log(activeUsers);
    getOnlineUsers();
  });

  socket.on("get-inboxes", async (userData) => {
    let chats;
    chats = await Chat.find({
      users: { $in: [userData._id] },
    }).sort("-updatedAt");

    chats = JSON.parse(JSON.stringify(chats));

    for (let i = 0; i < chats.length; i++) {
      let messages;
      messages = await Message.find({
        chat: chats[i]._id,
        receiver: userData._id,
        isSeen: false,
      });
      chats[i].newMessages = messages.length;
      //const activeUsersIds  = activeUsers.map((user)=>user.userId)
      chats[i].users.map((user) => {
        activeUsers.map((activeUser) => {
          if (activeUser.userId === user._id.toString()) {
            user.isOnline = true;
          }
        });
      });
    }

    if (chats.length < 1) {
      chats = null;
      console.log("You currently dont have any inbox ");
      io.to(userData._id).emit("inboxes", {
        status: "success",
        message: "Inboxes fetched successfully",
        inboxes: [],
      });
    } else {
      console.log("your inboxes are:", [...chats]);
      io.to(userData._id).emit("inboxes", {
        status: "success",
        message: "Inboxes fetched successfully",
        inboxes: [...chats],
      });
    }
  });

  socket.on("join-chat", async (userData, receiverId) => {
    console.log("USER IS::::", userData);
    console.log("RECEIVER IS::::", receiverId);
    let chat;
    let receiver = await User.findById({ _id: receiverId });
    if (!receiver) {
      console.log("receiver not found");
    }
    chat = await Chat.findOne({
      $and: [{ users: userData._id }, { users: receiver?._id }],
    });
    if (!chat) {
      console.log("Chat not Found. CREATING CHAT IN JOIN ROOM");
      chat = await Chat.create({
        users: [userData._id, receiver._id],
      });
      // return io.to(userData._id).emit("messages", {
      //   status: "fail",
      //   message:
      //     "Failed to retrieve messages. Chat with this user doesnt exist.",
      //   receiver,
      //   messages: [],
      // });
    }
    const updatedMessages = await Message.updateMany(
      { sender: receiver._id, receiver: userData._id },
      { isSeen: true }
    );

    let messages;
    messages = await Message.find({
      $and: [
        {
          $or: [{ sender: userData._id }, { receiver: userData._id }],
        },
        {
          $or: [{ sender: receiver._id }, { receiver: receiver._id }],
        },
      ],
    }).sort({ createdAt: -1 });

    messages = JSON.parse(JSON.stringify(messages));
    for (let i = 0; i < messages.length; i++) {
      if (
        messages[i].isSeen === false &&
        messages[i].sender._id === userData._id
      ) {
        messages[i].isSeen = true;
      }
    }
    const chatId = chat._id.toString();

    socket.join(chatId);
    if (messages.length < 1) {
      console.log("MESSAGES LENGTH IS LESS THAN 1");
      io.to(userData._id).emit("messages", {
        status: "success",
        message:
          "Messages retrieved successfully. You currently have 0 messages.",
        messages: [],
      });
    } else {
      console.log("MESSAGES LENGTH IS GREATER THAN 1");
      io.to(userData._id).emit("messages", {
        status: "success",
        message: "Messages retrieved successfully",
        messages: [...messages],
      });
    }

    //console.log(`User ${userData.firstName} connected to room:` + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop-typing", (room) => {
    socket.in(room).emit("stop-typing");
  });

  socket.on("send-message", async (userData, to, message) => {
    try {
      const currentLocalTime = moment();
      const currentUnixTime = currentLocalTime.unix();

      const receiver = await User.findById({ _id: to });
      console.log("RECEIVER IS:", receiver);
      if (!receiver) {
        console.log("receiver not found");
      }

      let chat;
      chat = await Chat.findOne({
        $and: [{ users: userData._id }, { users: receiver._id }],
      });
      const user1 = userData._id;
      const user2 = receiver._id;
      if (!chat) {
        console.log("CREATING CHAT!!!");
        chat = await Chat.create({
          users: [user1, user2],
          lastMessageSender: user1,
          lastMessage: message,
          messageTime: currentUnixTime,
        });
        console.log("11111111111111111111111111111111111111111");
        console.log("11111111111111111111111111111111111111111");
        console.log("CHAT IS : ", chat);
        console.log("11111111111111111111111111111111111111111");
        console.log("11111111111111111111111111111111111111111");
        const newChatId = chat._id.toString();
        socket.join(newChatId);
      } else {
        console.log("UPDATING CHAT!!!");
        await Chat.findByIdAndUpdate(chat._id, {
          lastMessageSender: user1,
          lastMessage: message,
          messageTime: currentUnixTime,
        });
      }

      const chatId = chat._id.toString();
      const joinedPeople = io.sockets.adapter.rooms.get(chatId);
      const joinedPeopleCount = joinedPeople ? joinedPeople.size : 0;

      const dbMessage = await Message.create({
        chat: chat._id,
        sender: userData._id,
        receiver: receiver._id,
        message,
        messageTime: currentUnixTime,
        isSeen: joinedPeopleCount > 1 ? true : false,
      });

      console.log("DB MESSAGE IS:", dbMessage);

      // const currentMessage = await Message.findById(dbMessage?._id)
      // console.log("CURRENT MESSAGE IS:",currentMessage)
      // const updatedMessages = await Message.updateMany(
      //   { sender: receiver._id, receiver: userData._id },
      //   { seen: true }
      // );

      const messages = await Message.find({
        $and: [
          {
            $or: [{ sender: userData._id }, { receiver: userData._id }],
          },
          {
            $or: [{ sender: receiver._id }, { receiver: receiver._id }],
          },
        ],
      }).sort({ createdAt: -1 });

      console.log(messages);

      io.to(userData._id).emit("message-sent", {
        status: "success",
        message: "New message sent successfully",
        isMessageSent: true,
        data: message,
      });

      io.to(chatId).emit("messages", {
        status: "success",
        message: "New Message retrieved successfully",
        receiver,
        messages: [...messages],
      });

      await Notification.create({
        notificationType: `new message`,
        sender: userData._id,
        receiver: receiver._id,
        title: `New Message Received`,
        text: `${userData.firstName} sent you a message`,
        data: {
          message,
        },
      });

      if (receiver.isNotifications) {
        await sendNotification({
          fcmToken: receiver.fcmToken,
          title: `New Message Received`,
          body: `${userData.firstName} sent you a message`,
          notificationData: JSON.stringify(message),
        });
      }

      let chats;
      chats = await Chat.find({ users: { $in: [receiver._id] } }).sort(
        "-updatedAt"
      );

      chats = JSON.parse(JSON.stringify(chats));

      for (let i = 0; i < chats.length; i++) {
        const messages = await Message.find({
          $and: [
            { chat: chats[i]._id },
            { isSeen: false },
            { receiver: { $eq: receiver._id } },
          ],
        });
        chats[i].newMessages = messages.length;
        console.log("MESSAGES IN SEND MESSAGE BEFORE EMITTING ARE:", messages);
      }

      io.to(to).emit("inboxes", {
        status: "success",
        message: "Inboxes fetched successfully",
        inboxes: [...chats],
      });

      //const chat = newMessageReceived.chat;

      // console.log("CHAT in NEW-MESSAGE:" + chat);
      // socket
      //   .in(newMessageReceived?.receiver?._id)
      //   .emit("message-received", newMessageReceived);

      // const receiver = await User.findById(newMessageReceived?.receiver?._id);

      // if (!receiver.fcmToken) {
      //   return console.log("FCM token not found!!!");
      // }

      // await sendNotification({
      //   fcmToken: receiver.fcmToken,
      //   title: "New Message Received",
      //   body: `${userData.firstName} sent you a message`,
      //   notificationData: JSON.stringify(newMessageReceived),
      // });
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnected", (userData) => {
    //console.log(socket.id)

    //activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log(userData._id.toString());
    activeUsers = activeUsers.filter(
      (user) => user.userId !== userData._id.toString()
    );
    getOnlineUsers();
    console.log("USER DISCONNECTED.", activeUsers);
  });
});

module.exports = { io };
