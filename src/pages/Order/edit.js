/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';
import default_menu from 'assets/images/default_menu/menu_gerai.png'
import {
  Card, CardTitle, Form, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button, CustomInput, InputGroup,
  InputGroupAddon, InputGroupText, FormText, Breadcrumb, BreadcrumbItem,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import axios from 'config/axios';
import Errormsg from "config/errormsg";
import moment from 'moment';
import { useHistory } from 'react-router';
import urlConfig from "config/backend";
import Select, { Option } from 'rc-select';
import getApiKey from 'config/getApiKey';
import LaddaButton from 'react-ladda/dist/LaddaButton';

export default function AdminReqEditForm(props) {
  // const admin = props.location.state.admin;
  const history = useHistory();
  const [toAdd, setToAdd] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  const [apikey, setApikey] = useState('');
  // const [catSoal, setCatSoal] = useState([]);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const [req, setReq] = useState({ 
    id_pesanan: "",        
    id_voucher: "",
    nama_pelanggan: "",
    catatan_tambahan: "",
    status_pesanan: "",
    tgl_pesanan: "",
    tipe_pengambilan: "",      
    biaya_delivery: 0,
    total_harga: 0,
    total_pesanan: 0,
    detail: [],
    apikey: apikey,
  });
  const [param, setParam] = useState({
    page: page,
    count: sizePerPage,
    setupid: "",
  });
  const [filePrev, setFilePrev] = useState("");
  const [actionType, setActionType] = useState("add");
  const [submited, setSubmited] = useState(false);
  const [tipeMenu, setTipeMenu] = useState([]);
  const [delivery, setDelivery] = useState({});
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};
  useEffect(()=>{
    console.log(req);
  },[req]);
  const resetReq = () => { setReq({ 
    id_pesanan: "",        
    id_voucher: "",
    nama_pelanggan: "",
    catatan_tambahan: "",
    status_pesanan: "",
    tgl_pesanan: "",
    tipe_pengambilan: "",      
    biaya_delivery: 0,
    total_harga: 0,
    total_pesanan: 0,
    detail: [],
    apikey: apikey,
    })
  };

  let [totalSize, setTotal] = useState(0);
  const [major, setMajor] = useState([]);
  const [reqMajor, setReqMajor] = useState({id:"",  setupid:"", major:"", countquestion:0, setupquestion:[]});
  const [selectedReq, setSelectedReq] = useState({});
  const changeReqMajor = (field, value) => { setReqMajor({ ...reqMajor,[field]: value}); };
  const [majorActionType, setMajorActionType] = useState("add");  
  const [submitDisable, setSubmitDisable] = useState(false);
  const [periodReg, setPeriodReg] = useState([]);
  const [category, setCategory] = useState([]);
  const resetMajor = () => { setMajor([]) }
  const [countQ, setCountQ] = useState(0);
  const resetCountQ = () => { setCountQ(0) };
  const resetReqMajor = () => { setReqMajor({id:"",  setupid: param.setupid, major:"", countquestion:"", setupquestion:[] })};
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };
  const changeRequirement = (field, index, value) => {
    let oldReq = req.requirement;
    oldReq[index][field] = value;
    setReq({ ...req, requirement: oldReq });
    // console.log(req);
  };

  const resetForm = () => {
    resetReq();
    setFilePrev("");
    // resetMajor();
    // resetReqMajor();
    // setParam({
    //   page: page,
    //   count: sizePerPage,
    //   setupid: "",
    // })
    setActionType("add");
  }

  useEffect(() => {
    // getPeriodReg();
    resetForm();
    if (props.location.state && props.location.state.user) {      
      console.log(props.location.state)
      let propsReq = props.location.state.user;
      getApiKey().then((key) => {
        if(key.status){
          setApikey(key.key)
          setReq({...req,
            id_pesanan: propsReq.id_pesanan,
            tgl_pesanan: propsReq.tgl_pesanan,
            id_voucher: propsReq.id_voucher,
            nama_pelanggan: propsReq.nama_pelanggan,
            catatan_tambahan: propsReq.catatan_tambahan,
            status_pesanan: propsReq.status_pesanan,
            tipe_pengambilan: propsReq.tipe_pengambilan,
            biaya_delivery: propsReq.biaya_delivery,
            total_harga: propsReq.total_harga,
            total_pesanan: propsReq.total_pesanan,
            detail: propsReq.detail, 
            apikey: key.key
          })
        }
      });
      // setReq({
      //   ...req,
      //   id_pesanan: propsReq.id_pesanan,
      //   tgl_pesanan: propsReq.tgl_pesanan,
      //   id_voucher: propsReq.id_voucher,
      //   nama_pelanggan: propsReq.nama_pelanggan,
      //   catatan_tambahan: propsReq.catatan_tambahan,
      //   status_pesanan: propsReq.status_pesanan,
      //   tipe_pengambilan: propsReq.tipe_pengambilan,
      //   biaya_delivery: propsReq.biaya_delivery,
      //   total_harga: propsReq.total_harga,
      //   total_pesanan: propsReq.total_pesanan,
      //   detail: propsReq.detail,
      // });
      // setParam({...param,setupid:propsReq.id});
      // setReqMajor({...reqMajor,setupid:propsReq.id});
      // getCategory();
      let file = [];
      file.push(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu)
      setFilePrev(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu)
      setActionType("edit");
    }
  }, []);
  
  useEffect(() => {
    console.log(reqMajor)
  },[reqMajor])
  
  useEffect(() => {
    console.table(category)
  },[category])

  useEffect(() => {
    console.log(req); 
    if(actionType === "edit"){                    
      // getMajorSetup();
    }
    if(req.tipe_pengambilan === 'diantar' && req.apikey !== ''){
      getDeliveryDetail();
    }
  },[req])

  const getDeliveryDetail = () => {
    axios.post('/app/gerai/delivery/detail', {id_pesanan: req.id_pesanan, apikey: apikey}).then(({data}) => {
      if(data.status){
        console.log(data.data)
        data.data.price = req.total_harga;
        data.data.apikey = apikey;
        setDelivery(data.data);
      }
      else{
        toast.error(data.msg, {containerId:'B', transition:Zoom})
      }

    })
    .catch(error => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }        
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      }
    })
  }

  const UpdateStatus = () => {
    axios.post('/app/gerai/order/process', req).then(({data})=>{ 
      if(data.status){
        toast.success('Status pesanan berhasil diubah', {containerId:'B', transition:Zoom})
      }
      else{
        toast.error(data.msg, {containerId:'B', transition:Zoom})
      }
    })
    .catch((error) => {        
      console.log(error.response)
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }        
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      }
      setSubmited(false);
      changeSubmitDisableState(false);
    })
  }

  const _onSubmit = (e) => {
    e.preventDefault();    
      axios.post('/app/gerai/delivery', delivery).then(({ data }) => {
        if(data.status){
          toast.success(data.msg, {containerId:'B', transition: Zoom});

        }
        else{
          toast.error(data.msg, {containerId:'B', transition: Zoom});
        }
      }).catch((error) => {        
        console.log(error.response)
        console.log(error.request)
        if(error.response){
          if(error.response.data.msg){
            setReq({...req, tipe_pengambilan: "diantar"})
            toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
          }
          else{
            toast.error(error.response.data.message,{containerId:'B', transition:Zoom});
          }
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
        }
        setSubmited(false);
        changeSubmitDisableState(false);
      })    
  };

  const toggleAdd = (reqmajor) => {
    resetCountQ();
    resetReqMajor();
    setMajorActionType("add");
    let data= {
      req : req,
      reqMajor: reqMajor,
      param: param,
      major: major
    }
    if(reqmajor.hasOwnProperty('id')){
      data.reqMajor = reqmajor
      setReqMajor(reqmajor)
      if(reqmajor.setupquestion.length > 0){
        reqmajor.setupquestion.forEach((list,key)=>{
          if(list.countquestion === 0 || list.categoryquestionid === "" || list.id === ""){
            reqmajor.setupquestion.splice(key,1);
          }
        })
      }      
      setMajorActionType("edit");
    }
    setToAdd(!toAdd);
    history.push('/master/ujian/setting/edit/jurusan', data);
  };

  const toggleDelete = (reqmajor) => {
    setToDelete(!toDelete);
    setSelectedReq(reqmajor)
  };

  const GetActionFormat = (cell, row) => {   
    return (
      <div>        
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleAdd(row) }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>
        <Button color="danger" className="mr-2" size="sm"         
          onClick={(e) => {
            e.stopPropagation();            
            toggleDelete(row)
          }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>        
      </div>
    );    
  }

  const innerColumns = [
    {
      dataField: 'categoryname',
      text: 'Nama Kategori',
    },
    {
      dataField: 'countquestion',
      text: 'Jumlah Soal',      
    },    
  ];

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '230px' };
    }
  }, {
    dataField: 'major',
    text: 'Jurusan'
  }, {
    dataField: 'countquestion',
    text: 'Jumlah Pertanyaan'
  }
  ];  

  const expandRow = {
    onlyOneExpanding: true,
    showExpandColumn: true,
    renderer: (row) => {            
      row.setupquestion.forEach((e,key) => {        
        e.id
      });
      return (
        <>
          <BootstrapTable
            keyField="id"
            data={row.setupquestion}
            columns={innerColumns}
            noDataIndication="Tidak ada soal"
            wrapperClasses="table-responsive"
          />
        </>
      );      
    }
  };

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/order') }}>Order</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Proses"} Order</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Menu" : "Proses Order"}</CardTitle>
            <Form>              
              <FormGroup>
                <Label for = "tipemenu">ID Pesanan</Label>                
                <Input id = "tipemenu" value = {req.id_pesanan} invalid={req.id_pesanan === '' && submited} disabled />                
              </FormGroup>
              <FormGroup>
                <Label for = "tgl">Tanggal Pesanan</Label>
                <Input id = "tgl" type = "text" value = {moment(req.tgl_pesanan).format('DD-MM-YYYY')} onChange={(e) => changeReq("nama_menu", e.target.value)} invalid={req.nama_menu === '' && submited} disabled/>                
              </FormGroup>
              <FormGroup>
                <Label for = "nama">Nama Pelanggan</Label>
                <Input id = "nama" type = "text" value = {req.nama_pelanggan} onChange={(e) => changeReq("deskripsi_menu", e.target.value)} invalid={req.deskripsi_menu === '' && submited} disabled/>
                <FormFeedback>Deskripsi tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "harga">Total Harga</Label>
                <Input id = "harga" type = "text" value = {addCommas(req.total_harga)} onChange={(e) => changeReq("harga_menu", removeNonNumeric(e.target.value))} invalid={(req.harga_menu === '' || parseInt(req.harga_menu) === 0) && submited} disabled/>
                <FormFeedback>Harga tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "pengambilan">Pengambilan</Label>
                <Input id = "pengambilan" value = {req.tipe_pengambilan } onChange = {() => {changeReq("status_menu", req.status_menu === "AKTIF" ? "NONAKTIF" : "AKTIF");}} disabled />
              </FormGroup> 
              <FormGroup>
              <Label for = "biaya">Biaya Delivery </Label>
                <Input id = "biaya" value = {addCommas(req.biaya_delivery)} disabled/>
              </FormGroup>
              <FormGroup>
              <Label for = "voucher">Voucher </Label>
                <Input id = "voucher" value = {req.id_voucher} disabled/>
              </FormGroup>
              <FormGroup>
              <Label for = "status">Status Pesanan</Label>
                <Input id = "status" value = {req.status_pesanan} type='select' onChange = {(e) => changeReq('status_pesanan',e.target.value)}>
                  <option value = 'DIPROSES'>DIPROSES</option>
                  {
                    req.tipe_pengambilan === 'diantar' ?
                    <option value = 'DIANTAR'>DIANTAR</option>
                    :
                    <option value = 'SIAP DIAMBIL'>SIAP DIAMBIL</option>
                  }
                </Input>
              </FormGroup>
              <Button color="info" className="w-100" onClick = {UpdateStatus}>
                Ubah status pesanan
              </Button>
              <Row className = 'p-3'>
                <Col className = 'border border-primary'>
                  <p className = 'text-center'>Detail Pesanan</p>
                  {
                    req.detail?
                    req.detail.map((sd, key) => {                      
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
                                              <Col xs={4}>Tambahan</Col>
                                              <Col xs={8}>: {mt.nama}</Col>
                                          </Row>
                                          <Row>
                                              <Col xs={4}>Harga</Col>
                                              <Col xs={8}>: {addCommas(mt.harga)}</Col>
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
                    : null
                  }
                </Col>
              </Row>
              {
                delivery && delivery.id_delivery ?
                <Row className = 'p-3'>
                  <Col className = 'border border-primary'>
                    <p className = 'text-center'>Detail Pengiriman</p>
                    <Row>
                        <Col xs={5}>Nama</Col>
                        <Col xs={7}>: {delivery.nama_customer}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Nomor Telepon</Col>
                        <Col xs={7}>: {delivery.no_telp_cust}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Alamat</Col>
                        <Col xs={7}>: {delivery.alamat_delivery}</Col>
                    </Row>
                    <Row>
                        <Col xs={5}>Biaya Pengiriman</Col>
                        <Col xs={7}>: {addCommas(delivery.biaya_delivery)}</Col>
                    </Row>
                  </Col>
                </Row>
                : null
              }
              <hr />
              {req.tipe_pengambilan === 'diantar' ?
                <LaddaButton className="btn btn-primary"
                  style = {{ width: "100%", marginTop: "1rem" }}
                  loading = {submitDisable} onClick = {_onSubmit}>
                  Kirim Pesanan
                </LaddaButton>
                : null 
              }
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
