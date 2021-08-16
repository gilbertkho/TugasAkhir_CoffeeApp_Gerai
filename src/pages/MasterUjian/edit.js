/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';

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

export default function AdminReqEditForm(props) {
  const admin = props.location.state.admin;
  const history = useHistory();
  const [toAdd, setToAdd] = useState(false);
  const [toDelete, setToDelete] = useState(false);
  const [catSoal, setCatSoal] = useState([]);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;
  const [req, setReq] = useState({ 
    id: "",
    periodregisterid: "",        
    description: "",
    datestart: "",
    dateend: "",
    yearperiod: "",
    wavenum: 0,
    examstatus: "Inactive",
    duration: 0
  });
  const [param, setParam] = useState({
    page: page,
    count: sizePerPage,
    setupid: "",
  });
  let [totalSize, setTotal] = useState(0);
  const [major, setMajor] = useState([]);
  
  const [reqMajor, setReqMajor] = useState({id:"",  setupid:"", major:"", countquestion:0, setupquestion:[]});
  const [selectedReq, setSelectedReq] = useState({});
  const changeReqMajor = (field, value) => { setReqMajor({ ...reqMajor,[field]: value}); };
  const [actionType, setActionType] = useState("add");
  const [majorActionType, setMajorActionType] = useState("add");  
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [periodReg, setPeriodReg] = useState([]);
  const [category, setCategory] = useState([]);
  const resetMajor = () => { setMajor([]) }
  const [countQ, setCountQ] = useState(0);
  const resetCountQ = () => { setCountQ(0) };
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};
  useEffect(()=>{
    console.log(req);
  },[req]);
  const resetReq = () => { setReq({ 
    id: "",
    periodregisterid: "",        
    description: "",
    datestart: "",
    dateend: "",
    yearperiod: "",
    wavenum: 0,
    examstatus: "Inactive",
    duration: 0
    })
  };
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
    resetMajor();
    resetReqMajor();
    setParam({
      page: page,
      count: sizePerPage,
      setupid: "",
    })
    setActionType("add");
  }

  useEffect(() => {    
    getPeriodReg();
    resetForm();
    if (props.location.state && props.location.state.req) {      
      let propsReq = props.location.state.req;
      setReq({
        ...req,
        id: propsReq.id,
        periodregisterid: propsReq.periodregisterid,        
        description: propsReq.description,
        datestart: propsReq.datestart,
        dateend: propsReq.dateend,
        yearperiod: propsReq.yearperiod,
        wavenum: parseInt(propsReq.wavenum),
        examstatus: propsReq.examstatus,
        duration: parseInt(propsReq.duration)
      });      
      setParam({...param,setupid:propsReq.id});
      setReqMajor({...reqMajor,setupid:propsReq.id});
      getCategory();
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
      getMajorSetup();
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
  
  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if(Date.parse(req.datestart) > Date.parse(req.dateend)){
      setSubmited(true);
      toast.error('Harap periksa kembali tanggal ujian', { containerId:"B", transition:Zoom });
    }
    else if (req.periodregisterid === ''|| req.description === '' || req.datestart === '' || req.dateend === '' || req.examstatus === '' || req.duration === 0 || req.duration === '') {
      setSubmited(true);
      toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
    }
    else if (req.duration < 1) {
      setSubmited(true);
      toast.error('Durasi tidak bisa kurang dari 1', { containerId: 'B', transition: Zoom });
    }
    else {      
      changeSubmitDisableState(true);
      let url = '/b/o/master/exam/setup/create';
      let successMsg = 'Ujian berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/b/o/master/exam/setup/update';
        successMsg = 'Ujian berhasil diubah';
      }
      console.log(url);
      console.log(req)
      axios.post(url, req).then(({ data }) => {
        if (data.sc == 200) {
          if (data.st) {
            toast.success(successMsg, { containerId: 'B', transition: Zoom });
            if (actionType == 'add') {
              //reset form
              // resetReq();
              // console.log(data)
              // "7ac6c7ec-5bc1-11eb-bbea-5347da316c9a"
              setReq({...req, id:data.data.id})
              setParam({...param, setupid:data.data.id})
              setReqMajor({...reqMajor, setupid:data.data.id})
              // axios.post("/b/o/master/exam/setup/id",{"id":data.data.id}).then(({data})=>{
              //   console.log(data);                
              // }).catch(error=>{
              //   toast.error(Errormsg['500'], {containerId:"B", transition:Zoom})
              // })
              setActionType('edit');
            } else {
              //return to list after timeout
              setTimeout(
                history.push('/master/ujian/setting')
                , 5000);
            }
          } else {
            console.log("error");
            toast.error(data.msg, { containerId: 'B', transition: Zoom });
          }
          changeSubmitDisableState(false);
          setSubmited(false);
        }
        // console.log(res);
      }).catch((error) => {
        // if (error.response) {
          toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        // }
        // toast.error(Errormsg["500"], { containerId: 'B', transition: Zoom });
        setSubmited(false);
        changeSubmitDisableState(false);
      })
    }
  };

  // const useEffectIf = (condition, fn) => {
  //   useEffect(() => condition && fn(), [condition])
  // }

  const getPeriodReg = () => {
    axios.post("/b/o/master/periodregister",JSON.stringify({
      page: 1, count: 100
    }))
    .then((data)=>{      
      // console.log(data);
      if(data.data.st){
        setPeriodReg(data.data.data.list);        
        //console.log(periodReg)
      }
      else{
        toast.error(data.data.msg,{containerId: "B", transition:Zoom});
      }
    })
    .catch((error)=>{
      toast.error(Errormsg[500],{containerId: "B", transition:Zoom });
    })
  }

  const getCategory = () => {  
    axios.post("/b/o/master/exam/categories",JSON.stringify({
     page:1, count:100
    }))
    .then((data)=>{      
      console.log(data)
      if(data.data.st){
        setCategory(data.data.data.list); 
        // console.log(category);       
      }
      else{
        toast.error(data.data.msg, {containerId:"B", transition:Zoom});
      }
    })
    .catch((error)=>{
      toast.error(Errormsg[500], {containerId:"B", transition:Zoom});
    })
  }

  const getMajorSetup = () => {    
    axios.post('b/o/master/exam/setup/major',JSON.stringify(param))
    .then(({data})=>{
      if(data.st){
        console.table(data.data.list);
        setTotal(data.data.total);
        data.data.list.forEach((dl, key) => {
          if(!dl.setupquestion){
            data.data.list[key].setupquestion = [];
          }
        })
        setMajor(data.data.list);
      }
      else{
        toast.error(data.msg,{containerId:"B", transition:Zoom});
      }
    }).catch(error => {
      toast.error(Errormsg['500'],{containerId:"B", transition:Zoom})
    })
  }

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

  // const addMajorQuestion = () => {
    //   let oldReq = reqMajor.setupquestion;    
  //   oldReq.push({id:"", setupmajorid:reqMajor.id, categoryquestionid:"", countquestion:0});    
  //   setReqMajor({ ...reqMajor, setupquestion: oldReq });
  //   setCountQ(countQ + 1);
  // }

  // const deleteMajorQuestion = (index) => {
  //   let oldReq = reqMajor.setupquestion;
  //   if(majorActionType=="edit" && oldReq[index].id){
  //     axios.post("/b/o/master/exam/setup/question/delete",JSON.stringify({
  //       id:oldReq[index].id
  //     })).then(({data})=>{
  //       if (data.st) {
  //         toast.success("Soal berhasil dihapus", {containerId:"B", transition:Zoom});          
  //       }
  //       else{
  //         toast.error(data.msg, { containerId: 'B', transition: Zoom });  
  //       }
  //     }).catch((error) => {
  //       toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
  //     })
  //   }
  //   if(countQ > 0){
  //     setCountQ(countQ - 1);
  //   }
  //   oldReq.splice(index, 1);
  //   setReqMajor({ ...reqMajor, setupquestion: oldReq });
  // }

  // const changeMajorQuestion = (field,index,value) =>{
  //   let oldQuestion = reqMajor.setupquestion;
  //   oldQuestion[index][field]= value;
  //   console.log(oldQuestion)
  //   setReqMajor({ ...reqMajor, setupquestion:oldQuestion });
  // }

  const deleteHandler = async () => {
    toast.dismiss();
    console.log(selectedReq);
    try {
      let res = await axios.post('/b/o/master/exam/setup/major/delete', JSON.stringify({
        id: selectedReq.id
      }))
      console.log(res);
      if (res.data.st) {        
        getMajorSetup();
        toggleDelete({});
        toast.success("Jurusan ujian berhasil dihapus", { containerId: 'B', transition: Zoom });
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  const addHandler = async () => {
    toast.dismiss();
    let cekQuest = true;
    for(let i=0; i<reqMajor.setupquestion.length; i++){
      if(reqMajor.setupquestion[i].categoryquestionid == "" ||  reqMajor.setupquestion[i].countquestion == 0){
        toast.error('Harap lengkapi pengaturan soal', { containerId: 'B', transition: Zoom });
        cekQuest = false;
        break
      }
    }
    if(cekQuest){
      if(reqMajor.countquestion == 0 || reqMajor.countquestion == '' || reqMajor.major == ''){
        toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
      }
      else{        
        let url = '/b/o/master/exam/setup/major/create';
        let successMsg = 'Jurusan ujian berhasil ditambahkan';
        if (majorActionType == 'edit') {
          if(countQ>0){
            console.log({...reqMajor.setupquestion[reqMajor.setupquestion.length-1]})
            axios.post("/b/o/master/exam/setup/question/add",{...reqMajor.setupquestion[reqMajor.setupquestion.length-1]}).then(({data})=>{
              if(data.st){
                console.log(data);
              }
              else{
                toast.error(data.msg, {containerId:"B", transition:Zoom});
              }
            }).catch((error) => {
              toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
            })
          }
          url = '/b/o/master/exam/setup/major/update';          
          successMsg = 'Jurusan ujian berhasil diubah';
          axios.post(url, JSON.stringify(reqMajor)).then(({ data }) => {
            if (data.sc == 200) {
              if (data.st) {
                toast.success(successMsg, { containerId: 'B', transition: Zoom });              
                  toggleAdd({});
                  getMajorSetup();                  
              } else {
                console.log("error");
                toast.error(data.msg, { containerId: 'B', transition: Zoom });
              }
            }
          }).catch((error) => {        
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
          })
        }
        if(majorActionType=="add"){
          // console.log(formData)
          console.log(reqMajor);
          axios.post(url, JSON.stringify(reqMajor)).then(({ data }) => {
            if (data.sc == 200) {
              if (data.st) {
                toast.success(successMsg, { containerId: 'B', transition: Zoom });               
                toggleAdd({});
                getMajorSetup();                              
              } else {
                console.log("error");
                toast.error(data.msg, { containerId: 'B', transition: Zoom });
              }
              // changeSubmitDisableState(false);
              // setSubmited(false);
            }
            // console.log(res);
          }).catch((error) => {        
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });        
            // setSubmited(false);
            // changeSubmitDisableState(false);
          })
        }
      }
    }
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/ujian/setting') }}>Ujian</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Ujian</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Ujian" : "Edit Ujian"}</CardTitle>
            <Form>
              <FormGroup>
                <Label for="period">Periode Ujian</Label>
                <Input type="select" name="period" id="period" onChange={(e)=>{changeReq("periodregisterid", e.target.value)}} value={req.periodregisterid} invalid={req.periodregisterid === '' && submited}>
                  <option value="">Pilih Periode Ujian</option>
                  {
                    periodReg.map((pr, key) => {                     
                      return(
                      <option key={key} value={pr.id}>{pr.yearperiod + " Gelombang: " + pr.wavenum}</option>
                      );
                    })
                  }
                </Input>
                <FormFeedback>Harap memilih periode ujian</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "description">Deskripsi</Label>
                <Input id = "description" type = "textarea" value = {req.description} onChange={(e) => changeReq("description", e.target.value)} invalid={req.description === '' && submited} />
                <FormFeedback>Deskripsi tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "datestart">Tanggal Mulai Ujian</Label>
                <Input id = "datestart" type = "date"                 
                value={req.datestart}
                onChange = {(e) => changeReq("datestart", e.target.value.substr(0, 10))} 
                invalid = {req.datestart === '' && submited}/>
                <FormFeedback>Tanggal Mulai tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "dateend">Tanggal Selesai Ujian</Label>
                <Input id = "dateend" type = "date"
                value={req.dateend}
                onChange = {(e) => changeReq("dateend", e.target.value.substr(0, 10))} 
                invalid = {req.dateend === '' && submited} />
                <FormFeedback>Tanggal Selesai tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "examstatus" className = "ml-4">
                  <Input id = "examstatus" type = "checkbox" checked = {req["examstatus"] === "Active" ? true : false} onChange={() => changeReq("examstatus", req.examstatus === "Active" ? "Inactive" : "Active")}
                  disabled = {major.length <=0 || major.find((mq) => mq.setupquestion.length <= 0 || !mq.setupquestion) ? true : false}
                  />
                  Status Ujian Aktif
                </Label>
                <FormText color="primary">Untuk mengubah status ujian harap mengisi jurusan ujian dan pastikan kategori soal sudah terisi.</FormText>
              </FormGroup>
              <FormGroup>
                <Label for = "durasi">Durasi Ujian (Menit)</Label>
                <Input id = "durasi" className = "text-right" type = "number" step = "1" min = "1" onChange={(e) => changeReq("duration", parseInt(e.target.value))} value = {req.duration} invalid = {req.duration === '' && submited}/>
                <FormFeedback>Durasi tidak boleh kosong</FormFeedback>
              </FormGroup>              
              <hr />                    
              <LaddaButton className="btn btn-primary"
                style = {{ width: "100%", marginTop: "1rem" }}
                loading = {submitDisable} onClick = {_onSubmit}>
                Submit
              </LaddaButton>
              <hr />
              <LaddaButton className = "btn btn-danger"
                style = {{ width: "100%"}}
                loading = {submitDisable} onClick = {resetForm}>
                Reset
              </LaddaButton>
            </Form>
          </Card>
        </Col>
          <Modal zIndex = {2000} centered isOpen = {toDelete} toggle = {toggleDelete}>
            <ModalHeader toggle = {toggleDelete}>Apakah anda yakin untuk menghapus?</ModalHeader>
            <ModalBody>
              <Row>
                <Col xs = {6}>Jumlah Pertanyaan</Col>
                <Col xs = {6}>{": " + selectedReq.countquestion}</Col>
              </Row>
              <Row>
                <Col xs = {6}>Jurusan</Col>
                <Col xs = {6}>{": " + selectedReq.major}</Col>
              </Row>
              {/* <Row>
                <Col xs={4}>Deskripsi</Col>
                <Col xs={8}>{": " + selectedReq.description}</Col>
              </Row> */}
            </ModalBody>
            <ModalFooter>
              <Button color = "danger" onClick = {deleteHandler}>Delete</Button>
              <Button color = "secondary" onClick = {toggleDelete}>Tutup</Button>
            </ModalFooter>
          </Modal> 
        {actionType === "edit"?
            <Col className = "mt-2">
                <Card body>
                <div className = "my-2">
                  <Button className = "mb-2" color="primary" block onClick = {toggleAdd}>
                    Tambah Jurusan Ujian
                  </Button>
                  <hr/>
                  <BootstrapTable              
                  remote
                  keyField = 'id'
                  data = {major}
                  columns = {columns}
                  // selectRow={selectRow}
                  bodyClasses = "bootstrap-table"
                  pagination = {paginationFactory({
                    hideSizePerPage: true,
                    hidePageListOnlyOnePage: true,
                    page: param.page,
                    sizePerPage,
                    totalSize
                  })}
                  expandRow = {expandRow}
                  onTableChange = {handleTableChange}
                  noDataIndication = "Belum ada data jurusan"
                  wrapperClasses = "table-responsive"
                  />
                </div>
                </Card>
            </Col>
          :null}
      </Row>
    </>
  );
}
