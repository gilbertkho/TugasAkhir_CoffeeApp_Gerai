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

export default function ChatList(props) {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 10;
  const [hasMore,setHasMore] = useState(true);
  const [perPage,setPerPage] = useState(20);
  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()
    // fetchData();
  }, []);

  const history = useHistory();
  const [req, setReq] = useState([{
    day : 'monday',
    open : '',
    close : '',
  },{
    day : 'tuesday',
    open : '',
    close : '',
  },{
    day : 'wednesday',
    open : '',
    close : '',
  },{
    day : 'thursday',
    open : '',
    close : '',
  },{
    day : 'friday',
    open : '',
    close : '',
  },{
    day : 'saturday',
    open : '',
    close : '',
  },{
    day : 'sunday',
    open : '',
    close : '',
  },]);

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

  function fetchData() {
    axios.get('app/gerai/openhour') .then(({data}) => {
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

  const columns = [{     
    dataField: 'day',
    text: 'Hari',
  }, {
    dataField: 'open',
    text: 'Buka',
  }, {
    dataField: 'close',
    text: 'Tutup',
  }];

  return (
    <>      
      <Card style= {{height:'90vh'}}>
        <CardBody>          
          <CardTitle>Jam Operasi</CardTitle>          
          <BootstrapTable
            remote
            keyField='day'
            data={req}
            columns={columns}
            // selectRow={selectRow}
            bodyClasses="bootstrap-table"
            // onTableChange={handleTableChange}
            noDataIndication="Belum ada jam operasi"
            wrapperClasses="table-responsive"
          />
        </CardBody>
      </Card>
    </>
  );
}
