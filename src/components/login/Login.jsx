import { useState } from "react";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import styled from "styled-components";
import upload from "../../lib/upload";

const Login = () => {
  const [emaillogin, setEmaillogin] = useState("");
  const [passwordlogin, setPasswordlogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user with email and password
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Upload avatar image and get URL
      const imgUrl = avatar.file ? await upload(avatar.file) : "";
      
      // Save user data to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      
      // Initialize user chats in Firestore
      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });
      
      // Show success toast message
      toast.success("Account created! You can login now!", {
        position: "top-center",
      });
    } catch (error) {
      // Show error toast message
      toast.error(error.message, {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign in user with email and password
      await signInWithEmailAndPassword(auth, emaillogin, passwordlogin);
      // Show success toast message
      toast.success("User logged in successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error logging in:", error);
      // Show error toast message
      toast.error(error.message, {
        position: "bottom-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Item>
        <Form onSubmit={handleLogin}>
          <h2>Welcome back,</h2>
          <Input
            type="email"
            placeholder="Email"
            value={emaillogin}
            onChange={(e) => setEmaillogin(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={passwordlogin}
            onChange={(e) => setPasswordlogin(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "loading" : "Sign In"}
          </Button>
        </Form>
      </Item>
      <Separator />
      <Item>
        <Form onSubmit={handleRegister}>
          <h2>Create an Account</h2>
          <Label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an image
          </Label>
          <Input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "loading" : "Sign Up"}
          </Button>
        </Form>
      </Item>
    </Container>
  );
};

const Separator = styled.div`
  height: 80%;
  width: 2px;
  background-color: #dddddd35;
`;
const Button = styled.button`
  width: 100%;
  padding: 20px;
  border: none;
  background-color: #1f8ef1;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  &:disabled {
    cursor: not-allowed;
    background-color: #1f8ff19c;
  }
`;
const Label = styled.label`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-decoration: underline;
  img {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    object-fit: cover;
    opacity: 0.6;
  }
`;
const Input = styled.input`
  padding: 20px;
  border: none;
  outline: none;
  background-color: rgba(17, 25, 40, 0.6);
  color: white;
  border-radius: 5px;
`;
const Form = styled.form`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
`;
const Item = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;
const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 100px;
`;
export default Login;
