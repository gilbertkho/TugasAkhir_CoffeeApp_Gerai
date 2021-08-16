/* eslint-disable */
import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input, 
  Breadcrumb, BreadcrumbItem, CustomInput, Toast
} from 'reactstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import axios from "config/axios";
import urlConfig from "config/backend";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import moment from "moment";
import localForage from 'config/localForage';
import Errormsg from 'config/errormsg';
import { GiftedChat } from 'react-web-gifted-chat';
import useWebSocket, {ReadyState} from 'react-use-websocket';
import io from "socket.io-client";
import getApiKey from 'config/getApiKey';

let ENDPOINT = urlConfig.urlBackend;

export default function Chat(props) {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  let socket = io(ENDPOINT);
  const [apikey, setApikey] = useState('');
  const [text, setText] = useState('')
  const [req, setReq] = useState([]);
  const [messages, setMessages] = useState([]);
  const [send, setSend] = useState(false);
  const [socketId, setSocketId] = useState('');

  const [socketUrl, setSocketUrl] = useState('ws://localhost:8090/tes')
  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  const messageHistory = useRef([]);  

  useEffect(() => {
    if (props.location.state && props.location.state.req) {
      let propsReq =  props.location.state.req
      setReq(propsReq)
      if(propsReq.isi_chat){
        socket.on("connect", (data) => {
          console.log('connect',socket.id)
          setSocketId(socket.id);
          socket.emit('join-room', propsReq.id_gerai, propsReq.id_chat)
        });
        // JSON.parse(propsReq.isi_chat)
        getApiKey().then((key) => {
          if(key.status){  
            setApikey(key.key)
            axios.post('app/gerai/chat/add', {
              id_customer: propsReq.id_customer,
              apikey: key.key
            }).then(({data}) => {
              if(data.status){
                if(data.data.isi_chat){                  
                  setMessages(JSON.parse(data.data.isi_chat))
                  messageHistory.current = JSON.parse(data.data.isi_chat)                 
                  console.log('okisi')
                  console.log(propsReq.id_gerai)
                  console.log(propsReq.id_chat)                  
                }
              }
              else{
                toast.error(data.msg,{containerId:'B', transition:Zoom})
              }
            }).catch(error => {
              setSend(false)
              if(error.response){
                if(error.response.status != 500){
                  toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
                }
              }
              else{
                toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
              }
            })
          }
        })
        // setMessages(JSON.parse(propsReq.isi_chat))
      }
    }
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
    // return () => socket.disconnect();
  }, []);

  useEffect(() => {
    console.log('ini req',req)
    // setMessages([
    //   {
    //     id: new Date().getTime(),
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       id: req.id_customer,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    // ])
  },[req])


  useEffect(() => {
    if(send){

    }
  },[send])

  const onSend = useCallback((message = []) => {    
    message[0]._id =  message[0].id;    
    console.log(message[0].user);
    setMessages(previousMessages => GiftedChat.append(previousMessages, message))
    setSend(true)
  }, [])

  useEffect(() => {
    console.log(messages)
    if(req && req.id_chat && send){
      console.log(send)      
      // console.log(req.id_chat)
      // socket.emit('join-room',req.id_gerai, req.id_chat)
      socket.emit('chatapp', JSON.stringify(messages), req.id_chat)
      axios.post('/app/gerai/chat/send',{
        id_chat: req.id_chat,
        isi_chat: JSON.stringify(messages),
        apikey: apikey
      }).then(({data}) => {
        setSend(false)
        if(data.status){
          toast.success('Pesan OK',{transition:Zoom, containerId:'B'});
        }
        else{
          toast.error(data.msg, {containerId:'B', transition:Zoom});
        }      
      })
      .catch(error => {
        setSend(false)
        if(error.response){
          if(error.response.status != 500){
            toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
          }
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
        }
      })
    }
  },[messages])

  const history = useHistory();

  useEffect(() => {
    console.log(text)
  },[text])
  
  const sent = (val) => {
    let msg = {
      id: new Date().getTime(),
      text: val,
      createdAt: new Date(),
      user: {
        id: req.id_customer,
        name: 'React',
        avatar: 'https://facebook.github.io/react/img/logo_og.png',
      }
    }
    setMessages(previousMessages => GiftedChat.append(previousMessages, msg))
  }

  const handleClickSendMessage = useCallback(() =>
    sendMessage(JSON.stringify(messages)), [messages]);

  messageHistory.current = useMemo(() =>
    messageHistory.current.concat(lastMessage),[lastMessage]);

  useEffect(() => {
    console.log('ini message history', messageHistory)
  },[messageHistory])

  // socket.on("connect", (data) => {
    socket.on('receive-msg', (msg) => {      
      // console.log('ok');
      // console.log(JSON.parse(msg));
      setMessages(JSON.parse(msg))
      messageHistory.current = JSON.parse(msg)
    })
  // })

  // useEffect(() => {
  //   console.log('ok1231')
  // },[socket])

  return (
    <>      
      <Card style= {{height:'90vh'}}>
        {/* <Text></Text> */}
        <CardTitle className = 'text-center m-2 bg-secondary p-2 rounded'>{req.nama}</CardTitle>
        <CardTitle className = 'text-center m-2 bg-secondary p-2 rounded'>{socketId}</CardTitle>
        <CardBody>
            <GiftedChat
              className = 'bg-dark'
              messages={messages}
              onSend={messages => onSend(messages)}
              user={{
                id: req.id_gerai,
                _id: req.id_gerai
              }}
            />
        </CardBody>
        {/* <Input type='text' onChange = {(e) => {setText(e.target.value)}}/> */}
        {/* <Button onClick = {sent.bind(this,text)}>Send</Button>
        <span>The WebSocket is currently {connectionStatus}</span> */}
        {/* {lastMessage ? <span>Last message: {lastMessage.data}</span> : null} */}
        {/* <ul>
          {messageHistory.current
            .map((message, idx) => <li key={idx}>{message ? message.data : null}</li>)}
        </ul>
        <Button
          onClick={handleClickSendMessage}
          disabled={readyState !== ReadyState.OPEN}
        >
          Click Me to send 'Hello'
        </Button>       */}
      </Card>
    </>
  );
}
