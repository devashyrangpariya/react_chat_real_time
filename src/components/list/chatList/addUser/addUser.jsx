import { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";
import styled from "styled-components";

const AddUser = () => {
  const [user, setuser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setuser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");
    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      const addChatToUser = async (userId, chatData) => {
        const userChatDocRef = doc(userChatsRef, userId);
        const userChatDocSnap = await getDoc(userChatDocRef);
        if (!userChatDocSnap.exists()) {
          await setDoc(userChatDocRef, { chats: [chatData] });
        } else {
          await updateDoc(userChatDocRef, {
            chats: arrayUnion(chatData),
          });
        }
      };
      const chatData = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: currentUser.id,
        updatedAt: Date.now(),
      };
      await addChatToUser(user.id, chatData);
      await addChatToUser(currentUser.id, { ...chatData, receiverId: user.id });
      console.log(newChatRef.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </Form>
      {user && (
        <User>
          <Detail>
            <img src={user.avatar || "./avatar.png"} alt="Avatar" />
            <span>{user.username}</span>
          </Detail>
          <button onClick={handleAdd}>Add User</button>
        </User>
      )}
    </Container>
  );
};

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
const User = styled.div`
  margin-top: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  button {
    padding: 20px;
    border-radius: 10px;
    background-color: #1a73e8;
    color: white;
    border: none;
    cursor: pointer;
  }
`;
const Form = styled.form`
  display: flex;
  gap: 20px;
  input {
    padding: 20px;
    border-radius: 10px;
    border: none;
    outline: none;
  }
  button {
    padding: 20px;
    border-radius: 10px;
    background-color: #1a73e8;
    color: white;
    border: none;
    cursor: pointer;
  }
`;
const Container = styled.div`
  width: max-content;
  height: max-content;
  padding: 30px;
  background-color: rgba(17, 25, 40, 0.781);
  border-radius: 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
`;
export default AddUser;
