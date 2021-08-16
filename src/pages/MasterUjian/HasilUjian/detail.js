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
    let propsReq = props.location.state.req;
    console.log(propsReq)
    setParam({...param,id:propsReq.id})
  }, []);

  const history = useHistory();
  const [req, setReq] = useState([]);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const searchRef = useRef();
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    id:''
  });

  const [periodReg, setPeriodReg] = useState([]);
  const [toDelete, setToDelete] = useState(false);
  const [selected, setSelected] = useState({})
  const toggleDelete = (req) => {
    setToDelete(!toDelete);
    setSelectedReq(req)
  };

  const toEditReq = (req) => history.push('/master/ujian/capture', { req: req, admin: user.tu === "Administrator" });

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
  // useEffect(() => { console.log(totalSize) }, [totalSize]);

  const GetActionFormat = (cell, row) => {        
    return (
      <div>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggle(row) }}>
          <FontAwesomeIcon icon={['fa', 'info-circle']} />
        </Button>
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toEditReq(row) }}>
          <FontAwesomeIcon icon={['fa', 'images']} />
        </Button>
        {/* <Button color="danger" className="mr-2" size="sm"
          disabled={user.tu !== "Administrator"}
          onClick={(e) => {
            e.stopPropagation();
            if (user.tu === "Administrator") {
              toggleDelete(row)
            }
          }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button> */}
      </div>
    );   
  }
  
  const waktuUjian = (cell,row) =>{
    console.log(row)
    let date = new Date(row.tstart);
    return(
      <>
        {date.getDate()+ " " + date.toLocaleDateString('default',{month:'long'}) +" "+ date.getFullYear()}
      </>
    )
  }

  const gelombangUjian = (cell,row) => {
    return(
      <>
        Periode {row.yearperiod}, Gelombang {row.wavenum}
      </>
    )
  }

  const statusUjian = (cell,row) => {
    return(
      <>
        <strong className={row.examstatus === "Active" ? "text-success" : "text-danger" }>{row.examstatus}</strong>
      </>
    )
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '150px' };
    }
  }, {
    dataField: 'name',
    text: 'Nama Peserta Ujian',
    // formatter: gelombangUjian
  },
  {        
    dataField: 'tstart',
    text: 'Tanggal Mulai',
    formatter: waktuUjian
  }
  , {
    dataField: 'canswered',
    text: 'Soal Terjawab',
    // formatter: statusUjian
  }, {
    dataField: 'score',
    text: 'Nilai Akhir'
  }];

  const selectRow = {
    mode: 'checkbox',
    clickToSelect: true,
    hideSelectAll: true,
    selectColumnStyle: { width: 40 },
    onSelect: (row, isSelect, rowIndex, e) => {
      // console.log(row.id);
      // console.log(isSelect);
      // console.log(rowIndex);
      // console.log(e);
    },
  };

  function fetchData(param) {    
    axios.post('/b/o/exam/score/detail', JSON.stringify(param)).then(res => res.data)
    .then(data => {
      if (data.st) {
        console.log(data)
        setTotal(data.data.total)
        setReq(data.data.list)
        // columns.forEach()
        console.log(data.data.list);
      } else {
        toast.error(data.msg, { containerId: 'B', transition: Zoom });
      }
    }).catch(error => {
      // if (!error.response) {
      //   alert(error)
      //   return
      // }
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    })    
  }

  useEffect(() => {
    if(param.id){
      fetchData(param)
    }
  }, [param]);

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const deleteHandler = async () => {
    toast.dismiss();
    try {
      let res = await axios.post('/b/o/master/exam/setup/delete', JSON.stringify({
        id: selectedReq.id
      }))
      if (res.data.st) {
        if (param.page == 1) {
          fetchData(param);
        } else {
          setParam((prevState) => ({
            ...prevState,
            page: 1
          }));
        }
        toggleDelete({});
        toast.success("Ujian berhasil dihapus", { containerId: 'B', transition: Zoom });
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setParam((prevState) => ({ ...prevState, search: searchRef.current.value }))
  }

  const chgPeriodReg = (e) => {
    setParam({...param, periodregisterid: e.target.value});    
  }

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

  return (
    <>
      <Modal zIndex={2000} centered isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Detail Hasil Ujian</ModalHeader>        
        <ModalBody>
          <Row>
            <Col xs={6}>Nama Peserta Ujian</Col>
            <Col xs={6}>{": " + selectedReq.name}</Col>
          </Row>
          <Row>
            <Col xs={6}>Soal Terjawab</Col>
            <Col xs={6}>{": " + selectedReq.canswered}</Col>
          </Row>
          <Row>
            <Col xs={6}>Nilai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.score}</Col>
          </Row>
          <Row>
            <Col xs={6}>Selesai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.completed}</Col>
          </Row>
          <Row>
            <Col xs={6}>Tanggal Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[0]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Mulai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[1]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Selesai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tend.split(" ")[1]) : ""}</Col>
          </Row>
          {/* {(selectedReq.requirement && selectedReq.requirement.map((req, index) => {
            if (index == 0) {
              return <Row>
                <Col xs={4}>Ujian</Col>
                <Col xs={8}>{": - " + req.type + " (" + req.condition + ")"}</Col>
              </Row>
            } else {
              return <Row>
                <Col xs={{ size: 8, offset: 4 }}>&nbsp; - {req.type + " (" + req.condition + ")"}</Col>
              </Row>
            }
          }))} */}
        </ModalBody>
        <ModalFooter>
          {/* <Button color="primary" onClick={toggle}>Do Something</Button>{' '} */}
          <Button color="secondary" onClick={toggle}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Modal zIndex={2000} centered isOpen={toDelete} toggle={toggleDelete}>
        <ModalHeader toggle={toggleDelete}>Apakah anda yakin untuk menghapus?</ModalHeader>
        <ModalBody>          
        <Row>
            <Col xs={6}>Nama Peserta Ujian</Col>
            <Col xs={6}>{": " + selectedReq.name}</Col>
          </Row>
          <Row>
            <Col xs={6}>Soal Terjawab</Col>
            <Col xs={6}>{": " + selectedReq.canswered}</Col>
          </Row>
          <Row>
            <Col xs={6}>Nilai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.score}</Col>
          </Row>
          <Row>
            <Col xs={6}>Selesai Ujian</Col>
            <Col xs={6}>{": " + selectedReq.completed}</Col>
          </Row>
          <Row>
            <Col xs={6}>Tanggal Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[0]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Mulai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tstart.split(" ")[1]) : ""}</Col>
          </Row>
          <Row>
            <Col xs={6}>Waktu Selesai Ujian</Col>
            <Col xs={6}>{selectedReq.tstart ? ": " + (selectedReq.tend.split(" ")[1]) : ""}</Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteHandler}>Delete</Button>
          <Button color="secondary" onClick={toggleDelete}>Tutup</Button>
        </ModalFooter>
      </Modal>
      <Card>
        <CardBody>
        <Breadcrumb>
            {/* <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push("/master/ujian/soal") }}>Soal Ujian</a></BreadcrumbItem> */}
            <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push("/master/ujian/hasil",{admin: "Administrator"}) }}>Hasil Ujian</a></BreadcrumbItem>
            <BreadcrumbItem active>Detail Hasil Ujian</BreadcrumbItem>
          </Breadcrumb>          
          <div className="my-2">             
            {/* <Label>Search</Label>
            <Input className="m-0" type="search" placeholder="" innerRef={searchRef} />
            <Button onClick={handleSearch} color="primary" className="mt-2">
              <FontAwesomeIcon icon={['fas', 'search']} />
              <span style={{ marginLeft: 10 }}>
                Cari
              </span>
            </Button> */}
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
                Sudah mencapai batas akhir soal ujian
              </p>
            }
          >
          {req.map((rq, key) => {
            if(key <= perPage){
              return(
                <div key={key} className={rq.iscorrect === "No" ?  "border border-danger mb-2 rounded p-2" : "border border-success mb-2 rounded p-2"}>
                  {rq.iscorrect === "No" ? 
                  <p className = "text-danger text-right mb-0"><strong>Salah.</strong> Jawaban yang benar: {rq.correctanswer}</p>
                  : 
                  <p className = "text-success text-right mb-0"><strong>Benar.</strong></p>}
                  <p><strong>{key + 1 +". "}</strong>{rq.question}</p>
                  <div className="d-flex"
                  style={{ overflowX: 'auto' }}>
                    {rq.attachments.length > 0 ?                
                    rq.attachments.map((rqa, key1) => {
                      return(
                        <a href={urlConfig.urlBackend + "public/attach/" + rqa.attachment} target="_blank" rel="noopener noreferrer" className="m-2 border border-primary" key={key1}>
                          <img src={urlConfig.urlBackend + "public/attach/" + rqa.attachment} alt="lampiran soal" style={{ width: '100px', height: '100px' }}/>
                        </a>
                      )
                    })
                    :null}
                  </div>
                  <hr className="bg-primary"/>
                  {rq.options.map((rqo, key1) => {                                    
                    return(
                      <div key={key1}>                      
                      <CustomInput
                        readOnly                      
                        className = "my-2"
                        type = "radio"
                        id = {rqo.id}
                        name = {rq.id}
                        label = {rqo.optlabel + ". " + rqo.optanswer}
                        value = {rqo.optanswer}                        
                        checked = {rqo.id === rq.answerid ? true : false}                      
                      />
                      <div className="d-flex"
                      style={{ overflowX: 'auto' }}>
                        {rqo.attachments.length > 0 ?
                          rqo.attachments.map((rqoa, key2) => {
                            return(
                              <a href={urlConfig.urlBackend + "public/attach/" + rqoa.attachment} target="_blank" rel="noopener noreferrer" className="m-2 border border-primary" key={key2}>
                                <img src={urlConfig.urlBackend + "public/attach/" + rqoa.attachment} alt="lampiran soal" style={{ width: '100px', height: '100px' }}/>
                              </a>
                            )
                          })
                        : null}
                      </div>
                      </div>
                    )
                  })}
                </div>              
              )
            }            
          })}
          </InfiniteScroll>
          :
          <div className="text-center">            
            <h2>
              Belum ada data hasil ujian.
            </h2>
          </div>}
          {/* <BootstrapTable
            remote
            keyField='id'
            data={req}
            columns={columns}
            // selectRow={selectRow}
            bodyClasses="bootstrap-table"
            pagination={paginationFactory({
              hideSizePerPage: true,
              hidePageListOnlyOnePage: true,
              page: param.page,
              sizePerPage,
              totalSize
            })}
            onTableChange={handleTableChange}
            noDataIndication="Belum ada data ujian"
            wrapperClasses="table-responsive"
          /> */}
        </CardBody>
      </Card>
    </>
  );
}
