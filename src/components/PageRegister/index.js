/*eslint-disable*/
import React, { useRef, useState, useEffect } from 'react';
import LaddaButton from 'react-ladda';
import { Col, FormGroup, Input, FormFeedback, Row, Label, Button } from 'reactstrap';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import localforage from 'config/localForage';
import Setting from 'config/setting';
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-v3';
import { ValidateEmail } from 'utils/validation';
import Errormsg from 'config/errormsg';

export default function PageRegister(){
  const [reg, setReg] = useState({
    nama: "",
    alamat: "",
    no_telp: "",
    nama_pemilik: "",
    email: "",
    pass: "",
    c_pass: "",
    foto: null,
    kecamatan: "",
    kelurahan: "",
    no_rek: "",
    bank: ""
  })
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);
  const [emailErr,setEmailErr] = useState('');
  const [passErr,setPassErr] = useState('');
  const [cpassErr,setcPassErr] = useState('');
  const [namaErr,setNamaErr] = useState('');
  const [alamatErr,setAlamatErr] = useState('');
  const [noTelpErr,setNoTelpErr] = useState('');
  const [namaPemilikErr,setNamaPemilikErr] = useState('');
  const [fotoErr,setFotoErr] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [_isMounted, setIsMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const getKecamatan = () => {
    axios.get('/kecamatan').then(({data}) => {
      console.log(data.data)
      setKecamatan(data.data);
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

  const getKelurahan = (kec) => {
    console.log(kec)
    axios.post('/kelurahan', { kecamatan: kec })
    .then(({data}) => {
      setKelurahan(data.data)
    }).catch(error => {      
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }        
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});        
      }
    })
  }

  useEffect(() => {
    setIsMounted(true);
    getKecamatan();
  }, []);

  useEffect(() => {
    if(reg.kecamatan){
      console.log("KECAMATAN", reg.kecamatan)
      let kec = reg.kecamatan.split("|")
      getKelurahan(kec[0]);
    }
  },[reg.kecamatan])
  
  useEffect(() => {
    console.log(reg)
  }, [reg]);

  const changeReg = (field, value) => { setReg({ ...reg, [field]: value }); };

  let $imagePreview = null;
  if (imagePreviewUrl) {
    $imagePreview = (<img src={imagePreviewUrl} style={{ width: '100%' }} />);
  }

  function _handleImageChange(e) {
    if(e.target.files){
      e.preventDefault();
  
      let reader = new FileReader();
      let file = e.target.files[0];
  
      reader.onloadend = () => {
        setReg({ ...reg, foto: file });
        setImagePreviewUrl(reader.result);
      }
  
      reader.readAsDataURL(file)
    }
  }

  const sendVerification = () => {
    axios.post('/app/gerai/verify/request',{
      email: this.state.email
    }).then(({data}) => {
      if(data.status){
        toast.success(data.msg, {containerId:'B', transition:Zoom});
      }
      else{
        toast.error(data.msg, {containerId:'B', transition:Zoom});
      }
    }).catch((error) => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  const register = () => {
    if(!reg.nama || !reg.nama_pemilik || !reg.alamat || !reg.no_telp || !reg.email || !reg.pass || !reg.c_pass || !reg.foto || !reg.kecamatan || !reg.kelurahan || !reg.no_rek || !reg.bank){
      setSubmitted(true);
      toast.error("Harap lengkapi semua pengisian", {containerId : "B", transition : Zoom})      
    }
    else if(!ValidateEmail(reg.email)){
      setSubmitted(true);
      toast.error("Format email salah", {containerId : "B", transition : Zoom})
    }
    else if(reg.c_pass !== reg.pass){
      setSubmitted(true);      
      toast.error("Harap memeriksa kembali password dan konfirmasi password anda", {containerId:"B", transition:Zoom})
    }
    else{
      let formData = new FormData();
      for(let key in reg){
        formData.append(key, reg[key])
      }
      axios.post("/app/gerai/register", formData).then(({data}) => {
        if(data.status){
          setSubmitted(false)
          toast.success(data.msg, {containerId:"B", transition:Zoom});
          sendVerification();
        }
        else{
          setSubmitted(false)
          toast.error(data.msg, {containerId:"B", transition:Zoom})
        }
      }).catch(error => {
        setSubmitted(false);
        let msg = error.response.data.msg;
        console.log(error.response.data)
        console.log(error.response.status)
        if (error.response.status !== 500) {
          toast.error(msg, {containerId: "B", transition: Zoom });
        } else {
          toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        }
      })
    }
  }
  return (
    <>
      <div className="app-wrapper bg-white min-vh-100">
        <div className="app-main min-vh-100">
          <div className="app-content p-0">
            <div className="app-content--inner d-flex align-items-center">
              <div className="flex-grow-1 w-100 d-flex align-items-center">
                <div className="bg-composed-wrapper--content py-5">
                  {/* <ReCaptcha
                    sitekey={Setting['recaptcha-site-key']}
                    action="login"
                    verifyCallback={verifyCallback}
                    key={reloadRecaptchaKey}
                  /> */}
                  <Col sm="8" md="6" lg="4" xl="4" className="mx-auto">
                    <Row
                      className="justify-content-center mb-4 pr-5 pl-5"
                      style={{ alignItems: 'start' }}>
                      <img
                        src={require('assets/images/logo/codeplay-logo.png')}
                        alt="Logo Coffeeapp"
                        style={{ maxWidth: '100%' }}
                      />
                    </Row>
                    <Row className="justify-content-center m-2">
                      <h1 className="display-4 font-weight-bold">
                        Register Gerai
                      </h1>
                    </Row>
                    <div>
                      <FormGroup className="mb-3 pl-4 pr-4">
                      <Label htmlFor="namaGerai">Nama Gerai</Label>
                        <Input
                          placeholder="Nama Gerai"
                          type="text"
                          id="namaGerai"
                          innerRef={reg.nama}
                          invalid={reg.nama === '' && submitted}
                          onChange = {(e)=>{changeReg("nama",e.target.value)}}
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Nama tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label htmlFor="namaPemilik">Nama Pemilik</Label>
                        <Input
                          placeholder="Nama Pemilik"
                          type="text"
                          id="namaPemilik"
                          innerRef={reg.nama_pemilik}
                          invalid={reg.nama_pemilik === '' && submitted}
                          onChange = {(e)=>{changeReg("nama_pemilik",e.target.value)}}
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Nama pemilik tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label for = "kecamatan">Kecamatan</Label>
                        <Input id = "kecamatan" type="select" value={reg.kecamatan} onChange={(e) => changeReg("kecamatan", e.target.value)} invalid = {reg.kecamatan === '' && submitted} >
                          <option value = ""> Pilih Kecamatan</option>
                          {
                            kecamatan.length > 0 ?
                              kecamatan.map((kec, key) => {
                                return (
                                  <option key={key} value={kec.id + "|" + kec.name} >{kec.name}</option>
                                )
                              })
                            : null
                          }
                        </Input>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label for = "kelurahan">Kelurahan</Label>
                        <Input id = "kelurahan" type="select" value={reg.kelurahan} onChange={(e) => changeReg("kelurahan", e.target.value)} invalid = {reg.kelurahan === '' && submitted} >
                          <option value = ""> Pilih Kelurahan</option>
                        {
                            kelurahan.length > 0 ?
                              kelurahan.map((kel, key) => {
                                return (
                                  <option key={key} value={kel.id + "|" + kel.name} >{kel.name}</option>
                                )
                              })
                            : null
                          }
                        </Input>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label htmlFor="alamat">Alamat</Label>
                        <Input
                          placeholder="ex: jln.ngagel jaya..."
                          type="textarea"
                          id="alamat"
                          innerRef={reg.alamat}
                          invalid={reg.alamat === '' && submitted}
                          onChange = {(e)=>{changeReg("alamat",e.target.value)}}
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Alamat tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label htmlFor="noTelp">Nomor Telepon Gerai</Label>
                        <Input
                          placeholder="ex: 08123xxx"
                          type="text"
                          id="noTelp"
                          innerRef={reg.no_telp}
                          onChange = {(e)=>{changeReg("no_telp",e.target.value)}}
                          invalid={reg.no_telp === '' && submitted}
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Nomor telepon tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label for="bank">Bank</Label>
                        <Input id="bank" type='select' required value={reg.bank} required onChange={(e) => changeReg("bank", e.target.value)} invalid = {reg.bank === '' && submitted}>
                          <option value=''> Pilih Bank</option>
                          <option value='BCA'> BCA</option>
                          <option value='Mandiri'> Mandiri</option>
                          <option value='Permata'> Permata</option>
                        </Input>
                        <FormFeedback>Bank tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label for="no_rek">Nomor Rekening</Label>
                        <Input placeholder='Nomor Rekening' id="no_rek" value={reg.no_rek} required onChange={(e) => changeReg("no_rek", e.target.value)} invalid = {reg.no_rek === '' && submitted} />
                        <FormFeedback>Nomor rekening tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                      <Label htmlFor="email">Email Gerai</Label>
                        <Input
                          placeholder="ex: email@coffeeapp.com"
                          type="email"
                          id="email"
                          innerRef={reg.email}
                          invalid={reg.email === '' && submitted}
                          onChange = {(e)=>{changeReg("email",e.target.value)}}
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Email tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                      <Label htmlFor="password">Password</Label>
                        <Input
                          placeholder="Password"
                          type="password"
                          id="password"
                          innerRef={reg.pass}
                          invalid={reg.pass === '' && submitted}
                          onChange = {(e)=>{changeReg("pass",e.target.value)}}                          
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Password tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                      <Label htmlFor="cpassword">Konfirmasi Password</Label>
                        <Input
                          placeholder="Konfirmasi Password"
                          type="password"
                          id="cpassword"
                          innerRef={reg.c_pass}
                          invalid={reg.c_pass === '' && submitted}
                          onChange = {(e)=>{changeReg("c_pass",e.target.value)}}                          
                          // onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>Konfirmasi password tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Label htmlFor="photo">Foto Gerai</Label>
                        <Input type="file" name="file" id="photo" accept="image/*" style={{ display: "none" }} onChange={(e) => _handleImageChange(e)} 
                        invalid={!reg.foto && submitted}/>
                        <br />
                        <Button className="btn-pill font-weight-bold px-4 text-uppercase font-size-sm" outline color="primary" onClick={() => { document.getElementById("photo").click() }}>
                          Pilih Gambar
                        </Button>
                        <FormFeedback>Foto gerai tidak boleh kosong</FormFeedback>
                      </FormGroup>
                      <div className="mb-3 pl-4 pr-4">
                        {(reg.foto != null) &&
                          reg.foto.name
                        }
                      </div>
                      <div className="mb-3 pl-4 pr-4">
                        {$imagePreview}
                      </div>
                      <div className="text-center py-4">
                        <LaddaButton
                          className="btn btn-primary font-weight-bold w-50 my-2"
                          id="loginButton"
                          // loading={loading}
                          onClick={register}>
                          Register
                        </LaddaButton>
                      </div>
                      <p className = "text-center">
                        Sudah memiliki akun?<a href="./login"> Masuk disini.</a>
                      </p>
                      {/* <div className="text-center text-black-50 mt-3">
                        Don't have an account?{' '}
                        <a
                          href="#/"
                          onClick={(e) => e.preventDefault()}
                          className="text-first">
                          Sign up
                        </a>
                      </div> */}
                    </div>
                  </Col>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );  
}
