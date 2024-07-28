import styled from 'styled-components'
import Userinfo from "./userInfo/Userinfo"
import Chatlist from "./chatList/Chatlist"

const List = () => {
    return (
      <Container>
        <Userinfo/>
        <Chatlist/>
      </Container>
    )
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`
  
export default List