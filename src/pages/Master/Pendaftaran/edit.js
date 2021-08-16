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
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  FormFeedback,
  FormText,
  Breadcrumb,
  BreadcrumbItem
} from 'reactstrap';
import axios from 'config/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactDatePicker from 'react-datepicker';
import { format } from 'date-fns';
import { getPPUrl } from './index';
import { toast, Zoom } from 'react-toastify';
import LaddaButton from 'react-ladda/dist/LaddaButton';
import Errormsg from 'config/errormsg';

async function post(data) {
  return axios({
    url: '/b/o/master/register/update',
    method: 'POST',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export default function PendaftaranEdit(props) {
  const history = useHistory();
  if (!props.location.state) {
    history.goBack();
  }
  const [loading, setLoading] = useState(false);
  const register = props.location.state.register;
  const [birthdate, setBirthDate] = useState(
    register.birthdate ? new Date(register.birthdate) : null
  );
  const [baptism, setBapDate] = useState(
    register.baptismdate ? new Date(register.birthdate) : null
  );
  const [baptismStatus, setBapStatus] = useState(register.baptismdate || false);
  const [graduateErr, setGraduateErr] = useState('');

  const [nameErr, setNameErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [placeErr, setPlaceErr] = useState(false);
  const [mobileErr, setMobileErr] = useState(false);
  const [addrErr, setAddrErr] = useState(false);
  const [schoolErr, setSchoolErr] = useState(false);
  const [provinceErr, setProvinceErr] = useState(false);
  const [cityErr, setCityErr] = useState(false);
  const [smkErr, setSMKErr] = useState(false);
  const [churchErr, setChurchErr] = useState(false);
  const [birthdateErr, setBirhdateErr] = useState(false);
  const [baptismErr, setBaptismErr] = useState(false);

  async function handleSubmit(e) {
    toast.dismiss();
    e.preventDefault();

    //Validation
    let hasErr = false;

    if (!e.target.fullname.value) {
      hasErr = true;
      setNameErr(true);
    } else setNameErr(false);
    if (!e.target.email.value) {
      hasErr = true;
      setEmailErr(true);
    } else setEmailErr(false);
    if (!e.target.birthplace.value) {
      hasErr = true;
      setPlaceErr(true);
    } else setPlaceErr(false);
    if (!e.target.mobile.value) {
      hasErr = true;
      setMobileErr(true);
    } else setMobileErr(false);
    if (!e.target.address.value) {
      hasErr = true;
      setAddrErr(true);
    } else setAddrErr(false);
    if (!e.target.schoolname.value) {
      hasErr = true;
      setSchoolErr(true);
    } else setSchoolErr(false);
    if (!e.target.graduateyear.value) {
      hasErr = true;
      setGraduateErr('Tahun lulus tidak boleh kosong');
    } else setGraduateErr('');
    if (!e.target.province.value) {
      hasErr = true;
      setProvinceErr(true);
    } else setProvinceErr(false);
    if (!e.target.city.value) {
      hasErr = true;
      setCityErr(true);
    } else setCityErr(false);
    if (e.target.major.value === 'SMK' && !e.target.majordetail.value) {
      hasErr = true;
      setSMKErr(true);
    } else setSMKErr(false);

    if (
      e.target.religion.value === 'Kristen' ||
      e.target.religion.value === 'Katolik'
    ) {
      if (!e.target.churchname.value) {
        hasErr = true;
        setChurchErr(true);
      } else setChurchErr(false);
      if (baptism === null && baptismStatus) {
        hasErr = true;
        setBaptismErr(true);
      } else setBaptismErr(false);
    } else {
      setChurchErr(false);
      setBaptismErr(false);
    }
    if (birthdate === null) {
      hasErr = true;
      setBirhdateErr(true);
    } else setBirhdateErr(false);

    if (hasErr) {
      toast.error('Cek kembali pengisian data', {
        containerId: 'B',
        transition: Zoom
      });
      return;
    }

    //Submission
    const formData = new FormData();
    formData.append('id', register.id);
    // formData.append('code', e.target.code.value);
    formData.append('email', e.target.email.value);
    formData.append('fullname', e.target.fullname.value);
    formData.append('gender', e.target.gender.value);
    formData.append('birthplace', e.target.birthplace.value);
    formData.append('mobile', e.target.mobile.value);
    formData.append('address', e.target.address.value);
    formData.append('schoolname', e.target.schoolname.value);
    formData.append('major', e.target.major.value);
    formData.append('majordetail', e.target.majordetail.value);
    formData.append('province', e.target.province.value);
    formData.append('city', e.target.city.value);
    formData.append('graduateyear', e.target.graduateyear.value);
    formData.append('religion', e.target.religion.value);
    formData.append('churchname', e.target.churchname.value);
    formData.append('socialaccount', e.target.socialaccount.value);
    formData.append('allowcontact', e.target.allowcontact.value);
    formData.append('pwd', e.target.pwd.value);
    // formData.append('regstatus', e.target.regstatus.value);
    // formData.append('regrepeat', e.target.regrepeat.value);
    // formData.append('regrepeatcount', e.target.regrepeatcount.value);

    formData.append('birthdate', format(birthdate, 'yyyy-MM-dd'));
    formData.append(
      'baptismdate',
      baptism && baptismStatus ? format(baptism, 'yyyy-MM-dd') : ''
    );
    const pp = e.target.pp.files[0];
    if (pp !== null && pp !== undefined) {
      formData.append('profilepicture', pp);
    }

    try {
      setLoading(true);
      let res = await post(formData);
      if (res.data.st) {
        history.push('/master/pendaftaran/');
      } else {
        if (res.data.msg.includes('graduateyear')) {
          setGraduateErr('Pastikan tahun lulus adalah angka');
          toast.error('Cek kembali pengisian data', {
            containerId: 'B',
            transition: Zoom
          });
        } else
          toast.error(res.data.msg, { containerId: 'B', transition: Zoom });
      }
    } catch (error) {
      // if (!error.response) {
      toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
      // return
      // }
      // let msg = error.response.data.msg;
      // if (error.response.status === 500) {
      //     if (msg.includes('graduateyear')) {
      //         setGraduateErr('Pastikan tahun lulus adalah angka');
      //         toast.error('Cek kembali pengisian data', { containerId: 'B', transition: Zoom });
      //     } else toast.error(msg, { containerId: 'B', transition: Zoom });
      // } else toast.error(msg, { containerId: 'B', transition: Zoom });
    } finally {
      setLoading(false);
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
                    Pendaftaran
                  </a>
                </BreadcrumbItem>
                <BreadcrumbItem active>Edit</BreadcrumbItem>
              </Breadcrumb>
              <CardTitle>Edit Pendaftaran</CardTitle>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Nama Lengkap</Label>
                  <Input
                    type="text"
                    name="fullname"
                    id="fullname"
                    invalid={nameErr}
                    defaultValue={register.fullname}
                    maxLength={100}
                  />
                  <FormFeedback>Nama Lengkap tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    invalid={emailErr}
                    defaultValue={register.email}
                    maxLength={100}
                  />
                  <FormFeedback>Email tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="code">Code: {register.code}</Label>
                  <Input
                    type="text"
                    name="code"
                    id="code"
                    defaultValue={register.code}
                    maxLength={100}
                    disabled
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="gender">Jenis Kelamin</Label>
                  <Input
                    type="select"
                    name="gender"
                    id="gender"
                    defaultValue={register.gender}>
                    <option>Male</option>
                    <option>Female</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="birthplace">Tempat Lahir</Label>
                  <Input
                    type="text"
                    name="birthplace"
                    id="birthplace"
                    invalid={placeErr}
                    defaultValue={register.birthplace}
                    maxLength={100}
                  />
                  <FormFeedback>Tempat Lahir tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label>Tanggal Lahir</Label>
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                      </InputGroupText>
                    </InputGroupAddon>
                    <ReactDatePicker
                      className="form-control"
                      dateFormat="dd-MM-yyyy"
                      placeholderText="dd-MM-yyyy"
                      selected={birthdate}
                      onChange={(date) => {
                        setBirthDate(date);
                      }}
                    />
                  </InputGroup>
                  {birthdateErr && (
                    <FormText color="danger">
                      Tanggal Lahir tidak boleh kosong
                    </FormText>
                  )}
                </FormGroup>
                <FormGroup>
                  <Label for="mobile">Nomor Handphone</Label>
                  <Input
                    type="text"
                    name="mobile"
                    id="mobile"
                    invalid={mobileErr}
                    defaultValue={register.mobile}
                    maxLength={20}
                  />
                  <FormFeedback>
                    Nomor Handphone tidak boleh kosong
                  </FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="address">Alamat</Label>
                  <Input
                    type="textarea"
                    name="addres"
                    id="address"
                    invalid={addrErr}
                    defaultValue={register.address}
                    maxLength={100}
                  />
                  <FormFeedback>Alamat tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="schoolname">Nama Sekolah</Label>
                  <Input
                    type="text"
                    name="schoolname"
                    id="schoolname"
                    invalid={schoolErr}
                    defaultValue={register.schoolname}
                    maxLength={100}
                  />
                  <FormFeedback>Nama Sekolah tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="major">Jurusan</Label>
                  <Input
                    type="select"
                    name="major"
                    id="major"
                    defaultValue={register.major}>
                    <option>IPA</option>
                    <option>IPS</option>
                    <option>Bahasa</option>
                    <option>SMK</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="majordetail">Detail Jurusan</Label>
                  <Input
                    type="text"
                    name="majordetail"
                    id="majordetail"
                    invalid={smkErr}
                    defaultValue={register.majordetail}
                    maxLength={50}
                  />
                  <FormText color="info">Wajib untuk SMK</FormText>
                  <FormFeedback>Jurusan tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="graduateyear">Tahun Lulus</Label>
                  <Input
                    type="text"
                    name="graduateyear"
                    id="graduateyear"
                    defaultValue={register.graduateyear}
                    invalid={graduateErr !== ''}
                  />
                  <FormFeedback>{graduateErr}</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="province">Provinsi</Label>
                  <Input
                    type="text"
                    name="province"
                    id="province"
                    invalid={provinceErr}
                    defaultValue={register.province}
                    maxLength={100}
                  />
                  <FormFeedback>Provinsi tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="city">Kota/Kabupaten</Label>
                  <Input
                    type="text"
                    name="city"
                    id="city"
                    invalid={cityErr}
                    defaultValue={register.city}
                    maxLength={100}
                  />
                  <FormFeedback>Kota/Kabupaten tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="religion">Agama</Label>
                  <Input
                    type="select"
                    name="religion"
                    id="religion"
                    defaultValue={register.religion}>
                    <option>Kristen</option>
                    <option>Katolik</option>
                    <option>Hindu</option>
                    <option>Buddha</option>
                    <option>Islam</option>
                    <option>Konghucu</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label>Sudah Baptis</Label>
                  <InputGroup>
                    <Label style={{ marginLeft: '2rem' }}>
                      <Input
                        type="radio"
                        name="baptismStatus"
                        checked={baptismStatus}
                        onChange={() => setBapStatus(true)}
                      />
                      Sudah
                    </Label>
                  </InputGroup>
                  <InputGroup>
                    <Label style={{ marginLeft: '2rem' }}>
                      <Input
                        type="radio"
                        name="baptismStatus"
                        checked={!baptismStatus}
                        onChange={() => setBapStatus(false)}
                      />
                      Belum
                    </Label>
                  </InputGroup>
                </FormGroup>
                {baptismStatus && (
                  <FormGroup>
                    <Label>Tanggal Baptis</Label>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                        </InputGroupText>
                      </InputGroupAddon>
                      <ReactDatePicker
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="YYYY-MM-DD"
                        selected={baptism}
                        onChange={(date) => {
                          setBapDate(date);
                        }}
                      />
                    </InputGroup>
                    {baptismErr && (
                      <FormText color="danger">
                        Tanggal Baptis tidak boleh kosong
                      </FormText>
                    )}
                  </FormGroup>
                )}
                <FormGroup>
                  <Label for="churchname">Nama Gereja</Label>
                  <Input
                    type="text"
                    name="churchname"
                    id="churchname"
                    invalid={churchErr}
                    defaultValue={register.churchname}
                    maxLength={100}
                  />
                  <FormText color="info">Wajib untuk Nasrani</FormText>
                  <FormFeedback>Nama Gereja tidak boleh kosong</FormFeedback>
                </FormGroup>
                <FormGroup>
                  <Label for="socialaccount">Akun Social Media</Label>
                  <Input
                    type="text"
                    name="socialaccount"
                    id="socialaccount"
                    defaultValue={register.socialaccount}
                  />
                </FormGroup>
                <FormGroup>
                  <Col>
                    <Row>
                      <Label for="pp">Profile Picture</Label>
                    </Row>
                    <Row className="justify-content-center">
                      {register.profilepicture ? (
                        <img
                          alt={'Profile Picture: ' + register.profilepicture}
                          className="img-fluid rounded"
                          style={{ width: '200px', height: '200px' }}
                          src={getPPUrl(register.profilepicture)}
                        />
                      ) : (
                        <p>None</p>
                      )}
                    </Row>
                    <Row>
                      <Input type="file" name="pp" id="pp" />
                    </Row>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Label for="allowcontact">Allow Contact</Label>
                  <Input
                    type="select"
                    name="allowcontact"
                    id="allowcontact"
                    defaultValue={register.allowcontact}>
                    <option>Yes</option>
                    <option>No</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="pwd">Password</Label>
                  <Input
                    type="password"
                    name="pwd"
                    id="pwd"
                    defaultValue={register.pwd}
                    maxLength={50}
                    minLength={8}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="regstatus">Status</Label>
                  <Input
                    type="select"
                    name="regstatus"
                    id="regstatus"
                    defaultValue={register.regstatus}
                    disabled>
                    <option>Pending</option>
                    <option>Verified</option>
                    <option>Expired</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="regrepeat">Repeat</Label>
                  <Input
                    type="select"
                    name="regrepeat"
                    id="regrepeat"
                    defaultValue={register.regrepeat}
                    disabled>
                    <option>Yes</option>
                    <option>No</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="regrepeatcount">Repeat Count</Label>
                  <Input
                    type="number"
                    name="regrepeatcount"
                    id="regrepeatcount"
                    defaultValue={register.regrepeatcount}
                    disabled
                  />
                </FormGroup>
                <LaddaButton
                  className="btn btn-primary"
                  loading={loading}
                  type="submit">
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
