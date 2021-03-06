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

export default function TipeMenuEditForm(props) {
  // const admin = props.location.state.admin;
  const history = useHistory();
  const [apikey, setApikey] = useState('')
  const [req, setReq] = useState({ 
    id_tipe : "",
    nama_tipe: "",
    apikey: apikey,
  });
 
  const [actionType, setActionType] = useState("add");
  const [submited, setSubmited] = useState(false);
  const changeReq = (field, value) => { setReq({ ...req, [field]: value });};
  useEffect(()=>{
    console.log(req);
  },[req]);
  const resetReq = () => { setReq({ 
    id_tipe: "",
    nama_tipe: "",
    apikey: apikey
    })
  };

  const [submitDisable, setSubmitDisable] = useState(false);  
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };

  const resetForm = () => {
    resetReq();
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
            id_tipe: propsReq.id_tipe,
            nama_tipe: propsReq.nama_tipe,
            apikey: key.key
          });
        }
      })      
      setActionType("edit");
    }
  }, []);

  useEffect(() => {
    console.log(req);    
  },[req])

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.nama_tipe === '') {
      setSubmited(true);
      toast.error('Harap lengkapi pengisian', { containerId: 'B', transition: Zoom });
    }    
    else {
      changeSubmitDisableState(true);     
      let url = '/app/gerai/tipemenu/add';
      let successMsg = 'Tipe Menu berhasil ditambahkan';
      if (actionType === 'edit') {
        url = '/app/gerai/tipemenu/update';
        successMsg = 'Tipe Menu berhasil diubah';
      }
      axios.post(url, req).then(({ data }) => {        
        if (data.status) {
          toast.success(successMsg, { containerId: 'B', transition: Zoom });
          if (actionType == 'add') {            
            setReq({...req, id_tipe:data.data})           
            setActionType('edit');
          } else {
            //return to list after timeout
            setTimeout(
              history.push('/master/tipemenu')
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

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.push('/master/tipemenu') }}>Tipe Menu</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"} Tipe Menu</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Tipe Menu" : "Edit Tipe Menu"}</CardTitle>
            <Form>                          
              <FormGroup>
                <Label for = "name">Nama Tipe</Label>
                <Input id = "name" type = "text" value = {req.nama_tipe} onChange={(e) => changeReq("nama_tipe", e.target.value)} invalid={req.nama_tipe === '' && submited} />
                <FormFeedback>Nama tidak boleh kosong</FormFeedback>
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
                Tambah Tipe Menu Baru
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
