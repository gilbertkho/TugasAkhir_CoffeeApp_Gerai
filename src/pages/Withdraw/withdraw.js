/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';
import default_menu from 'assets/images/default_menu/menu_gerai.png'
import {
  Card, CardTitle, Form, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button, CustomInput, InputGroup,
  InputGroupAddon, InputGroupText, FormText, Breadcrumb, BreadcrumbItem,
  Modal, ModalHeader, ModalBody, ModalFooter, Toast,
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

export default function Withdraw(props) {
  
  const [submitted , setSubmitted] = useState(false)
  const [apikey, setApikey] = useState('');
  const sizePerPage = 5;
  const [param, setParam] = useState({
    page: 1,
    count: sizePerPage,
    apikey: apikey
  })
  const [totalSize, setTotalSize] = useState(0)
  const [history, setHistory] = useState([])
  const [saldo, setSaldo] = useState(0);
  const [req, setReq] = useState({
    jumlah_penarikan: '',
    apikey: apikey
  })

  const resetForm = () => {
    setReq({...req, jumlah_penarikan: ''});
  }

  const inputVal = (val) => {
    setReq({...req, jumlah_penarikan: val});
  }

  const getProfile = () => {
    axios.post('app/gerai/profile',{apikey: apikey}).then(({data}) => {
      if(data.status){
        setSaldo(data.data.saldo_gerai)      
      } else {
      toast.error(data.msg, { containerId: 'B', transition: Zoom });
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

  const getWithdrawHistory = () => {
    axios.post('app/gerai/withdraw/history', param).then(({data}) => {      
      if(data.status){
        console.log(data)
        setHistory(data.data)
        setTotalSize(parseInt(data.total))
      }
      else {
        toast.error(data.msg, { containerId: 'B', transition: Zoom });
      }
    }).catch(error => {
      console.log(error.request)
      console.log(error.response)
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId:'B', transition: Zoom});             
      }
    })

  }

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setParam({...param, apikey: key.key})
        setReq({...req, apikey: key.key})
        setApikey(key.key)
      }
    })
  }, []);
  
  useEffect(() => {    
    if(apikey !== ''){
      getProfile()
    }
  },[apikey])

  useEffect(() => {
    if(param.apikey !== ''){
      getWithdrawHistory()
    }
  },[param])

  const addCommas = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const removeNonNumeric = num => num.toString().replace(/[^0-9]/g, "");

  const requestWithdraw = () => {
    if(req.jumlah_penarikan === '' || req.jumlah_penarikan === '0' || req.jumlah_penarikan === 0){
      toast.error('Harap mengisi jumlah penarikan', {containerId: 'B', transition: Zoom});
      setSubmitted(true)
    }    
    else if(req.jumlah_penarikan > saldo){
      toast.error('Jumlah penarikan melebih saldo tersedia', {containerId: 'B', transition:Zoom});
      setSubmitted(true)
    }
    else{      
      axios.post('app/gerai/withdraw', req).then(({data}) => {
        if(data.status){
          toast.success('Permintaan penarikan berhasil', {containerId:'B', transition:Zoom})
          getProfile();
          getWithdrawHistory()
          setSubmitted(false)
        }
        else{
          toast.error(data.msg, {containerId:'B', transition:Zoom});
          setSubmitted(true)
        }
      }).catch(error => {
        console.log(error)
        if(error.response.status != 500){          
          toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
          setSubmitted(true)
        }
        else{
          toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
          setSubmitted(true)
        }
      })
    }
  }

  const timeFormat = (cell,row) =>{        
    return(
      <>
        {moment(row.tgl_penarikan).format('DD MMMM YYYY, h:mm')}
      </>
    )
  }

  const setNumberFormat = (cell,row) =>{
    if(row.jumlah_penarikan){
      return (
        <>{'Rp.' + addCommas(row.jumlah_penarikan)}</>
      )
    }    
  }

  const statusPesanan  = (cell,row) => {
    return(
      <>
        {row.status_penarikan === 'REQUESTED' ? 
          <p className = 'text-warning m-0 font-weight-bold'>{row.status_penarikan}</p> 
          :
          <p className = 'text-success m-0 font-weight-bold'>{row.status_penarikan}</p> 
        } 
      </>
    )
  }

  const columns = [
  {
    dataField: 'tgl_penarikan',
    text: 'Waktu Penarikan',
    formatter : timeFormat
  }, {
    dataField: 'jumlah_penarikan',
    text: 'Jumlah Penarikan',  
    formatter: setNumberFormat
  },{
    dataField: 'status_penarikan',
    text: 'Status Penarikan',
    formatter: statusPesanan
  }];

  const handleTableChange = (type, { page, sizePerPage }) => {
    setParam((prevState) => ({
      ...prevState,
      page: page
    }))
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <CardTitle>Withdraw Saldo Gerai</CardTitle>
            <Label className = 'font-weight-bold'>Saldo Tersedia: Rp.{addCommas(saldo)}</Label>
            <Form>
              <FormGroup>
                <Label for = "jumlah">Jumlah Penarikan</Label>
                <Input id = "jumlah" value = {addCommas(req.jumlah_penarikan)} invalid={req.jumlah_penarikan === '' && submitted} onChange = {(e) => {inputVal(removeNonNumeric(e.target.value))}}/>
                <FormText color="primary">Setelah pengajuan penarikan dana berhasil, harap menunggu dana untuk masuk maksimal 3x24 jam hari kerja.</FormText>
              </FormGroup>
              <hr />
              <Button 
                color= "primary"
                style = {{ width: "100%", marginTop: "1rem", marginBottom: "1rem" }}
                onClick = {()=>requestWithdraw()}
                >
                Ajukan Penarikan Dana
              </Button>
            </Form>
            <BootstrapTable
            remote
            keyField='id_penarikan'
            data={history}
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
            noDataIndication="Belum ada riwayat penarikan dana"
            wrapperClasses="table-responsive"
          />
          </Card>
        </Col>
      </Row>
    </>
  );
}
