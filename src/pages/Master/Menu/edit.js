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
import getApiKey from 'config/getApiKey';
import { key } from 'localforage';

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
    id_menu: "",
    id_tipe: "",
    nama_menu: "",        
    deskripsi_menu: "",
    harga_menu: "",
    status_menu: "NONAKTIF",
    foto_menu: "",
    foto: [],
    apikey: '',
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
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};

  const resetReq = () => { setReq({ 
    id_menu: "",
    id_tipe: "",
    nama_menu: "",        
    deskripsi_menu: "",
    harga_menu: "",
    status_menu: "NONAKTIF",
    foto_menu: "",
    foto: [],
    apikey: '',    
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
            id_menu: propsReq.id_menu,
            id_tipe: propsReq.id_tipe,
            nama_menu: propsReq.nama_menu,
            deskripsi_menu: propsReq.deskripsi_menu,
            harga_menu: propsReq.harga_menu,
            status_menu: propsReq.status_menu,
            foto_menu: propsReq.foto_menu,
            apikey: key.key
          });
          let file = [];
          file.push(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu + "/" + key.key)
          setFilePrev(urlConfig.urlBackend + "app/gerai/menu_photo/" + propsReq.id_menu + "/" + key.key)
        }
      })
      // setParam({...param,setupid:propsReq.id});
      // setReqMajor({...reqMajor,setupid:propsReq.id});
      // getCategory();      
      setActionType("edit");
    }
  }, []);

  useEffect(() => {
    if(apikey !== ''){
      getIdTipe();
    }
  },[apikey])

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
  
  const getIdTipe = () => {
    let paramTipe = {
      page : 1,
      count: 100,
      apikey: apikey
    }
    axios.post("/app/gerai/tipemenu", paramTipe).then(({data}) => {
      console.log(data)
      if(data.status){
        setTipeMenu(data.data)
      }
      else{
        toast.error(data.msg, {containerId: "B", transition: Zoom})
      }
    }).catch(error => {
      console.log(error)
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }        
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      }
    })
  }

  const addAttachment = (e) => {
    // setAttState(attState + 1);
    // let oldReq = req.attachment;
    // let oldFile = filePrev;    
    // oldReq[index].attachment = e.target.files[0];
    // oldFile[index] = window.URL.createObjectURL(e.target.files[0]);    
    setReq({...req, foto: e.target.files[0], foto_menu: e.target.files[0].name});
    setFilePrev(window.URL.createObjectURL(e.target.files[0]));
  }

  const removeFotoMenu = () => {
    console.log("OK")
    setReq({...req,foto:[],foto_menu:""})
    setFilePrev(default_menu)
  }

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.tipe_menu === ''|| req.nama_menu === '' || req.deskripsi_menu === '' || req.harga_menu === '' || req.status_menu === '' ) {
      setSubmited(true);
      toast.error('Harap lengkapi pengisian', { containerId: 'B', transition: Zoom });
    }
    else if (parseInt(req.harga_menu) === 0) {
      setSubmited(true);
      toast.error('Pengisian harga menu tidak boleh  bernilai 0 (nol)', { containerId:"B", transition:Zoom });
    }
    else {
      changeSubmitDisableState(true);
      let formData= new FormData()
      for(let key in req){
        formData.append(key, req[key])
      }
      let url = '/app/gerai/menu/add';
      let successMsg = 'Menu berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/app/gerai/menu/update';
        successMsg = 'Menu berhasil diubah';
      }
      // console.log(url);
      // console.log(req)
      axios.post(url, formData).then(({ data }) => {        
        if (data.status) {
          toast.success(successMsg, { containerId: 'B', transition: Zoom });
          if (actionType == 'add') {
            //reset form
            // resetReq();
            // console.log(data)
            // "7ac6c7ec-5bc1-11eb-bbea-5347da316c9a"
            setReq({...req, id_menu:data.data})
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
              history.push('/master/menu')
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
    axios.post('app/gerai/tipe_menu',JSON.stringify(param))
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

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/menu') }}>Menu</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Menu</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Menu" : "Edit Menu"}</CardTitle>
            <Form>              
              <FormGroup>
                <Label for = "tipemenu">Tipe Menu</Label>
                <Input id = "tipemenu" type = "select" value = {req.id_tipe} onChange={(e) => changeReq("id_tipe", e.target.value)} invalid={req.id_tipe === '' && submited}
                disabled = {tipeMenu.length <= 0 ? true : false}>
                  <option value="">Pilih tipe menu</option>
                  {     
                    tipeMenu.length > 0 ?
                    tipeMenu.map((tm, key) => { 
                      return(
                        <option key={key} value={tm.id_tipe}>{tm.nama_tipe}</option>
                      );
                    })
                    :null
                  }
                  </Input>
                <FormFeedback>Harap memilih tipe menu</FormFeedback>
                {
                  tipeMenu.length <= 0 ?
                  <FormText color="warning">Tipe menu masih belum tersedia.</FormText>
                  :null
                }
              </FormGroup>
              <FormGroup>
                <Label for = "name">Nama Menu</Label>
                <Input id = "name" type = "text" value = {req.nama_menu} onChange={(e) => changeReq("nama_menu", e.target.value)} invalid={req.nama_menu === '' && submited} />
                <FormFeedback>Nama tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "description">Deskripsi Menu</Label>
                <Input id = "description" type = "textarea" value = {req.deskripsi_menu} onChange={(e) => changeReq("deskripsi_menu", e.target.value)} invalid={req.deskripsi_menu === '' && submited} />
                <FormFeedback>Deskripsi tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "harga">Harga Menu</Label>
                <Input id = "harga" type = "text" value = {addCommas(req.harga_menu)} onChange={(e) => changeReq("harga_menu", removeNonNumeric(e.target.value))} invalid={(req.harga_menu === '' || parseInt(req.harga_menu) === 0) && submited} />
                <FormFeedback>Harga tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "menustatus" className = "ml-4">
                  <Input id = "menustatus" type = "checkbox" checked = {req.status_menu === "AKTIF" ? true : false} onChange = {() => {changeReq("status_menu", req.status_menu === "AKTIF" ? "NONAKTIF" : "AKTIF");}}
                  // disabled = {major.length <=0 || major.find((mq) => mq.setupquestion.length <= 0 || !mq.setupquestion) ? true : false}
                  />
                  Status Menu Aktif
                </Label>
                <FormText color="primary">Jika aktif maka menu akan ditampilkan pada aplikasi customer.</FormText>
              </FormGroup> 
              <FormGroup>
              <Label for = "foto_menu">Foto Menu: </Label>
                <Input type = "file" accept = "image/*" name = "foto_menu" id = "foto_menu" onChange = {(e) => addAttachment(e)}/>
              </FormGroup>
                <img src={filePrev} className="img-fluid mb-2"/>
              <Button color="warning" className="w-100" onClick = {removeFotoMenu}>
                Remove Foto Menu
              </Button>
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
                Tambah Menu Baru
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
