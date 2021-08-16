/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';
import default_voucher from 'assets/images/default_menu/voucher.png'
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
import LaddaButton from 'react-ladda/dist/LaddaButton';
import getApiKey from 'config/getApiKey';

export default function AdminReqEditForm(props) {
  // const admin = props.location.state.admin;
  const history = useHistory();
  const [apikey, setApikey] = useState('');
  const [toAdd, setToAdd] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  // const [catSoal, setCatSoal] = useState([]);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const [req, setReq] = useState({ 
    id_voucher: "",
    nama_voucher: "",
    deskripsi_voucher: "",        
    minimal_pay: "0",
    discount_value: "0",
    value_voucher: "0",
    kode_voucher: "",
    time_start: "",
    time_end: "",
    kuota_voucher: "1",
    status_voucher: "NONAKTIF",
    foto_voucher: "",
    foto: [],
    tipe_voucher: "UMUM",
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
  const changeReq = (field, value) => {   
      setReq({ ...req, [field]: value });    
  };
  useEffect(()=>{
    console.log(req);
  },[req]);
  const resetReq = () => { setReq({ 
    id_voucher: "",
    nama_voucher: "",
    deskripsi_voucher: "",        
    minimal_pay: "",
    discount_value: "",
    value_voucher: "",
    kode_voucher: "",
    time_start: "",
    time_end: "",
    kuota_voucher: "",
    status_voucher: "NONAKTIF",
    foto_voucher: "",
    foto: [],
    tipe_voucher: "UMUM",
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
    // setFilePrev("");
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
    // getIdTipe();
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key)
        setReq({...req, apikey: key.key})
      }
    })
    if (props.location.state && props.location.state.user) {      
      console.log(props.location.state)
      let propsReq = props.location.state.user;
      getApiKey().then((key) => {
        if(key.status){
          setApikey(key.key)
          setReq({
            ...req,
            id_voucher: propsReq.id_voucher,
            nama_voucher: propsReq.nama_voucher,
            deskripsi_voucher: propsReq.deskripsi_voucher,
            minimal_pay: propsReq.minimal_pay,
            discount_value: propsReq.discount_value,
            value_voucher: propsReq.value_voucher,
            kode_voucher: propsReq.kode_voucher,
            time_start: propsReq.time_start,
            time_end: propsReq.time_end,
            kuota_voucher: propsReq.kuota_voucher,
            status_voucher: propsReq.status_voucher,
            foto_voucher: propsReq.foto_voucher,
            tipe_voucher: propsReq.tipe_voucher,
            apikey: key.key
          });          
          setFilePrev(urlConfig.urlBackend + "app/gerai/voucher_photo/" + propsReq.id_voucher + '/' + key.key)
        }
      })
      // setParam({...param,setupid:propsReq.id});
      // setReqMajor({...reqMajor,setupid:propsReq.id});
      // getCategory();
      // let file = [];
      // file.push(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu)
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
  },[req])

  useEffect(() => {
    if(major.length > 0){
      if(major.find((mq) => mq.setupquestion.length <= 0 || !mq.setupquestion)){      
        setReq({...req, examstatus:'Inactive'});      
        axios.post('/b/o/master/exam/setup/update',req).then(({data}) => {    
          console.log(data)
        }).catch(error => {
          toast.error(Errormsg['500'], {containerId:"B", transition:Zoom});
        })
      }
    }
  },[major])

  const addAttachment = (e) => {
    // setAttState(attState + 1);
    // let oldReq = req.attachment;
    // let oldFile = filePrev;    
    // oldReq[index].attachment = e.target.files[0];
    // oldFile[index] = window.URL.createObjectURL(e.target.files[0]);    
    setReq({...req, foto: e.target.files[0], foto_voucher: e.target.files[0].name});
    setFilePrev(window.URL.createObjectURL(e.target.files[0]));
  }

  const removeFotoVoucher = () => {
    console.log("OK")
    setReq({...req,foto:[],foto_voucher:""})
    setFilePrev(default_voucher)
  }

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    console.log("SUBMIT")
    if (req.nama_voucher === ''|| req.deskripsi_voucher === '' || req.kode_voucher === '' || req.time_start === '' || req.time_end === '' || req.status_voucher === '') {
      setSubmited(true);
      toast.error('Harap lengkapi pengisian', { containerId: 'B', transition: Zoom });
    }
    // else if(parseInt(req.minimal_pay) === 0){
    //   setSubmited(true);
    //   toast.error('Pengisian pembayaran minimal tidak boleh bernilai 0 (nol)', { containerId: 'B', transition: Zoom });
    // }
    else if(Date.parse(req.time_start) > Date.parse(req.time_end)){      
      setSubmited(true);
      toast.error('Tanggal berlaku tidak boleh melebihi tanggal berakhir', { containerId: 'B', transition: Zoom });
    }   
    else if((!req.discount_value && !req.value_voucher) || (parseInt(req.discount_value) === 0 && parseInt(req.value_voucher) === 0)){
      setSubmited(true);
      toast.error('Harap mengisi salah satu dari nilai voucher ini', { containerId: 'B', transition: Zoom });
    }
    else {      
      changeSubmitDisableState(true);      
      if(!req.minimal_pay){
        setReq({...req, minimal_pay : '0'})
      }
      if(!req.discount_value){
        setReq({...req, discount_value : '0'})
      }
      if(!req.value_voucher){
        setReq({...req, value_voucher : '0'})
      }
      let date = new Date();
      let h = date.getHours().toString().length === 1 ? "0" + date.getHours() : date.getHours();
      let m = date.getMinutes().toString().length === 1 ? "0" + date.getMinutes() : date.getMinutes();
      let s = date.getSeconds().toString().length === 1 ? "0" + date.getSeconds() : date.getSeconds();
      let time = h + ":" + m + ":" + s;
      // console.log("TIME : ", time)
      // req.time_start = req.time_start + " " + time;
      // req.time_end = req.time_end + " " + time;
      let url = '/app/gerai/voucher/add';
      let successMsg = 'Voucher berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/app/gerai/voucher/update';
        successMsg = 'Voucher berhasil diubah';
      }
      // console.log(url);
      // console.log(req)      
      let formData= new FormData()
      for(let key in req){
        console.log("KEY", key)
        formData.append(key, req[key])
      }
      axios.post(url, formData).then(({ data }) => {        
        if (data.status) {
          toast.success(successMsg, { containerId: 'B', transition: Zoom });
          if (actionType == 'add') {
            //reset form
            // resetReq();
            // console.log(data)
            // "7ac6c7ec-5bc1-11eb-bbea-5347da316c9a"
            setReq({...req, id_voucher:data.data})
            // setParam({...param, setupid:data.data.id})
            // setReqMajor({...reqMajor, setupid:data.data.id})
            // axios.post("/b/o/master/exam/setup/id",{"id":data.data.id}).then(({data})=>{
            //   console.log(data);                
            // }).catch(error=>{
            //   toast.error(Errormsg['500'], {containerId:"B", transition:Zoom})
            // })
            setActionType('edit');
          } else {
            //return to list after timeout
            setTimeout(
              history.push('/master/voucher')
              , 5000);
          }
        } else {          
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
        changeSubmitDisableState(false);
        setSubmited(false);        
        // console.log(res);
      }).catch((error) => {        
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
  };

  // const useEffectIf = (condition, fn) => {
  //   useEffect(() => condition && fn(), [condition])
  // }

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/voucher') }}>Voucher</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Voucher</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Voucher" : "Edit Voucher"}</CardTitle>
            <Form>
              <FormGroup>
                <Label for = "tipe">Tipe Voucher</Label>
                <Input id = "tipe" type = "select" value = {req.tipe_voucher} onChange = {(e) => changeReq("tipe_voucher", e.target.value)}>
                  <option value = "UMUM">Umum</option>
                  <option value = "REWARD">Reward Customer</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for = "name">Nama Voucher</Label>
                <Input id = "name" type = "text" value = {req.nama_voucher} onChange={(e) => changeReq("nama_voucher", e.target.value)} invalid={req.nama_voucher === '' && submited} />
                <FormFeedback>Nama tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "description">Deskripsi Voucher</Label>
                <Input id = "description" type = "textarea" value = {req.deskripsi_voucher} onChange={(e) => changeReq("deskripsi_voucher", e.target.value)} invalid={req.deskripsi_voucher === '' && submited} />
                <FormFeedback>Deskripsi tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "minimal">Pembayaran Minimal</Label>
                <Input id = "minimal" type = "text" value = {addCommas(req.minimal_pay)} onChange={(e) => changeReq("minimal_pay", removeNonNumeric(e.target.value))} invalid = {(req.minimal_pay === '' || parseInt(req.minimal_pay) === 0) && submited}/>
                <FormFeedback>Minimal pembayaran tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "discount">Jumlah Diskon</Label>
                <Input id = "discount" type = "text" value = {addCommas(req.discount_value)} onChange={(e) => changeReq("discount_value", removeNonNumeric(e.target.value))} invalid = {((!req.discount_value && !req.value_voucher && submited) || (parseInt(req.discount_value) === 0 && parseInt(req.value_voucher) === 0) && submited)}/>
                <FormFeedback>Harap mengisi jumlah diskon</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "value">Nilai Voucher / Jumlah Diskon Maksimal</Label>
                <Input id = "value" type = "text" value = {addCommas(req.value_voucher)} onChange={(e) => changeReq("value_voucher", removeNonNumeric(e.target.value))} invalid = {((!req.discount_value && !req.value_voucher && submited) || (parseInt(req.discount_value) === 0 && parseInt(req.value_voucher) === 0) && submited)}/>
                <FormFeedback>Harap mengisi nilai voucher</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "value">Kuota Voucher</Label>
                <Input id = "value" type = "text" value = {addCommas(req.kuota_voucher)} onChange={(e) => changeReq("kuota_voucher", removeNonNumeric(e.target.value))} invalid={req.kuota_voucher <= 0 && submited} />
                <FormFeedback>Harap mengisi jumlah kuota</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "kode">Kode Voucher</Label>
                <Input id = "kode" type = "text" value = {req.kode_voucher} onChange={(e) => changeReq("kode_voucher", e.target.value)} invalid={req.kode_voucher === '' && submited} />
                <FormFeedback>Kode voucher tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "timestart">Tanggal Berlaku</Label>
                <Input id = "timestart" type = "date"                 
                value={req.time_start}
                onChange = {(e) => changeReq("time_start", e.target.value)} 
                invalid = {req.time_start === '' && submited}/>
                <FormFeedback>Tanggal Berlaku tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "timeend">Tanggal Berakhir</Label>
                <Input id = "timeend" type = "date"                                 
                value={req.time_end}
                onChange = {(e) => changeReq("time_end", e.target.value)} 
                invalid = {req.time_end === '' && submited}/>
                <FormFeedback>Tanggal Berakhir tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "voucherstatus" className = "ml-4">
                  <Input id = "voucherstatus" type = "checkbox" checked = {req.status_voucher === "AKTIF" ? true : false} onChange = {() => {changeReq("status_voucher", req.status_voucher === "AKTIF" ? "NONAKTIF" : "AKTIF");}}
                  // disabled = {major.length <=0 || major.find((mq) => mq.setupquestion.length <= 0 || !mq.setupquestion) ? true : false}
                  />
                  Status Voucher Aktif
                </Label>
                <FormText color="primary">Jika aktif maka voucher akan ditampilkan pada aplikasi customer.</FormText>
              </FormGroup>
              <FormGroup>
              <Label for = "foto_voucher">Foto Voucher: </Label>
                <Input type = "file" accept = "image/*" name = "foto_voucher" id = "foto_voucher" onChange = {(e) => addAttachment(e)}/>
              </FormGroup>
                <img src={filePrev} className="img-fluid mb-2"/>
              <Button color="warning" className="w-100" onClick = {removeFotoVoucher}>
                Remove Foto Voucher
              </Button>
              <hr />   
              <hr />    
              <LaddaButton className="btn btn-primary"
                style = {{ width: "100%", marginTop: "1rem" }}
                loading = {submitDisable} onClick = {_onSubmit}>
                Submit
              </LaddaButton>
              <hr />
              <LaddaButton className = "btn btn-secondary"
                style = {{ width: "100%"}}
                loading = {submitDisable} onClick = {resetForm}>
                Tambah Voucher Baru
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
