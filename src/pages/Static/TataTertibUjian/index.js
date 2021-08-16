/* eslint-disable */
import React, { Fragment, useState, useEffect } from 'react';

import {
  Card, CardTitle, Form, FormGroup, Label, Input,
  FormFeedback, Col, Row, Button, CustomInput, InputGroup,
  InputGroupAddon, InputGroupText, Breadcrumb, BreadcrumbItem, FormText
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast, Zoom } from 'react-toastify';
import axios from 'config/axios';
import Errormsg from "config/errormsg";
import moment from 'moment';
import { useHistory } from 'react-router';
import urlConfig from "config/backend";
import LaddaButton from 'react-ladda/dist/LaddaButton';
import { ValidateEmail } from 'utils/validation';
import TextareaAutosize from 'react-autosize-textarea';

export default function UserEditForm(props) {
  // console.log("props", props);
  const history = useHistory();
  const [tatib, setTatib] = useState("");
  const [actionType, setActionType] = useState("add");
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [emailErr, setEmailErr] = useState('');

  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };

  useEffect(() => {
    _getTatib();
  }, []);
  // useEffect(() => { console.log(user) }, [user]);

  const _getTatib = async () => {
    changeSubmitDisableState(true);
    axios.post("/b/o/static/tatib").then(({ data }) => {
      if (data.sc == 200) {
        if (data.st) {
          // console.log("user profile", data);
          setTatib(data.data);
        } else {
          // console.log("error");
          toast.error(data.msg, { containerId: 'B', transition: Zoom });
        }
        changeSubmitDisableState(false);
      }
      // console.log(res);
    }).catch((error) => {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      // toast.error(Errormsg["500"], { containerId: 'B', transition: Zoom });
      changeSubmitDisableState(false);
    })
  };

  const _onSubmit = (e) => {
    e.preventDefault();
    toast.dismiss();
    let valid = true;
    setSubmited(true);

    if (valid) {
      changeSubmitDisableState(true);
      let url = '/b/o/static/tatib/edit';
      axios.post(url, { text: tatib }).then(({ data }) => {
        if (data.sc == 200) {
          if (data.st) {
            toast.success("Tata tertib ujian berhasil diubah", { containerId: 'B', transition: Zoom });
          } else {
            // console.log("error");
            toast.error(data.msg, { containerId: 'B', transition: Zoom });
          }
          changeSubmitDisableState(false);
          setSubmited(false);
        }
        // console.log(res);
      }).catch((error) => {
        // toast.error(error.response.data.msg, { containerId: 'B', transition: Zoom });
        toast.error(Errormsg["500"], { containerId: 'B', transition: Zoom });
        changeSubmitDisableState(false);
        setSubmited(false);
      })
    }
  };

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <CardTitle>Tata Tertib Ujian</CardTitle>
            <Form>
              <FormGroup>
                <Label>Halaman Tata Tertib Ujian</Label>
                <FormText color="primary">Apit tulisan dengan bintang (*) untuk membuat font menjadi bold</FormText>
                <TextareaAutosize className="form-control" onChange={(e)=>{setTatib(e.target.value)}} value={tatib}/>
              </FormGroup>
              <LaddaButton className="btn btn-primary btn-block" loading={submitDisable} onClick={_onSubmit}>
                Submit
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
