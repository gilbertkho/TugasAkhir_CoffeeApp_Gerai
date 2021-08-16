/* eslint-disable */
import React, { Fragment, useState, useEffect, useRef } from 'react';

import { useHistory } from 'react-router-dom';
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input, 
  Breadcrumb, BreadcrumbItem, CustomInput
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
import getApiKey from 'config/getApiKey';

export default function ChatList(props) {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  const [apikey, setApikey] = useState('');
  const [hasMore,setHasMore] = useState(true);
  const [perPage,setPerPage] = useState(20);
  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key);
      }
    })    
  }, []);

  const history = useHistory();
  const [req, setReq] = useState([]);
  const sizePerPage = 100;

  const toChat = (req) => history.push('/chat', { req: req, admin: user.tu === "Administrator" });

  const [modal, setModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState({});
  const [sort, setSort] = useState(false);
  const toggle = (req) => { 
    setModal(!modal);
    setSelectedReq(req)
    console.log(req.id)    
  };

  useEffect(()=>{
    if( selectedReq.id ) {
      axios.post("/b/o/exam/score/detail",{
        "page":1,
        "count":100,
        "id":selectedReq.id
      }).then(({data}) => {
        console.log(data)
      }).catch(error => {
        toast.error(Errormsg['500'], {containerId:"B", transition:Zoom});
      })
    }
  },[selectedReq])

  useEffect(() => {
    if(apikey !== ''){
      fetchData()
    }
  },[apikey])

  function fetchData() {
    axios.post('app/gerai/chat',{apikey: apikey}) .then(({data}) => {
      console.log(data)
      if (data.status) {
        console.log(data)        
        setReq(data.data)        
      } else {
        toast.error(data.msg, { containerId: 'B', transition: Zoom });
      }
    }).catch(error => {
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

  function fetchMoreData() {
    if(perPage >= req.length){        
      setHasMore(false)      
    }
    else{
      setTimeout(() => {
        setPerPage(perPage + 20);       
      }, 800);
    }
  }

  return (
    <>      
      <Card style= {{height:'90vh'}}>
        <CardBody>
          <CardTitle>Pesan Pelanggan</CardTitle>
          {req.length > 0 ?
          <InfiniteScroll
            dataLength = {perPage}
            next = {fetchMoreData}
            hasMore = {hasMore}
            loader = {
              <p className="text-center">
                Loading...
              </p>
            }
            // endMessage = {
            //   <p className="text-center">
            //     Sudah mencapai batas akhir soal ujian
            //   </p>
            // }
          >
          
            {req.map((rq, key) => {
              if(key <= perPage){
                return(                  
                  <Card key = {key} onClick = {() => {toChat(req[key])}}>
                    <CardBody className ='mx-2 shadow-sm rounded mb-3'>
                      <CardTitle>{rq.nama}</CardTitle>
                    </CardBody>
                  </Card>
                )
              }            
            })}
            </InfiniteScroll>            
            :
            <div className="text-center">            
              <h2>
                Belum ada pesan.
              </h2>
            </div>}          
        </CardBody>
      </Card>
    </>
  );
}
