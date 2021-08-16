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

export default function UjianEditForm(props) {
  const admin = props.location.state.admin;

  const history = useHistory();
  const [req, setReq] = useState({ id: "", name: "", code: "", condition: "Required", description: "", requirement: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState("add");
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);

  const changeReq = (field, value) => { setReq({ ...req, [field]: value }); };
  const resetReq = () => { setReq({ id: "", name: "", description: ""}) };
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
        description: propsReq.description,
        condition: propsReq.condition,
        requirement: propsReq.requirement
      });
      setActionType("edit");
    }
  }, []);
  // useEffect(() => { console.log(req) }, [req]);

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    if (req.name == '') {
      setSubmited(true);
      toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
    } else {
      changeSubmitDisableState(true);
      let url = '/b/o/master/exam/categories/create';
      let successMsg = 'Kategori berhasil ditambahkan';
      if (actionType == 'edit') {
        url = '/b/o/master/exam/categories/update';
        successMsg = 'Kategori berhasil diubah';
      }
      axios.post(url, req).then(({ data }) => {
        if (data.sc == 200) {
          if (data.st) {
            toast.success(successMsg, { containerId: 'B', transition: Zoom });
            if (actionType == 'add') {
              //reset form
              resetReq();            
            } else {
              //return to list after timeout
              setTimeout(
                history.push('/master/ujian/kategori')
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

  // const cancelForm = () =>{
  //   resetReq();
  //   console.log("OK");
  //   history.push('/master/ujian', { req: req, admin:"Administrator" })    
  // }

  const useEffectIf = (condition, fn) => {
    useEffect(() => condition && fn(), [condition])
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.goBack() }}>Kategori Ujian</a></BreadcrumbItem>
              <BreadcrumbItem active>{actionType == "add" ? "Tambah" : "Edit"}</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{actionType == "add" ? "Tambah Kategori Ujian" : "Edit Kategori Ujian"}</CardTitle>
            <Form>
              <FormGroup>
                <Label for="name">Nama Kategori</Label>
                <Input id="name" value={req.name} required onChange={(e) => changeReq("name", e.target.value)} invalid={req.name == '' && submited} />
                <FormFeedback>Nama kategori tidak boleh kosong</FormFeedback>
              </FormGroup>
              {/* <FormGroup>
                <Label for="code">Kode</Label>
                <Input id="code" value={req.code} required
                  onChange={(e) => {
                    if (admin)
                      changeReq("code", e.target.value)
                  }}
                  invalid={req.code == '' && submited}
                  readOnly={!admin} />
                <FormFeedback>Kode tidak boleh kosong</FormFeedback>
              </FormGroup> */}
              <FormGroup>
                <Label for="description">Deskripsi</Label>
                <Input id="description" type="textarea" value={req.description} onChange={(e) => changeReq("description", e.target.value)} />
              </FormGroup>
              {/* {(req.requirement.map((requirement, index) => {
                return <div key={index}>
                  <hr />
                  Syarat {index + 1} */}
                  {/* <FormGroup>
                    <Label for="level">Level</Label>
                    <Input id="level"
                      value={requirement.level}
                      onChange={(e) => {
                        if (admin)
                          changeRequirement("level", index, e.target.value)
                      }
                      }
                      readOnly={!admin} />
                  </FormGroup> */}
                  {/* <FormGroup>
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
                  </FormGroup> */}
                  {/* <FormGroup>
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
                  </FormGroup> */}
                  {/* {admin && <Button color="danger" block onClick={() => delRequirement(index)}>
                    Hapus Kategori {index + 1}
                  </Button>}
                </div>
              }))} */}
              <hr />
              {/* {admin && <Button color="primary" block onClick={addRequirement}>
                Tambah Kategori
              </Button>} */}

              {/* {(req.requirement.length < 1 && submited) &&
                <FormText color="danger">
                  Minimal 1 kategori harus ditambahkan
                </FormText>
              } */}

              {/* <LaddaButton className="btn btn-danger"
                style={{ width: "100%", marginTop: "1rem" }}
                loading={submitDisable} onClick={cancelForm}>
                Cancel
              </LaddaButton> */}
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
