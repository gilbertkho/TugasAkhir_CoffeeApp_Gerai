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

export default function EditPendaftar(props) {
  // console.log("props", props);
  const history = useHistory();
  const [user, setUser] = useState({ id: "", fullname: "", pwd: "", email: "", gender: "Male", mobile: "", birthplace: "", birthdate: null, address: "", city: "", province: "", profilepicture: null });
  const [showPassword, setShowPassword] = useState(false);
  const [actionType, setActionType] = useState("add");
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [submitDisable, setSubmitDisable] = useState(false);
  const [submited, setSubmited] = useState(false);
  const [baptismStatus, setBapStatus] = useState(false);

  const changeUser = (field, value) => { setUser({ ...user, [field]: value }); };
  const resetUser = () => { setUser({ id: "", fullname: "", pwd: "", email: "", gender: "Male", mobile: "", birthplace: "", birthdate: null, address: "", city: "", province: "", profilepicture: null }); setImagePreviewUrl(''); };
  const changeShowPasswordState = () => { setShowPassword(!showPassword) };
  const changeSubmitDisableState = (value) => { setSubmitDisable(value) };

  const setBirthDate = (value) => { setUser({ ...user, birthdate: value }); };
  const setBaptismDate = (value) => { setUser({ ...user, baptismdate: value }); };

  let $imagePreview = null;
  if (imagePreviewUrl) {
    $imagePreview = (<img src={imagePreviewUrl} style={{ width: '100%' }} />);
  } else {
    $imagePreview = (<div className="previewText">Silahkan pilih gambar</div>);
  }

  function _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      setUser({ ...user, profilepicture: file });
      setImagePreviewUrl(reader.result);
    }

    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (props.location.state && props.location.state.user) {
      let propsUser = props.location.state.user;
      setUser({
        ...user,
        id: propsUser.id,
        fullname: propsUser.fullname,
        email: propsUser.email,
        gender: propsUser.gender,
        birthplace: propsUser.birthplace,
        birthdate: propsUser.birthdate != '' ? new Date(propsUser.birthdate) : null,
        mobile: propsUser.mobile,
        address: propsUser.address,
        city: propsUser.city,
        province: propsUser.province,
        schoolname: propsUser.schoolname,
        major: propsUser.major,
        majordetail: propsUser.majordetail,
        graduateyear: propsUser.graduateyear,
        religion: propsUser.religion,
        baptismdate: propsUser.baptismdate != '' ? new Date(propsUser.baptismdate) : null,
        churchname: propsUser.churchname,
      });
      setActionType("edit");
      if (propsUser.profilepicture != '') {
        setImagePreviewUrl(urlConfig.urlBackendProfile + propsUser.profilepicture)
      }
      setBapStatus(propsUser.baptismdate !== '');
    }
  }, []);
  // useEffect(() => { console.log(user) }, [user]);

  const _onSubmit = () => {
    toast.dismiss();
    if (user.fullname == '' || user.email == '' || user.mobile == '' || user.birthplace == '' || user.birthdate == null ||
      user.address == '' || user.city == '' || user.province == '' || user.schoolname == '' || ((user.major == 'SMK' || user.major == 'Bahasa') && user.majordetail == '') ||
      user.graduateyear == '' || (user.religion == 'Kristen' && baptismStatus && user.baptismdate == null) || (user.religion == 'Kristen' && user.churchname == '')) {
      setSubmited(true);
      toast.error('Harap lengkapi data', { containerId: 'B', transition: Zoom });
    } else {
      let formData = new FormData;
      Object.entries(user).map(([key, value]) => {
        if (value != undefined) {
          switch (key) {
            case 'birthdate':
              if (value != null) {
                formData.append(key, moment(value).format('YYYY-MM-DD'));
              } else {
                formData.append(key, '');
              }
              break;
            case 'baptismdate':
              if (value != null && baptismStatus) {
                formData.append(key, moment(value).format('YYYY-MM-DD'));
              } else {
                formData.append(key, '');
              }
              break;
            default:
              formData.append(key, value)
              break;
          }
        } else {
          formData.append(key, '')
        }
      });
      changeSubmitDisableState(true);
      axios.post('/b/o/master/registered/update', formData).then(({ data }) => {
        if (data.sc == 200) {
          if (data.st) {
            toast.success('Pendaftar berhasil diubah', { containerId: 'B', transition: Zoom });
            if (actionType == 'add') {
              //reset form
              resetUser();
            } else {
              //return to list after timeout
              setTimeout(
                history.push('/master/pendaftar')
                , 5000);
            }
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
    }
  };

  const useEffectIf = (condition, fn) => {
    useEffect(() => condition && fn(), [condition])
  }

  const onChangeMajor = (value) => {
    if (value != 'SMK') {
      setUser({ ...user, major: value, majordetail: '' });
    } else {
      setUser({ ...user, major: value });
    }
  };


  return (
    <>
      <Row>
        <Col sm="12" md={{ size: 6, offset: 3 }}>
          <Card body>
            <Breadcrumb>
              <BreadcrumbItem><a href="/#" onClick={(e) => { e.preventDefault(); history.goBack() }}>Pendaftar</a></BreadcrumbItem>
              <BreadcrumbItem active>Edit</BreadcrumbItem>
            </Breadcrumb>
            <CardTitle>{"Edit Pendaftar"}</CardTitle>
            <Form>
              <FormGroup>
                <Label for="fullname">Nama Lengkap</Label>
                <Input id="fullname" value={user.fullname} required onChange={(e) => changeUser("fullname", e.target.value)} invalid={user.fullname == '' && submited} />
                <FormFeedback>Nama lengkap tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input id="email" value={user.email} required onChange={(e) => changeUser("email", e.target.value)} invalid={user.email == '' && submited} />
                <FormFeedback>Email tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="pwd">Password</Label>
                <InputGroup>
                  <Input required id="pwd" placeholder="Password" type={showPassword ? "text" : "password"}
                    value={user.pwd}
                    onChange={(e) => changeUser("pwd", e.target.value)} />
                  <InputGroupAddon addonType="prepend">
                    <Button onClick={changeShowPasswordState}>
                      <FontAwesomeIcon icon={['fas', 'eye']} />
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label for="gender">Jenis Kelamin</Label>
                <div>
                  <CustomInput type="radio" id="genderMale" name="gender" label="Laki-laki" value="Male" checked={user.gender == 'Male'} onChange={(e) => { changeUser("gender", e.target.value); }} />
                  <CustomInput type="radio" id="genderFemale" name="gender" label="Perempuan" value="Female" checked={user.gender == 'Female'} onChange={(e) => { changeUser("gender", e.target.value); }} />
                </div>
                <FormFeedback>Jenis kelamin harus dipilih</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="mobile">Tempat Lahir</Label>
                <Input id="birthplace" value={user.birthplace} onChange={(e) => changeUser("birthplace", e.target.value)} invalid={user.birthplace == '' && submited} />
                <FormFeedback>Tempat lahir tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="mobile">Tanggal Lahir</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                    </InputGroupText>
                  </InputGroupAddon>
                  <DatePicker
                    className="form-control"
                    selected={user.birthdate}
                    onChange={date => setBirthDate(date)}
                    maxDate={new Date()} />
                  {(user.birthdate == null && submited) &&
                    <FormText color="danger">
                      Tanggal lahir tidak boleh kosong
                    </FormText>
                  }
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label for="mobile">No. HP</Label>
                <Input id="mobile" required value={user.mobile} onChange={(e) => changeUser("mobile", e.target.value)} invalid={user.mobile == '' && submited} />
                <FormFeedback>No HP tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="address">Alamat</Label>
                <Input id="address" type="textarea" value={user.address} onChange={(e) => changeUser("address", e.target.value)} invalid={user.address == '' && submited} />
                <FormFeedback>Alamat tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="city">Kota</Label>
                <Input id="city" value={user.city} onChange={(e) => changeUser("city", e.target.value)} invalid={user.city == '' && submited} />
                <FormFeedback>Kota tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="province">Provinsi</Label>
                <Input id="province" value={user.province} onChange={(e) => changeUser("province", e.target.value)} invalid={user.province == '' && submited} />
                <FormFeedback>Provinsi tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="schoolname">Sekolah</Label>
                <Input id="schoolname" value={user.schoolname} onChange={(e) => changeUser("schoolname", e.target.value)} invalid={user.schoolname == '' && submited} />
                <FormFeedback>Sekolah tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="major">Jurusan</Label>
                <Select
                  // disabled={disabled}
                  placeholder="Pilih Jurusan"
                  className="register-box"
                  style={{ width: '100%' }}
                  value={user.major}
                  onChange={(value, option) => { onChangeMajor(value) }}
                >
                  <Option value="IPA">IPA</Option>
                  <Option value="IPS">IPS</Option>
                  <Option value="Bahasa">Bahasa</Option>
                  <Option value="SMK">SMK</Option>
                </Select>
              </FormGroup>
              {(user.major === 'SMK' || user.major === 'Bahasa') &&
                <FormGroup>
                  <Label for="majordetail">Jurusan {user.major}</Label>
                  <Input id="majordetail" value={user.majordetail} onChange={(e) => changeUser("majordetail", e.target.value)} invalid={user.majordetail == '' && submited} />
                  <FormFeedback>Jurusan {user.major} tidak boleh kosong</FormFeedback>
                </FormGroup>
              }
              <FormGroup>
                <Label for="graduateyear">Tahun Lulus</Label>
                <Input id="graduateyear" value={user.graduateyear} onChange={(e) => changeUser("graduateyear", e.target.value)} invalid={user.graduateyear == '' && submited} />
                <FormFeedback>Tahun lulus tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label for="religion">Agama</Label>
                <Select
                  // disabled={disabled}
                  placeholder="Pilih Agama"
                  className="register-box"
                  style={{ width: '100%' }}
                  value={user.religion}
                  onChange={(value, option) => { changeUser("religion", value) }}
                >
                  <Option value="Kristen">Kristen</Option>
                  <Option value="Katolik">Katolik</Option>
                  <Option value="Hindu">Hindu</Option>
                  <Option value="Buddha">Buddha</Option>
                  <Option value="Islam">Islam</Option>
                  <Option value="Konghucu">Konghucu</Option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Sudah Baptis</Label>
                <InputGroup>
                  <Label style={{ marginLeft: "2rem" }}>
                    <Input type="radio" name="baptismStatus" checked={baptismStatus} onChange={() => setBapStatus(true)} />
                    Sudah
                    </Label>
                </InputGroup>
                <InputGroup>
                  <Label style={{ marginLeft: "2rem" }}>
                    <Input type="radio" name="baptismStatus" checked={!baptismStatus} onChange={() => setBapStatus(false)} />
                    Belum
                    </Label>
                </InputGroup>
              </FormGroup>
              {baptismStatus && <FormGroup>
                <Label for="mobile">Tanggal Baptis</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <FontAwesomeIcon icon={['far', 'calendar-alt']} />
                    </InputGroupText>
                  </InputGroupAddon>
                  <DatePicker
                    className="form-control"
                    selected={user.baptismdate}
                    onChange={date => setBaptismDate(date)}
                    maxDate={new Date()} />
                  {(baptismStatus && user.baptismdate == null && user.religion == 'Kristen' && submited) &&
                    <FormText color="danger">
                      Tanggal baptis tidak boleh kosong
                      </FormText>
                  }
                </InputGroup>
              </FormGroup>
              }

              <FormGroup>
                <Label for="churchname">Nama Gereja</Label>
                <Input id="churchname" value={user.churchname} onChange={(e) => changeUser("churchname", e.target.value)} invalid={user.churchname == '' && user.religion == 'Kristen' && submited} />
                <FormFeedback>Nama gereja tidak boleh kosong</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="photo">Foto Diri</Label>
                <Input type="file" name="file" id="photo" accept="image/*" style={{ display: "none" }} onChange={(e) => _handleImageChange(e)} />
                <br />
                <Button className="btn-pill font-weight-bold px-4 text-uppercase font-size-sm" outline color="primary" onClick={() => { document.getElementById("photo").click() }}>
                  Pilih Gambar
                </Button>
              </FormGroup>
              <div>
                {(user.profilepicture != null) &&
                  user.profilepicture.name
                }
              </div>
              <div style={{ marginBottom: 20 }}>
                {$imagePreview}
              </div>
              <LaddaButton className="btn btn-primary" loading={submitDisable} onClick={_onSubmit}>
                Submit
              </LaddaButton>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
}
