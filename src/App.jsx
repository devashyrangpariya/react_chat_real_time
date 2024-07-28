import styled from "styled-components";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      // console.log(user.uid);
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  if (isLoading) return <Loading>Loading...</Loading>;

  return (
    <Container>
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </Container>
  );
};
const Loading = styled.div`
  padding: 50px;
  font-size: 36px;
  border-radius: 10px;
  background-color: rgba(17, 25, 40, 0.9);
`;
const Container = styled.div`
  width: 80vw;
  height: 90vh;
  background-color: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(19px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
  display: flex;
`;
export default App;
