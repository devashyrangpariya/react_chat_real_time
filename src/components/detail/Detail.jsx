import styled from "styled-components";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Container>
      <User>
        <img src={user?.avatar || "./avatar.png"} alt="Avatar Img" />
        <h2>{user?.username || "Unknown User"}</h2>
        <p>Available</p>
      </User>
      <Info>
        <Option>
          <Title>
            <span>Chat Setting</span>
            <img src="./arrowUp.png" alt="Arrow Up Icone" />
          </Title>
        </Option>
        <Option>
          <Title>
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="Arrow Up Icone" />
          </Title>
        </Option>
        <Option>
          <Title>
            <span>Shared Photos</span>
            <img src="./arrowUp.png" alt="Arrow Up Icone" />
          </Title>
        </Option>
        {/* <Photos>
          <PhotosItem>
            <PhotosDetail>
              <img src="./bg2.jpg" alt="" />
              <span>photo_2024_2.png</span>
            </PhotosDetail>
            <Icone src="./download.png" alt="" />
          </PhotosItem>
        </Photos> */}
        <Option>
          <Title>
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow Up Icone" />
          </Title>
        </Option>
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        <Logout onClick={() => auth.signOut()}>Logout</Logout>
      </Info>
    </Container>
  );
};

const Logout = styled.button`
  padding: 10px;
  background-color: #1a73e8 !important;
  color: white;
  border: none;
  cursor: pointer;
`;
const Icone = styled.img`
  width: 30px;
  height: 30px;
  background-color: rgba(17, 25, 40, 0.3);
  padding: 10px;
  border-radius: 50%;
  cursor: pointer;
`;
const PhotosDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  img {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    object-fit: cover;
  }
  span {
    font-size: 14px;
    color: lightgray;
    font-weight: 300;
  }
`;
const PhotosItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Photos = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
`;
const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  img {
    width: 30px;
    height: 30px;
    background-color: rgba(17, 25, 40, 0.3);
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
  }
`;
const Option = styled.div``;
const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  button {
    margin-top: 20px;
    padding: 15px;
    background-color: rgba(230, 74, 105, 0.553);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: rgba(220, 20, 60, 0.796);
    }
  }
`;
const User = styled.div`
  padding: 30px 20px;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 15px;
  border-bottom: 1px solid #dddddd35;
  img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }
  button {
    padding: 10px 20px;
    background-color: rgba(230, 74, 105, 0.553);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
`;
const Container = styled.div`
  flex: 1;
`;

export default Detail;
