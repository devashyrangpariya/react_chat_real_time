import { useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import EmojiPicker from "emoji-picker-react";
import styled from "styled-components";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  // ---- SCROLL USEEFFECT  ---- //
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // ---- CHATID USEEFFECT  ---- //
  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  // ---- HANDLE EMOJI  ---- //
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // ---- HANDLE IMG  ---- //
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // ---- HANDLE SEND  ---- //
  const handleSend = async () => {
    if (text === "") return;
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIds = [currentUser.id, user.id];

      userIds.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setImg({
      file: null,
      url: "",
    });
    setText("");
  };

  return (
    <Container>
      <Top>
        <User>
          <img src={user?.avatar || "./avatar.png"} alt="Avatar Img" />
          <Texts>
            <span>{user?.username || "Unknown User"}</span>
            <p>Available</p>
          </Texts>
        </User>
        <Icons>
          <img src="./phone.png" alt="Phone Icon" />
          <img src="./video.png" alt="Video Icon" />
          <img src="./info.png" alt="Info Icon" />
        </Icons>
      </Top>
      <Center>
        {chat?.messages?.map((message) => (
          <Message
            key={`${message.senderId}-${message.createAt}`}
            own={message.senderId === currentUser?.id}
          >
            <Text1>
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
            </Text1>
          </Message>
        ))}
        {img.url && (
          <MessageOwn>
            <Text1>
              <img src={img.url} alt="" />
            </Text1>
          </MessageOwn>
        )}
        <div ref={endRef}></div>
      </Center>
      <Bottom>
        <Icons>
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Mic" />
        </Icons>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can not send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <Emoji>
          <img
            src="./emoji.png"
            alt="Emoji"
            onClick={() => setOpen((prev) => !prev)}
          />
          <Picker>{open && <EmojiPicker onEmojiClick={handleEmoji} />}</Picker>
        </Emoji>
        <Button>
          <SendButton
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            Send
          </SendButton>
        </Button>
      </Bottom>
    </Container>
  );
};

const Button = styled.div``;
const Picker = styled.div`
  position: absolute;
  bottom: 50px;
  left: 0;
`;
const SendButton = styled.button`
  background-color: #5183fe;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #5183feb4;
    cursor: not-allowed;
  }
`;
const Emoji = styled.div`
  position: relative;
  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
const Bottom = styled.div`
  display: flex;
  padding: 20px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #dddddd35;
  gap: 20px;
  margin-top: auto;
  input {
    flex: 1;
    background-color: rgba(17, 25, 40, 0.5);
    border: none;
    outline: none;
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-size: 16px;
    &:disabled {
      cursor: not-allowed;
    }
  }
`;
const Text1 = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  p {
    padding: 20px;
    background-color: #5183fe;
    border-radius: 10px;
  }
  img {
    width: 100%;
    height: 300px;
    border-radius: 10px;
    object-fit: cover;
  }
`;
const Message = styled.div`
  max-width: 70%;
  display: flex;
  gap: 20px;
  align-self: ${({ own }) => (own ? "flex-end" : "flex-start")};
  padding: 10px;
  border-radius: 10px;
`;
const Center = styled.div`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #dddddd35;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(197, 196, 196, 0.569);
  }
`;
const Icons = styled.div`
  display: flex;
  gap: 20px;
  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  span {
    font-size: 18px;
    font-weight: bold;
  }
  p {
    font-size: 14px;
    font-weight: 300;
    color: #a5a5a5;
  }
`;
const User = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #dddddd35;
`;
const Container = styled.div`
  flex: 2;
  border-left: 1px solid #dddddd35;
  border-right: 1px solid #dddddd35;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
export default Chat;
