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
import LaddaButton from 'react-ladda/dist/LaddaButton';
import { parse } from '@fortawesome/fontawesome-svg-core';
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
    id_task: "",
    level_task: "",
    time_start: "",        
    time_end: "",
    kuota_task: "",    
    status_task: "NONAKTIF",
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
  const [voucher, setVoucher] = useState([]);
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};
  useEffect(()=>{
    console.log(req);
  },[req]);
  const resetReq = () => { setReq({ 
    id_voucher: "",
    id_task: "",
    level_task: "",
    time_start: "",        
    time_end: "",
    kuota_task: "",    
    status_task: "NONAKTIF",
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
    // getIdVoucher();
    // getApiKey().then((key) => {
    //   if(key.status){
    //     setApikey(key.key)
    //     setReq({...req, apikey: key.key})
    //   }
    // })
    if (props.location.state && props.location.state.user) {      
      let propsReq = props.location.state.user;
      getApiKey().then((key) => {
        if(key.status){
          setApikey(key.key)
          setReq({
            ...req,
            id_voucher: propsReq.id_voucher,
            id_task: propsReq.id_task,
            level_task: propsReq.level_task,
            time_start: propsReq.time_start,
            time_end: propsReq.time_end,
            kuota_task: propsReq.kuota_task,
            status_task: propsReq.status_task,
            apikey: key.key
          });
        }
      })
      // setParam({...param,setupid:propsReq.id});
      // setReqMajor({...reqMajor,setupid:propsReq.id});
      // getCategory();
      // let file = [];
      // file.push(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu)
      // setFilePrev(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu)
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
    if(apikey !== ''){
      getIdVoucher();
    }
  },[apikey])

  const getIdVoucher = () => {    
    let paramTipe = {
      page : 1,
      count: 1000,
      active: true,
      tipe_voucher: 'REWARD',
      apikey: apikey
    }
    console.log(paramTipe)
    axios.post("/app/gerai/voucher", paramTipe).then(({data}) => {
      console.log(data)
      if(data.status){
        setVoucher(data.data)
      }
      else{
        toast.error(data.msg, {containerId: "B", transition: Zoom})
      }
    }).catch(error => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.id_voucher === '' || req.level_task === '' || req.time_start === '' || req.time_end === '' || req.kuota_task === '' || req.status_task === '' ) {
      setSubmited(true);
      toast.error('Harap lengkapi pengisian', { containerId: 'B', transition: Zoom });
    }
    else if(parseInt(req.level_task) === 0 || parseInt(req.kuota_task) === 0){
      setSubmited(true);
      toast.error('Pengisian tidak boleh bernilai 0 (nol)', { containerId: 'B', transition: Zoom });
    }
    else if(Date.parse(req.time_start) > Date.parse(req.time_end)){     
      setSubmited(true);
      toast.error('Tanggal berlaku tidak boleh melebihi tanggal berakhir', { containerId: 'B', transition: Zoom });
    }
    else {
      changeSubmitDisableState(true);
      let url = '/app/gerai/task/add';
      let successMsg = 'Task berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/app/gerai/task/update';
        successMsg = 'Task berhasil diubah';
      }
      axios.post(url, req).then(({ data }) => {        
        if (data.status) {
          toast.success(successMsg, { containerId: 'B', transition: Zoom });
          if (actionType == 'add') {            
            setReq({...req, id_task:data.data})            
            setActionType('edit');
          } else {
            //return to list after timeout
            setTimeout(
              history.push('/master/task')
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

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/task') }}>Task</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Task</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Task" : "Edit Task"}</CardTitle>
            <Form>              
              <FormGroup>
                <Label for = "level">Level Task</Label>
                <Input id = "level" type = "text" value = {addCommas(req.level_task)} onChange={(e) => changeReq("level_task", removeNonNumeric(e.target.value))} invalid={(req.level_task === '' || parseInt(req.level_task) === 0) && submited} />
                <FormText color="primary">Satuan berdasarkan jumlah langkah kaki</FormText>
                <FormFeedback>Level task tidak boleh kosong</FormFeedback>
              </FormGroup>              
              <FormGroup>
                <Label for = "voucher">Reward Voucher</Label>
                <Input id = "voucher" type = "select" value = {req.id_voucher} onChange={(e) => changeReq("id_voucher", e.target.value)} invalid={req.id_voucher === '' && submited} 
                disabled = {voucher.length <= 0 ? true : false}>
                <option value = "">Pilih reward voucher</option>
                {
                  voucher.length > 0 ?
                  voucher.map((vc, key) => {
                    return(
                      <option key = {key} value = {vc.id_voucher}>{vc.nama_voucher}</option>
                    )
                  })
                  :null
                }
                </Input>                
                <FormFeedback>Harap memilih reward voucher</FormFeedback>
                {
                  voucher.length <= 0 ?
                  <FormText color="warning">Voucher masih belum tersedia.</FormText>
                  :null
                }
              </FormGroup>
              <FormGroup>
                <Label for = "kuota">Kuota Task</Label>
                <Input id = "kuota" type = "text" value = {addCommas(req.kuota_task)} onChange={(e) => changeReq("kuota_task", removeNonNumeric(e.target.value))} invalid={(req.kuota_task === '' || parseInt(req.kuota_task) === 0) && submited} />
                <FormFeedback>Harap mengisi jumlah kuota</FormFeedback>
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
                <Label for = "taskstatus" className = "ml-4">
                  <Input id = "taskstatus" type = "checkbox" checked = {req.status_task === "AKTIF" ? true : false} onChange = {() => {changeReq("status_task", req.status_task === "AKTIF" ? "NONAKTIF" : "AKTIF");}}
                  // disabled = {major.length <=0 || major.find((mq) => mq.setupquestion.length <= 0 || !mq.setupquestion) ? true : false}
                  />
                  Status Task Aktif
                </Label>
                <FormText color="primary">Jika aktif maka task akan ditampilkan pada aplikasi customer.</FormText>
              </FormGroup>              
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
                Tambah Task Baru
              </LaddaButton>             
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
