import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from "../../../lib/userStore";
import AddUser from "./addUser/addUser";
import styled from "styled-components";

const Chatlist = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddmode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  // console.log(chatId)

  useEffect(() => {
    if (!currentUser?.id) return;
    const unSub = onSnapshot(doc(db, "userChats", currentUser.id), (res) => {
      const fetchChatData = async () => {
        const data = res.data();
        if (!data || !data.chats) {
          setChats([]);
          return;
        }
        const items = data.chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      };
      fetchChatData();
    });
    return () => {
      unSub();
    };
  }, [currentUser]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, "userChats", currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
    changeChat(chat.chatId, chat.user);
  };

  const FilteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <Container>
      <Search>
        <Searchbar>
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </Searchbar>
        <Add
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          onClick={() => setAddmode((prev) => !prev)}
        />
      </Search>
      {FilteredChats.map((chat) => (
        <Item
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <Texts>
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </Texts>
        </Item>
      ))}
      {addMode && <AddUser />}
    </Container>
  );
};

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  span {
    font-weight: 500;
  }
  p {
    font-size: 14px;
    font-weight: 300;
  }
`;
const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  cursor: pointer;
  border: 1px solid #dddddd35;

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const Add = styled.img`
  width: 36px;
  height: 36px;
  background-color: rgba(17, 25, 40, 0.5);
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
`;
const Searchbar = styled.div`
  flex: 1;
  background-color: rgba(17, 25, 40, 0.5);
  display: flex;
  align-items: center;
  gap: 20px;
  border-radius: 10px;
  padding: 10px;

  input {
    background-color: transparent;
    border: none;
    outline: none;
    color: white;
    flex: 1;
  }

  img {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;
const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;
const Container = styled.div`
  flex: 1;
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
export default Chatlist;
