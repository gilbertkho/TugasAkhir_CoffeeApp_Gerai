/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';

import {
  Card, CardTitle, Form, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button, CustomInput, InputGroup,
  InputGroupAddon, InputGroupText, FormText, Breadcrumb, BreadcrumbItem
} from 'reactstrap';
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
import { Columns } from 'react-feather';

export default function AdminReqEditForm(props) {
  const admin = props.location.state.admin;

  const history = useHistory();
  const [req, setReq] = useState({ id: "", name: "", code: "",level:"", condition: "Required", description: "", requirement: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState("add");
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [level2, setlevel2]= useState(false);
  const [level4, setlevel4]= useState(false);

  const changeReq = (field, value) => { setReq({ ...req, [field]: value }); };
  const resetReq = () => { 
    setReq({ id: "", name: "", code: "",level:"", condition: "Required", description: "", requirement: [] }) 
    setlevel2(false);
    setlevel4(false);
  };
  const changeShowPasswordState = () => { setShowPassword(!showPassword) };
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };
  const changeRequirement = (field, index, value) => {
    let oldReq = req.requirement;
    oldReq[index][field] = value;
    setReq({ ...req, requirement: oldReq });
  };

  useEffect(() => {
    if (props.location.state && props.location.state.req) {
      let propsReq = props.location.state.req;
      setReq({
        ...req,
        id: propsReq.id,
        name: propsReq.name,
        code: propsReq.code,
        level: propsReq.level,
        description: propsReq.description,
        condition: propsReq.condition,
        requirement: propsReq.requirement
      });
      setActionType("edit");
      if(propsReq.level==="2,4")
      {
        setlevel2(true);
        setlevel4(true);
      }
      else
      {
        if(propsReq.level==="2")
        {
          setlevel2(true);
        }
        else if(propsReq.level==="4")
        {
          setlevel4(true);
        }
      }
    }
  }, []);
  // useEffect(() => { console.log(req) }, [req]);
  const addRequirement = () => {
    let oldReq = req.requirement;
    oldReq.push({ level: 2, seq: 0, type: "Attachment", condition: "Required" });
    setReq({ ...req, requirement: oldReq });
  }

  const delRequirement = (index) => {
    let oldReq = req.requirement;
    oldReq.splice(index, 1);
    setReq({ ...req, requirement: oldReq });
  }

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.name == '' || req.code == ''||(level2===false&&level4===false) || req.requirement.length < 1) {
      setSubmited(true);
      toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
    } else {
      var isiLevel="";
      if(level2&&level4)
      {
        isiLevel="2,4"
      }
      else
      {
        if(level2){
          isiLevel="2";
        }
        if(level4){
          isiLevel="4";
        }
      }
      console.log("isilevel :"+isiLevel);
      changeSubmitDisableState(true);
      let url = '/b/o/master/admreq/create';
      let successMsg = 'Syarat berhasil ditambahkan';
      if (actionType == 'edit') {
        url = admin ? '/b/o/master/admreq/update' : '/b/o/master/admreq/update/internal';
        successMsg = 'Syarat berhasil diubah';
      }
      axios.post(url, JSON.stringify({
        id:req.id,
        name:req.name,
        level:isiLevel,
        code:req.code,
        condition: req.condition,
        description: req.description,
        requirement: req.requirement
      })).then(({ data }) => {
        if (data.sc == 200) {
          if (data.st) {
            toast.success(successMsg, { containerId: 'B', transition: Zoom });
            if (actionType == 'add') {
              //reset form
              resetReq();
            } else {
              //return to list after timeout
              setTimeout(
                history.push('/master/syarat')
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

  const useEffectIf = (condition, fn) => {
    useEffect(() => condition && fn(), [condition])
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.goBack() }}>Syarat Administrasi</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"}</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Syarat Administrasi" : "Edit Syarat Administrasi"}</CardTitle>
            <Form>
              <FormGroup>
                <Label for="name">Nama Syarat</Label>
                <Input id="name" value={req.name} required onChange={(e) => changeReq("name", e.target.value)} invalid={req.name == '' && submited} />
                <FormFeedback>Nama syarat tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="levelreq">Level</Label>
                <div>
                  <CustomInput type="checkbox" id="level2"
                    name="level2" label="2"
                    invalid={level4 === false&&level2 ===false && submited}
                    checked={level2}
                    onChange={(e) => { 
                      setlevel2(!level2);
                    }} />
                  <CustomInput type="checkbox" id="level4"
                    name="level4" label="4"
                    invalid={level4 === false&&level2 ===false && submited}
                    checked={level4}
                    onChange={(e) => {
                      setlevel4(!level4);
                    }} />
                </div>
                <FormFeedback>Level harus dipilih</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="code">Kode</Label>
                <Input id="code" value={req.code} required
                  onChange={(e) => {
                    if (admin)
                      changeReq("code", e.target.value)
                  }}
                  invalid={req.code == '' && submited}
                  readOnly={!admin} />
                <FormFeedback>Kode tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="description">Deskripsi</Label>
                <Input id="description" type="textarea" value={req.description} onChange={(e) => changeReq("description", e.target.value)} />
              </FormGroup>
              {(req.requirement.map((requirement, index) => {
                return <div key={index}>
                  <hr />
                  Syarat {index + 1}
                  <FormGroup>
                    <Label for="level">Level</Label>
                    <Input id="level"
                      value={requirement.level}
                      onChange={(e) => {
                        if (admin)
                        {
                          let val =e.target.value;
                          changeRequirement("level", index, parseInt(val))
                        }
                      }
                      }
                      readOnly={!admin} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="schoolname">Tipe</Label>
                    <Select
                      disabled={!admin}
                      placeholder="Pilih Tipe"
                      className="register-box"
                      style={{ width: '100%' }}
                      value={requirement.type}
                      onChange={(value, option) => {
                        if (admin)
                          changeRequirement("type", index, value)
                      }}
                    >
                      <Option value="Attachment">Attachment</Option>
                      <Option value="Score">Score</Option>
                      <Option value="Text">Text</Option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label for={"reqoption" + index}>Wajib</Label>
                    <div>
                      <CustomInput type="radio" id={"reqoption" + index + "Required"}
                        name={"reqoption" + index} label="Ya" value="Required"
                        checked={requirement.condition === 'Required'}
                        disabled={!admin}
                        onChange={(e) => {
                          if (admin)
                            changeRequirement("condition", index, e.target.value);
                        }} />
                      <CustomInput type="radio" id={"reqoption" + index + "Optional"}
                        name={"reqoption" + index} label="Tidak"
                        value="Optional" checked={requirement.condition === 'Optional'}
                        disabled={!admin}
                        onChange={(e) => {
                          if (admin)
                            changeRequirement("condition", index, e.target.value);
                        }} />
                    </div>
                    <FormFeedback>Kondisi harus dipilih</FormFeedback>
                  </FormGroup>
                  {admin && <Button color="danger" block onClick={() => delRequirement(index)}>
                    Hapus Syarat {index + 1}
                  </Button>}
                </div>
              }))}
              <hr />
              {admin && <Button color="primary" block onClick={addRequirement}>
                Tambah Syarat
              </Button>}

              {(req.requirement.length < 1 && submited) &&
                <FormText color="danger">
                  Minimal 1 syarat harus ditambahkan
                </FormText>
              }

              <LaddaButton className="btn btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                loading={submitDisable} onClick={_onSubmit}>
                Submit
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
