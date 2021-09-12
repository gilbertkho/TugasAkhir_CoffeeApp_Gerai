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

export default function MenuEditForm(props) {
  // const admin = props.location.state.admin;
  const history = useHistory();
  const [apikey, setApikey] = useState('');
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
  
  const [submitDisable, setSubmitDisable] = useState(false);

  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };

  const resetForm = () => {
    resetReq();
    setFilePrev("");
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
  },[req])
  
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
