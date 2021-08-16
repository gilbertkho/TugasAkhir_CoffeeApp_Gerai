import React, { useRef, useState, useEffect } from 'react';
import LaddaButton from 'react-ladda';
import { Col, FormGroup, Input, FormFeedback, Row } from 'reactstrap';
import axios from 'config/axios';
import { toast, Zoom } from 'react-toastify';
import localforage from 'config/localForage';
import Setting from 'config/setting';
import { loadReCaptcha, ReCaptcha } from 'react-recaptcha-v3';
import { ValidateEmail } from 'utils/validation';
import Errormsg from 'config/errormsg';

export default function PageLoginPsikotes() {
  const [loading, setLoading] = useState(false);

  const email = useRef();
  const pass = useRef();
  const [emailErr, setEmailErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [t, setT] = useState('');
  const [reloadRecaptchaKey, setReloadRecaptchaKey] = useState(
    new Date().getTime()
  );
  const updateReloadRecaptcha = () => {
    setReloadRecaptchaKey(new Date().getTime());
  };
  const [_isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadReCaptcha(Setting['recaptcha-site-key']);
    const intervalId = setInterval(function () {
      updateReloadRecaptcha();
    }, Setting['recaptcha-interval']);
    return () => clearInterval(intervalId);
  }, []);

  // eslint-disable-next-line
  const reloadRecaptcha = () => {
    if (_isMounted) {
      updateReloadRecaptcha();
    }
  };

  // useEffect(() => { loadReCaptcha(Setting["recaptcha-site-key"])}, [t]);
  useEffect(() => {
    if (t === '') {
      setLoading(true);
    } else setLoading(false);
  }, [t]);

  const login = async (e) => {
    e.preventDefault();
    toast.dismiss();
    let invalid = false;
    setEmailErr('');
    setPassErr('');
    let user = {
      email: email.current.value.trim(),
      pwd: pass.current.value,
      t: t
    };
    if (user.email === '') {
      setEmailErr('Email harus diinput');
      invalid = true;
    } else if (!ValidateEmail(user.email)) {
      setEmailErr('Format email salah');
      invalid = true;
    }
    if (user.pwd === '') {
      setPassErr('Password harus diinput');
      invalid = true;
    }
    if (invalid) {
      return;
    }

    try {
      setLoading(true);
      let res = await axios.post('b/o/master/users/psikotes/login', user);
      if (res.status === 200) {
        try {
          await localforage.setItem('user', res.data.data);
          // This code runs once the value has been loaded
          // from the offline store.
          // console.log(value);
        } catch (err) {
          // This code runs if there were any errors.
          console.log(err);
        }
        window.location.replace('/dashboard');
      }
    } catch (error) {
      if (!error.response) {
        toast.error(Errormsg['500'], { containerId: 'B', transition: Zoom });
        return;
      }
      let msg = error.response.data.msg;
      if (error.response.status === 400) {
        if (msg.startsWith('Email')) {
          setEmailErr(msg);
        } else if (msg.startsWith('Password')) {
          setPassErr(msg);
        } else if (msg.startsWith('Format')) {
          setEmailErr(msg);
        } else toast.error(msg, { containerId: 'B', transition: Zoom });
      } else if (error.response.status === 404) {
        setEmailErr(msg);
      } else if (error.response.status === 401) {
        setPassErr(msg);
      } else {
        toast.error(msg, { containerId: 'B', transition: Zoom });
      }
    } finally {
      // setLoading(false);
      updateReloadRecaptcha();
    }
  };

  const verifyCallback = (recaptchaToken) => {
    setT(recaptchaToken);
  };
  // const toForgotPass = () => history.push('/forgotpassword');

  function handleKeyUp(e) {
    let code = e.keyCode;
    if (code === 13) {
      switch (e.target.id) {
        case 'email':
          pass.current.focus();
          break;
        case 'password': {
          let button = document.querySelector('#loginButton');
          if (button) {
            button.click();
          }
          break;
        }
        default:
          break;
      }
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
                  <ReCaptcha
                    sitekey={Setting['recaptcha-site-key']}
                    action="login"
                    verifyCallback={verifyCallback}
                    key={reloadRecaptchaKey}
                  />
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
                        Psikotes Login
                      </h1>
                    </Row>
                    <div>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Input
                          placeholder="Email"
                          type="email"
                          id="email"
                          innerRef={email}
                          invalid={emailErr !== ''}
                          onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>{emailErr}</FormFeedback>
                      </FormGroup>
                      <FormGroup className="mb-3 pl-4 pr-4">
                        <Input
                          placeholder="Password"
                          type="password"
                          id="password"
                          innerRef={pass}
                          invalid={passErr !== ''}
                          onKeyUp={handleKeyUp}
                        />
                        <FormFeedback>{passErr}</FormFeedback>
                      </FormGroup>
                      <div className="d-flex justify-content-between">
                        {/* <div>
                          <a
                            href="#/"
                            onClick={(e) => { e.preventDefault(); toForgotPass(); }}
                            className="text-first">
                            Recover password
                          </a>
                        </div> */}
                      </div>
                      <div className="text-center py-4">
                        <LaddaButton
                          className="btn btn-primary font-weight-bold w-50 my-2"
                          id="loginButton"
                          loading={loading}
                          onClick={login}>
                          Sign in
                        </LaddaButton>
                      </div>
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
