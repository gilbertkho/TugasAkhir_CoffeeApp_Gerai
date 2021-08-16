import React from 'react';
import axios from "config/axios";
import {
  Card, CardTitle, CardBody, Button, Modal, ModalHeader,
  ModalBody, ModalFooter, Row, Col, Label, Input,
  FormGroup, FormFeedback
} from 'reactstrap';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';
import { useState, useEffect } from "react";

export default function ExportExcel(){
  const [periodReg, setPeriodReg] = useState([]);
  const [selected, setSelected] = useState(0);
  const getPeriodRegister = () =>{
    axios.post("/b/o/master/periodregister",{}).then(({data}) => {
      if(data.st){        
        // data.data.list.push({
        //   "id":"tes",
        //   "wavenum":"10",
        //   "yearperiod":"2021",
        // })
        setPeriodReg(data.data.list)        
      }
      else{
        toast.error(data.msg, {containerId:"B", transition:Zoom});
      }
    })
    .catch(error => {
      toast.error(Errormsg['500'], {containerId:"B", transition:Zoom});
    })
  }

  const handleExport = () =>{
    axios({
      url:"/b/o/master/examcandidate/export",
      data: {
        "periodid":periodReg[selected].id
      },
      method:'POST',
      responseType: 'blob'
    }).then(({data}) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'peserta_psikotes_'+periodReg[selected].yearperiod+'_gelombang_'+periodReg[selected].wavenum+'.csv'); //or any other extension
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => {
      toast.error(Errormsg['500'], {containerId:"B", transition:Zoom})
    })
  }

  useEffect(() => {
    getPeriodRegister()    
  },[])

  useEffect(() => {
    console.log(periodReg[selected])
  },[selected,periodReg])  

  return (
    <Card>
      <CardBody>
        <CardTitle>Export Data Peserta Psikotes</CardTitle>
        <Label for="period">Periode</Label>
          <Input id="period" name="period" type = "select" onChange={(e)=>setSelected(e.target.value)}>            
            {periodReg.map((pr,key) => {
              return(
                <option key={key} value={key}>{pr.yearperiod + " Gelombang: " + pr.wavenum}</option>
              )
            })}
          </Input>
          <Button onClick={handleExport} color="primary" className="mt-2">            
            <span>
              Export Excel
            </span>
          </Button>
      </CardBody>
    </Card>    
  )
} 
