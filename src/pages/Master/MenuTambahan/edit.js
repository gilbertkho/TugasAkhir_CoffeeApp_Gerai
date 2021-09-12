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

export default function MenuTambahanEditForm(props) {
  // const admin = props.location.state.admin;
  const history = useHistory();
  const [apikey, setApikey] = useState('')
  const [req, setReq] = useState({ 
    id_menu_tambahan: "",
    nama_menu: "",
    harga_menu: '',
    apikey: apikey
  });
 
  const [actionType, setActionType] = useState("add");
  const [submited, setSubmited] = useState(false);  
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};
  
  const resetReq = () => { setReq({ 
      id_menu_tambahan: "",
      nama_menu: "",
      harga_menu: '',
      apikey: apikey
    })
  };
  const [submitDisable, setSubmitDisable] = useState(false);
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };

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
        setReq({
          ...req,          
          apikey: key.key
        });
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
            id_menu_tambahan: propsReq.id_menu_tambahan,
            nama_menu: propsReq.nama_menu,
            harga_menu: propsReq.harga_menu,
            apikey: key.key
          });
        }
      })      
      setActionType("edit");
    }
  }, []);
  
  useEffect(() => {
    console.log(req); 
    if(actionType === "edit"){                    
      // getMajorSetup();
    }
  },[req])

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.nama_menu === '' || req.harga_menu === '') {
      setSubmited(true);
      toast.error('Harap lengkapi semua pengisian', { containerId: 'B', transition: Zoom });
    }
    else {      
      changeSubmitDisableState(true);     
      let url = '/app/gerai/menu_tambahan/add';
      let successMsg = 'Menu tambahan berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/app/gerai/menu_tambahan/update';
        successMsg = 'Menu tambahan berhasil diubah';
      }
      // console.log(url);
      // console.log(req)
      axios.post(url, req).then(({ data }) => {        
        if (data.status) {
          toast.success(successMsg, { containerId: 'B', transition: Zoom });
          if (actionType == 'add') {            
            setReq({...req, id_menu_tambahan:data.data})          
            setActionType('edit');
          } else {
            //return to list after timeout
            setTimeout(
              history.push('/master/menu_tambahan')
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
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/menu_tambahan') }}>Menu Tambahan</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Menu Tambahan</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Menu tambahan" : "Edit Menu Tambahan"}</CardTitle>
            <Form>                          
              <FormGroup>
                <Label for = "name">Nama Menu Tambahan</Label>
                <Input id = "name" type = "text" value = {req.nama_menu} onChange={(e) => changeReq("nama_menu", e.target.value)} invalid={req.nama_menu === '' && submited} />
                <FormFeedback>Nama tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for = "name">Harga Menu Tambahan</Label>
                <Input id = "name" type = "text" value = {addCommas(req.harga_menu)} onChange={(e) => changeReq("harga_menu", removeNonNumeric(e.target.value))} invalid={req.harga_menu === '' && submited} />
                <FormFeedback>Harga tidak boleh kosong</FormFeedback>
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
                Tambah Menu Tambahan Baru
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
