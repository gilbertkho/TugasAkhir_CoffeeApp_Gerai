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
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons';
import getApiKey from 'config/getApiKey';

export default function AdminReqList(props) {
  const [user, setUser] = useState({
    email: "",
    pict: "",
    tu: "Internal",
    uid: ""
  });
  const [hasMore,setHasMore] = useState(true);
  const [perPage,setPerPage] = useState(5);
  useEffect(() => {
    (async function () {
      let user = await localForage.getItem('user');
      setUser(user);
    })()    
    getApiKey().then((key) => {
      if(key.status){
        setParam({
          ...param,
          apikey: key.key
        })
      }
    })
  }, []);

  const history = useHistory();
  const [rating, setRating] = useState(0);
  const [req, setReq] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    id:'',
    apikey: '',
  });

  const toggleDetail = (user) => { setModal(!modal); setSelectedReq(user) };

  const [modal, setModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState({});
  const [sort, setSort] = useState(false);
  const toggle = (req) => { 
    setModal(!modal);
    setSelectedReq({});    
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
  },[selectedReq]);

  function fetchData(param) {
    axios.post('/app/gerai/rating/review',param)
    .then(({data}) => {
      console.log(data)
      if (data.status) {
        setRating((Math.round(data.data.rating[0].avg * 100) / 100).toFixed(1));
        setTotal(data.data.review.length);
        setReq(data.data.review);
      } else {
        toast.error(data.msg, { containerId: 'B', transition: Zoom });
      }
    }).catch((error) => {      
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    })    
  }

  useEffect(() => {
    if(param.apikey){
      fetchData(param)
    }
  }, [param]);

  function fetchMoreData() {
    if(perPage >= req.length){        
      setHasMore(false)      
    }
    else{
      setTimeout(() => {
        setPerPage(perPage + 5);       
      }, 800);
    }
  }

  const setStar = (rating) => {
    let rows = [];
      for(let i = 0; i < rating; i++){
        rows.push(
          <div key={i} className ='d-inline'>
            <FontAwesomeIcon icon={['fa', 'star']} color='yellow' />            
          </div>
        )
      }
    return rows;
  }

  const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Pesanan</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={4}>ID Pesanan</Col>
            <Col xs={8}>{": " + selectedReq.id_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Nama Pelanggan</Col>
            <Col xs={8}>{": " + selectedReq.nama_pelanggan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Tanggal Pesanan</Col>
            <Col xs={8}>{": " + moment(selectedReq.tgl_pesanan).format('DD-MM-YYYY')}</Col>
          </Row>
          <Row>
            <Col xs={4}>Jumlah Pesanan</Col>
            <Col xs={8}>{": " + selectedReq.total_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Total Harga</Col>
            <Col xs={8}>{modal ? ": " + addCommas(selectedReq.total_harga) : ": " + selectedReq.total_harga}</Col>
          </Row>
          <Row>
            <Col xs={4}>Pengambilan</Col>
            <Col xs={8}>{": " + selectedReq.tipe_pengambilan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Biaya Delivery</Col>
            <Col xs={8}>{modal ? ": " + addCommas(selectedReq.biaya_delivery): ": " + selectedReq.biaya_delivery}</Col>
          </Row>
          <Row>
            <Col xs={4}>Voucher</Col>
            <Col xs={8}>{": " + (selectedReq.nama_voucher !== 'undefined' ? selectedReq.nama_voucher : 'Tidak menggunakan voucher apapun' )}</Col>
          </Row>
          <Row>
            <Col xs={4}>Status Pesanan</Col>
            <Col xs={8}>{": " + selectedReq.status_pesanan}</Col>
          </Row>
          <Row>
            <Col xs={4}>Catatan Tambahan</Col>
            <Col xs={8}>{": " + selectedReq.catatan_tambahan}</Col>
          </Row>
          <Row className = 'p-3'>
              <Col className = 'border border-primary'>
                <p className = 'text-center'>Detail Pesanan</p>
                {
                  selectedReq.detail?
                  selectedReq.detail.map((sd, key) => {                    
                    return(
                      <div key={key} className = 'border mb-2 p-2'>
                        <Row>
                          <Col xs={5}>Nama Menu </Col>
                          <Col xs={7}> : {sd.nama_menu} </Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Total Harga</Col>
                          <Col xs={7}>: {addCommas(sd.total_harga)} </Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Total Pesanan</Col>
                          <Col xs={7}>: {sd.total_pesanan}</Col>
                        </Row>
                        <Row>
                          <Col xs={5}>Menu Tambahan</Col>
                          <Col xs={7}>:</Col>
                        </Row>
                        <Row>
                          <Col>
                              {
                                // console.log(JSON.parse(sd.menu_tambahan))
                                JSON.parse(sd.menu_tambahan)?
                                JSON.parse(sd.menu_tambahan).map((mt, key) => {
                                  return(                                  
                                    <ul key={key}>
                                      <li>
                                        <Row>
                                            <Col xs={3}>Tambahan</Col>
                                            <Col xs={9}>: {mt.nama}</Col>
                                        </Row>
                                        <Row>
                                            <Col xs={3}>Harga</Col>
                                            <Col xs={9}>: {addCommas(mt.harga)}</Col>
                                        </Row>
                                      </li>
                                    </ul>
                                  )
                                })
                                :null
                              }
                          </Col>
                        </Row>
                      </div>
                    )
                  })
                  :null
                }
              </Col>
          </Row>          
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
          <div className = 'bg-light p-2 rounded mb-2'>
            <p className='m-0 d-inline font-weight-bold'>Rating Gerai</p>
            <div class= 'd-flex flex-row align-items-center'>
              <h1 className='m-0 pr-2'>{rating  + ' / 5'}</h1>
              <FontAwesomeIcon icon={['fa', 'star']} size='lg' color='yellow' />
            </div>
          </div>
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
            endMessage = {
              <p className="text-center">
                Sudah mencapai batas akhir rating gerai
              </p>
            }
          >
          {req.map((rq, key) => {
            if(key <= perPage){
              return(
                <div key={key} style={{cursor:'pointer'}} className= "border mb-2 rounded p-2" onClick={toggleDetail.bind(this,rq)}>
                  <p className='font-weight-bold m-0'>{rq.id_pesanan}</p>
                  <p className='m-0'>{moment(rq.tgl_pesanan).format( 'DD MMM YYYY')}</p>
                  {
                    setStar(rq.rating)
                  }
                  <p>{rq.pesan_rating}</p>
                </div>
              )
            }            
          })}
          </InfiniteScroll>
          :
          <div className="text-center">            
            <h2>
              Data rating masih belum tersedia.
            </h2>
          </div>}          
        </CardBody>
      </Card>
    </>
  );
}
