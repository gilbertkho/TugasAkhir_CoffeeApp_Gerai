/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';

import {
  Card, CardTitle, Form, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button, CustomInput, InputGroup,
  InputGroupAddon, InputGroupText, FormText, Breadcrumb, BreadcrumbItem,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import axios from 'config/axios';
import Errormsg from "config/errormsg";
import moment from 'moment';
import { useHistory } from 'react-router';
import urlConfig from "config/backend";
import Select, { Option } from 'rc-select';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import { Archive } from 'react-feather';

export default function AdminReqEditForm(props) {
  const admin = props.location.state.admin;

  const history = useHistory();
  const [req, setReq] = useState({ id: "", catid: "", catname: "", question: "", attachment: [] });
  const [ansReq, setAnsReq] = useState({questionid:req.id, optlabel:"A", optanswer:"", attachments:[] });
  const [ans, setAns] = useState([]);
  const [ansKey, setAnsKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState("add");
  const [ansActionType, setAnsActionType] = useState("add");
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [category,setCategory] = useState([]);
  const [filePrev,setFilePrev] = useState([]);
  const [ansFilePrev, setAnsFilePrev] = useState([]);
  const [toDelete, setToDelete] = useState(false);
  const [toAdd, setToAdd] = useState(false);
  let [totalSize, setTotal] = useState(0);
  let [page, setPage] = useState(1);
  const sizePerPage = 100;  
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    questionid: '',
  });
  const [selectedReq, setSelectedReq] = useState({});
  const [attState, setAttState] = useState(0);
  const [ansAttState, setAnsAttState] = useState(0);
  const resetAttState = () => { setAttState(0); }; 
  const resetAnsAttState = () => { setAnsAttState(0); };
  const changeReq = (field, value) => { setReq({ ...req, [field]: value }); };
  const changeAnsReq = (field, value) => { setAnsReq({ ...ansReq,[field]: value}); };
  const resetReq = () => { setReq({  id: "", catid: "", catname: "", question: "", attachment: [] }) };
  const resetAnsReq = () => { setAnsReq({ questionid: req.id, optlabel: "A", optanswer: "", attachments: [] }) };
  const resetFilePrev = () => { setFilePrev([]); };
  const resetAnsFilePrev = () => { setAnsFilePrev([]); };
  const changeShowPasswordState = () => { setShowPassword(!showPassword) };
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };  
  const changeRequirement = (field, index, value) => {
    let oldReq = req.requirement;
    oldReq[index][field] = value;
    setReq({ ...req, requirement: oldReq });
  };

  const resetForm = () => {
    resetReq();
    resetFilePrev()
    setAns([]);
    resetAnsReq();
    resetAnsFilePrev();    
    setParam(
      {
        page: 1,
        count: sizePerPage,
        questionid: '',
      }
    )
    setActionType("add");
  }

  const toggleDelete = (ansreq) => {
    setToDelete(!toDelete);
    setSelectedReq(ansreq)
  };

  const toggleAdd = (ansreq) => {
    setToAdd(!toAdd);
    resetAnsReq();
    resetAnsFilePrev();    
    setAnsActionType("add");
    resetAnsAttState();    
    console.log(ansreq);
    console.log(ansReq)
    console.log(toAdd);    
    let data= {
      req: req,
      ansReq : ansReq,
      ans : ans
    }
    if(ansreq.hasOwnProperty('id')){
      console.log("EDIT");
      data.ansReq = ansreq;
      setAnsReq(ansreq)
      let file = [];
      if(ansreq.attachments.length>0){
        ansreq.attachments.forEach((list,key)=>{
          if(list.attachment.length <=0 || list.id == "" ){
            ansreq.attachments.splice(key,1);
          }
          else{
            file.push(urlConfig.urlBackend+"public/attach/"+list.attachment);          
            setAnsFilePrev(file);          
          }
        })
      }      
      setAnsActionType("edit");
    }
    history.push('/master/ujian/soal/edit/jawaban', data);
    // setSelectedReq(req)
  };
 
  useEffect(() => {
    getCategory();    
    if (props.location.state && props.location.state.req) {
      let propsReq = props.location.state.req;
      console.log(propsReq)
      axios.post("b/o/master/exam/question",{"search" : propsReq.question}).then(({data}) => {
        console.log(data.data.list) 
        let getId = 0;
        data.data.list.forEach((li,key)=>{
          if(li.id === propsReq.id){ 
            getId = key;
            key = data.data.list.length;
            return getId
          }
        })
        console.log("GET ID", getId)
        if( getId >= 0 ){
          setReq({
            ...req,
            id: data.data.list[getId].id,
            catid: data.data.list[getId].catid,
            catname: data.data.list[getId].catname,
            question: data.data.list[getId].question,
            attachment: data.data.list[getId].attachmentlist,
          });
          if(data.data.list[getId].attachmentlist.length > 0){        
            let file = [];
            data.data.list[getId].attachmentlist.map((ra) => {
              file.push(urlConfig.urlBackend + "public/attach/" + ra.attachment);
            })
            setFilePrev(file);
          }          
        }        
      })
      // setReq({
      //   ...req,
      //   id: propsReq.id,
      //   catid: propsReq.catid,
      //   catname: propsReq.catname,
      //   question: propsReq.question,
      //   attachment: propsReq.attachmentlist,        
      // });
      // if(propsReq.attachmentlist.length > 0){        
      //   let file = [];
      //   propsReq.attachmentlist.map((ra) => {
      //     file.push(urlConfig.urlBackend + "public/attach/" + ra.attachment);
      //   })
      //   setFilePrev(file);
      // }
      setParam({...param, questionid: propsReq.id});
      setAnsReq({...ansReq, questionid: propsReq.id});
      setActionType("edit");
    }
  }, []);

  useEffect(()=>{
    console.log(ansReq);
  },[ansReq])  
  
  useEffect(()=>{    
    console.log(category)
  },[category])  

  useEffect(()=>{    
    ans.forEach((an,key)=> {
      if(an.id == ansKey){
        an.action = 1;
        an.key = 1;
        // let tempAns = ans;
        // tempAns[key] = an
        // setAns(tempAns);
      }
      else{
        an.action = 0;
        an.key = 0;
      }      
    });
    console.table(ans);
  },[ans])

  useEffect(()=>{    
    console.log(req)
    if(actionType === "edit"){      
      getAnswer();      
    }
  },[req])

  useEffect(()=>{    
    console.log(ansFilePrev)    
  },[ansFilePrev])

  useEffect(()=>{
    console.log(ansKey);
  },[ansKey])

  useEffect(()=>{    
    console.log("ANSWER ATTACHMENT",ansAttState);
  },[ansAttState])

  useEffect(()=>{
    console.log("ATTACHMENT", attState);
  },[attState])
  // useEffect(() => { console.log(req) }, [req]);

  //attachment soal
  const addRequirement = () => {
    let oldReq = req.attachment;
    let oldFile = filePrev;        
    oldReq.push({ seq: 0, id:"", attachment:[]});
    oldFile.push('');
    setReq({ ...req, attachment: oldReq });    
  }

  const delRequirement = (index) => {
    let oldReq = req.attachment;
    let oldFile = filePrev;    
    // console.log(oldReq[index].id);
    if(actionType=="edit" && oldReq[index].id){
      //attachment delete
      axios.post('/b/o/master/exam/question/attachment/delete',JSON.stringify({
        id : oldReq[index].id
      })).then(({data})=>{
        if (data.st) {
          toast.success("Lampiran berhasil dihapus", {containerId:"B", transition:Zoom});          
        }
        else{
          toast.error(data.msg, { containerId: 'B', transition: Zoom });  
        }
      }).catch((error) => {
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      })
    }
    if(attState > 0){
      setAttState(attState - 1);
    }
    oldReq.splice(index, 1);
    oldFile.splice(index, 1);
    setReq({ ...req, attachment: oldReq });
    setFilePrev(oldFile);
  }

  const addAttachment = (index, e) => {
    setAttState(attState + 1);
    let oldReq = req.attachment;
    let oldFile = filePrev;    
    oldReq[index].attachment = e.target.files[0];
    oldFile[index] = window.URL.createObjectURL(e.target.files[0]);
    setReq({...req, attachment: oldReq });    
    setFilePrev(oldFile);    
  }

  const getCategory = async() =>{
    let data = {
      "page":1,
      "count":100,
      "search":''
    };
    try{
      let cek = await axios.post("/b/o/master/exam/categories",data);
      console.log(cek);
      if(cek.data.st){        
        setCategory(cek.data.data.list);        
      }
    }catch(error){
      toast.error(Errormsg['500'],{containerId:"B",transition:Zoom});
    }
  }

  const getAnswer = () =>{    
    axios.post("/b/o/master/exam/question/option",JSON.stringify(param)).then(res=>res.data)
    .then(data=>{
      console.log(data);
      if(data.st){
        if(data.data.total >= 0 && data.data.list.length >= 0){
          setTotal(data.data.total)        
          setAns(data.data.list)
          if(data.data.answer){
            setAnsKey(data.data.answer.questionoptid);          
          }
        }
      }
      else{
        toast.error(data.msg,{containerId:"B",transition:Zoom})
      }
    })
    .catch(error=>{         
      toast.error(Errormsg['500'],{containerId:"B",transition:Zoom})
    })        
  }

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    let cekAtc = true;
    for(let i = 0; i < req.attachment.length; i++){
      if(req.attachment[i].attachment.length <=0 ){
        toast.error('Harap lengkapi lampiran', { containerId: 'B', transition: Zoom });
        cekAtc = false;
        break
      }
    }
    if(cekAtc){
      if (req.question === '' || req.catid === '') {
        setSubmited(true);
        toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
      } else {                       
        let url = '/b/o/master/exam/question/create';
        let successMsg = 'Soal ujian berhasil ditambahkan';
        changeSubmitDisableState(true);
        if (actionType == 'edit') {          
          url = '/b/o/master/exam/question/update';
          successMsg = 'Soal ujian berhasil diubah';
          //soal edit
          axios.post(url, JSON.stringify({
            questionid: req.id,
            catid: req.catid,
            question: req.question,
          })).then(({ data }) => {
            if (data.sc == 200) {
              if (data.st) {
                setReq({...req, id: req.id})
                toast.success(successMsg, { containerId: 'B', transition: Zoom });
                if(attState > 0){
                  //attachment add
                  let attformData= new FormData();
                  attformData.append('questionid', req.id);
                  req.attachment.forEach((atc) => {
                    attformData.append('attachment', atc.attachment);
                  })
                  axios.post('/b/o/master/exam/question/attachment/add', attformData).then(({data})=>{
                    if (data.st) {
                      setAttState(0)                      
                      console.log(data);
                    }
                    else{
                      toast.error(data.msg, { containerId: 'B', transition: Zoom });  
                    }
                  }).catch((error) => {
                    toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
                  })          
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
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });        
            setSubmited(false);
            changeSubmitDisableState(false);
          })
        }      
        if(actionType=="add"){
          let formData = new FormData();
          formData.append('catid', req.catid);
          formData.append('question', req.question);      
          req.attachment.forEach((atc) => {
            formData.append('attachment', atc.attachment);
          })        
          axios.post(url, formData).then(({ data }) => {
            if (data.sc === 200) {
              if (data.st) {
                toast.success(successMsg, { containerId: 'B', transition: Zoom });
                if (actionType === 'add') {
                  setAttState(0)
                  setReq({...req, id: data.data.id})
                  setParam({...param, questionid: data.data.id});
                  setAnsReq({...ansReq, questionid: data.data.id});
                  setActionType('edit');
                } else {
                  //return to list after timeout
                  setTimeout(
                    history.push('/master/ujian/soal')
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
            toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });        
            setSubmited(false);
            changeSubmitDisableState(false);
          })
        }
      }
    }
  };

  const toggleAnswerKey = (row) =>{    
    axios.post("/b/o/master/exam/question/answer",JSON.stringify({
        questionid: req.id,
        questionoptid: row.id
      })).then(({data})=>{
        if(data.st){
          toast.success("Kunci jawaban berhasil ditetapkan",{containerId:"B", transition:Zoom});          
          getAnswer();
          resetAnsReq();
          resetAnsFilePrev();
          resetAnsAttState();
        }
        else{
          toast.error(data.msg,{containerId:"B", transition:Zoom});
        }
      })
    .catch((error)=>{
      toast.error(Errormsg['500'],{containerId:"B", transition:Zoom});
    })
  }

  const GetActionFormat = (cell, row) => {   
    return (
      <div>        
        <Button color="primary" className="mr-2" size="sm" onClick={(e) => { e.stopPropagation(); toggleAdd(row); }}>
          <FontAwesomeIcon icon={['fa', 'edit']} />
        </Button>        
        <Button color="danger" className="mr-2" size="sm"         
          onClick={(e) => {
            e.stopPropagation();            
            toggleDelete(row)            
          }}>
          <FontAwesomeIcon icon={['fa', 'trash-alt']} />
        </Button>
        <Button color={ansKey == row.id? "success" : "primary"} className="" size="sm" onClick={(e) => { e.stopPropagation(); toggleAnswerKey(row) }}>
          <FontAwesomeIcon icon={['fa', 'check']} />
        </Button>
      </div>
    );    
  }

  const ansKeyFormat = (cell, row) => {   
    return (
      <div>
        {ansKey == row.id?
          <FontAwesomeIcon icon={['fa', 'check-circle']} color="#1bc943" />
        :null}
      </div>
    );    
  }

  const columns = [{
    dataField: 'action',
    text: 'Action',
    formatter: GetActionFormat,
    headerStyle: (column, colIndex) => {
      return { width: '230px' };
    }
  }, {
    dataField: 'optlabel',
    text: 'Label'
  }, {
    dataField: 'optanswer',
    text: 'Jawaban'
  },
  {
    dataField: 'key',
    text: 'Kunci Jawaban',
    formatter: ansKeyFormat,
  },
  ];

  const expandRow = {
    onlyOneExpanding: true,
    showExpandColumn: true,
    // expandByColumnOnly: true,
    onExpand: (row, isExpand) => {      
      return isExpand
      // row.isExpand = false;
    },
    renderer: (row) => {
      row.attachments.forEach(( e, key ) => {
        if(e.attachment.length <=0 || e.id==""){
          row.attachments.splice(key,1);
        }
        // e.id
      });      
      return (
        <>
          <BootstrapTable
            keyField="id"
            data={row.attachments}
            columns={innerColumns}
            noDataIndication="Tidak ada lampiran"
            wrapperClasses="table-responsive"
          />
        </>
      );            
    }
  };

  const formatLampiran = (cell, row, key) => {                
    return (
      <div className="text-center">                
        <img src={urlConfig.urlBackend+"public/attach/"+row.attachment} width="200px" height="200px"/>        
      </div>
    );        
  }

  const innerColumns = [
    {
      dataField: 'attachment',
      text: 'Lampiran',
      formatter: formatLampiran
    },
  ];

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  const deleteHandler = async () => {
    toast.dismiss();
    console.log(selectedReq.id);
    try {
      let res = await axios.post('/b/o/master/exam/question/option/delete', JSON.stringify({
        id: selectedReq.id
      }))
      console.log(res);
      if (res.data.st) {        
        getAnswer();
        toggleDelete({}); 
        toast.success("Jawaban soal ujian berhasil dihapus", { containerId: 'B', transition: Zoom });
      } else {
        toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
    }
  }

  // const useEffectIf = (condition, fn) => {
  //   useEffect(() => condition && fn(), [condition])
  // }

  return (
    <>
      <Row>
        {/* <Card className="w-100 py-2"> */}
          <Col sm = "12" md = {{ size: 6, offset: 3 }}>
            <Card body>
              <Breadcrumb>
                <BreadcrumbItem><a href = "/#" onClick = {(e) => { e.preventDefault(); history.push("/master/ujian/soal") }}>Soal Ujian</a></BreadcrumbItem>
                <BreadcrumbItem active>{actionType === "add" ? "Tambah" : "Edit"} Soal Ujian</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>{actionType === "add" ? "Tambah Soal Ujian" : "Edit Soal Ujian"}</CardTitle>
              <Form>
                <FormGroup>
                  <Label for="name">Kategori Soal Ujian</Label>
                  <Input type="select" id="name" value={req.catid} required onChange={(e) => changeReq("catid", e.target.value)} invalid={req.catid === '' && submited}>
                  <option value="">Pilih Kategori</option>
                    {category.map((cat, key) => {
                      return(
                        <option key = {key} value = {cat.id}>{cat.name}</option>
                      )
                    })}
                  </Input>
                  <FormFeedback>Harap pilih kategori soal ujian</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for = "description">Pertanyaan</Label>
                  <Input id = "description" type = "textarea" value = {req.question} required onChange = {(e) => changeReq("question", e.target.value)} invalid={req.question === '' && submited} />
                  <FormFeedback>Pertanyaan tidak boleh kosong</FormFeedback>
                </FormGroup>
                {(req.attachment.map((requirement, index) => {
                  return <div key = {index}>
                    <hr />
                    Lampiran {index + 1}
                    <FormGroup>
                    <Label for = {"file"+index}>File: </Label>
                    <Input type = "file" accept = "image/*" name = "file" id = {"file"+index} onChange = {(e) => addAttachment(index, e)}/>
                    </FormGroup>
                    <img src={filePrev[index]} className="img-fluid mb-2"/>
                    <Button color="danger" block onClick={() => delRequirement(index)}>
                      Hapus Lampiran {index + 1}
                    </Button>
                  </div>
                }))}
                <hr />
                <Button color = "primary" block onClick={addRequirement}>
                  Tambah Lampiran
                </Button>

                <LaddaButton className = "btn btn-primary"
                  style = {{ width: "100%", marginTop: "1rem" }}
                  loading = {submitDisable} onClick = {_onSubmit}>
                  Submit
                </LaddaButton>
                <hr />
                <LaddaButton className = "btn btn-danger"
                  style = {{ width: "100%" }}
                  loading = {submitDisable} onClick = {resetForm}>
                  Reset
                </LaddaButton>
              </Form>              
              <Modal zIndex = {2000} centered isOpen = {toDelete} toggle = {toggleDelete}>
                <ModalHeader toggle = {toggleDelete}>Apakah anda yakin untuk menghapus?</ModalHeader>
                <ModalBody>
                  <Row>
                    <Col xs = {4}>Label</Col>
                    <Col xs = {8}>{": " + selectedReq.optlabel}</Col>
                  </Row>
                  <Row>
                    <Col xs = {4}>Jawaban</Col>
                    <Col xs = {8}>{": " + selectedReq.optanswer}</Col>
                  </Row>                  
                </ModalBody>
                <ModalFooter>
                  <Button color = "danger" onClick = {deleteHandler}>Delete</Button>
                  <Button color = "secondary" onClick = {toggleDelete}>Tutup</Button>
                </ModalFooter>
              </Modal>                       
            </Card>
          </Col>
          {actionType === "edit" ?
            <Col className = "mt-2">
                <Card body>
                <div className = "my-2">
                  <Button className = "mb-2" color = "primary" block onClick={toggleAdd}>
                    Tambah Jawaban
                  </Button>
                  <hr/>
                  <BootstrapTable              
                  remote
                  keyField = 'id'
                  data = {ans}
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
                  noDataIndication = "Belum ada data jawaban"
                  wrapperClasses = "table-responsive"
                  />
                </div>
                </Card>
            </Col>
          :null}
        {/* </Card> */}
      </Row>
    </>
  );
}
