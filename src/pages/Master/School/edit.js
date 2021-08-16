import React, { useState } from 'react';
import { useHistory } from 'react-router';
import {
  Card,
  CardBody,
  CardTitle,
  Col,
  FormGroup,
  Row,
  Form,
  Label,
  Input,
  FormFeedback,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import Errormsg from 'config/errormsg';

export default function SchoolEdit(props) {
  const history = useHistory();
  if (!props.location.state) {
    history.goBack();
  }
  const schoolObject = props.location.state.school;
  const [nameErr, setNameErr] = useState(false);
  const [cityErr, setCityErr] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    toast.dismiss();
    const school = {
      id: schoolObject.id,
      name: e.target.name.value,
      province: e.target.province.value,
      city: e.target.city.value,
      district: e.target.district.value,
      address: e.target.address.value,
      schooltype: e.target.schooltype.value
    };
    let hasErr = false;
    if (!school.name) {
      setNameErr(true);
      hasErr = true;
    } else {
      setNameErr(false);
    }
    if (!school.city) {
      setCityErr(true);
      hasErr = true;
    } else {
      setCityErr(false);
    }
    if (!hasErr) {
      try {
        setLoading(true);
        let res = await axios.post(
          '/b/o/master/schools/update',
          JSON.stringify(school)
        );
        if (res.data.st) {
          history.push('/master/school/');
        } else {
          toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
        }
      } catch (error) {
        // if (!error.response) {
        //     toast.error(error.toString(), { containerId: 'B', transition: Zoom });
        //     return
        // }
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card>
            <CardBody>
              <Breadcrumb>
                <BreadcrumbItem>
                  <a
                    href="/#"
                    onClick={(e) => {
                      e.preventDefault();
                      history.goBack();
                    }}>
                    Sekolah
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Edit</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Edit Sekolah</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Nama Sekolah</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    invalid={nameErr}
                    maxLength={100}
                    defaultValue={schoolObject.name}
                  />
                  <FormFeedback>Nama sekolah harus diisi</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="province">Provinsi</Label>
                  <Input
                    id="province"
                    type="text"
                    maxLength={100}
                    defaultValue={schoolObject.province}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="city">Kota/Kabupaten</Label>
                  <Input
                    id="city"
                    type="text"
                    maxLength={100}
                    invalid={cityErr}
                    defaultValue={schoolObject.city}
                  />
                  <FormFeedback>Kota/Kabupaten harus diisi</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="district">Kecamatan</Label>
                  <Input
                    id="district"
                    type="text"
                    maxLength={100}
                    defaultValue={schoolObject.district}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="schooltype">Bentuk</Label>
                  <Input
                    type="select"
                    name="schooltype"
                    id="schooltype"
                    defaultValue={schoolObject.schooltype}>
                    <option>SMA</option>
                    <option>SMK</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="address">Alamat</Label>
                  <Input
                    id="address"
                    type="textarea"
                    maxLength={100}
                    defaultValue={schoolObject.address}
                  />
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit"
                  block>
                  Submit
                </LaddaButton>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
