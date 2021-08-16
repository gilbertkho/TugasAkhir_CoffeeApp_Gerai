/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ListGroup,
  ListGroupItem,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu
} from 'reactstrap';
import { NavLink as NavLinkStrap } from 'reactstrap';
import profile from '../../assets/images/avatars/blank-profile.png';
// import localforage from 'config/localForage';
import localforage from 'localforage';
import urlConfig from 'config/backend';
import jwt from 'jsonwebtoken';
import auth from 'config/auth';
import { connect } from 'react-redux';

const HeaderUserbox = (props) => {
  const history = useHistory();
  const [user, setUser] = useState({});
  // const { rProfilePicture } = props;
  const [apikey, setApikey] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { getProfile() }, []);
  // useEffect(() => { setUser({...user, foto_gerai: rProfilePicture}) }, [rProfilePicture]);
  // useEffect(() => { console.log(user) }, [user]);

  const getProfile = async () => {    
    try {
      // const value = await localforage.getItem('user');
      // This code runs once the value has been loaded
      // from the offline store.
      // console.log(value);
      let key = await localforage.getItem('APIKEY');
      setApikey(key);
      let cekUser = auth();
      console.log(cekUser)
      if(cekUser.status){
        setUser(cekUser.data)       
      }
      else{
        console.log(cekUser.msg)
      }
      // setUser(value);
    } catch (err) {
      // This code runs if there were any errors.
      console.log(err);
    }
  }

  const goToProfile = () => {
    history.push("/profile");
  }

  const logOut = async () => {
    try {
      // const value = await localforage.removeItem('user');
      // This code runs once the value has been loaded
      // from the offline store.
      // console.log(value);
      // if(user.tu==="Psikotes")
      // {
      //   window.location.replace("/login/psikotes");  
      // }
      // else {
        document.cookie = "gerai=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        await localforage.removeItem('APIKEY');
        window.location.replace("/login");
      // }
    } catch (err) {
      // This code runs if there were any errors.
      console.log(err);
    }
  }

  return (
    <>
      <UncontrolledDropdown className="position-relative ml-2">
        <DropdownToggle
          color="link"
          className="p-0 text-left d-flex btn-transition-none align-items-center">
          <div className="d-block p-0 avatar-icon-wrapper">
            {/* <Badge color="success" className="badge-circle p-top-a">
              Online
            </Badge> */}
            <div className="avatar-icon rounded">
              <img src={user.foto_gerai != "" ? urlConfig.urlBackend + "app/gerai/gerai_photo/" + apikey : profile} alt="..." />
            </div>
          </div>
          <div className="d-none d-xl-block pl-2">
            <div className="font-weight-bold">{user.email}</div>
            <span className="text-black-50">{user.tu}</span>
          </div>
          <span className="pl-1 pl-xl-3">
            <FontAwesomeIcon
              icon={['fas', 'angle-down']}
              className="opacity-5"
            />
          </span>
        </DropdownToggle>
        <DropdownMenu right className="dropdown-menu-lg overflow-hidden p-0">
          <ListGroup flush className="text-left bg-transparent">
            <ListGroupItem className="rounded-top">
              <Nav pills className="nav-neutral-primary flex-column">
                <NavItem className="nav-header d-flex text-primary pt-1 pb-2 font-weight-bold align-items-center">
                  <div>Profile options</div>
                  {/* <div className="ml-auto font-size-xs">
                    <a
                      href="#/"
                      onClick={(e) => e.preventDefault()}
                      id="ChangeSettingsTooltip">
                      <FontAwesomeIcon icon={['fas', 'plus-circle']} />
                    </a>
                    <UncontrolledTooltip
                      target="ChangeSettingsTooltip"
                      container="body">
                      Change settings
                    </UncontrolledTooltip>
                  </div> */}
                </NavItem>
                <NavItem>
                  <NavLinkStrap href="#/" onClick={(e) => { e.preventDefault(); goToProfile() }}>
                    My Account
                  </NavLinkStrap>
                </NavItem>
                <NavItem>
                  <NavLinkStrap href="#/" onClick={(e) => { e.preventDefault(); logOut() }}>
                    Logout
                  </NavLinkStrap>
                </NavItem>
              </Nav>
            </ListGroupItem>
              {/* <ListGroupItem className="bg-transparent p-0">
                <div className="grid-menu grid-menu-2col">
                  <div className="py-3">
                    <div className="d-flex justify-content-center">
                      <div className="d-flex align-items-center">
                        <div>
                          <FontAwesomeIcon
                            icon={['far', 'chart-bar']}
                            className="font-size-xxl text-info"
                          />
                        </div>
                        <div className="pl-3 line-height-sm">
                          <b className="font-size-lg">$9,693</b>
                          <span className="text-black-50 d-block">revenue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ListGroupItem>
              <ListGroupItem className="rounded-bottom p-3 text-center">
                <Button
                  tag="a"
                  href="#/"
                  onClick={(e) => e.preventDefault()}
                  color="facebook"
                  className="d-40 btn-icon p-0"
                  id="FacebookTooltipHeader"
                  container="body">
                  <span className="btn-wrapper--icon">
                    <FontAwesomeIcon icon={['fab', 'facebook']} />
                  </span>
                </Button>
                <UncontrolledTooltip target="FacebookTooltipHeader">
                  Facebook
                </UncontrolledTooltip>
                <Button
                  tag="a"
                  href="#/"
                  onClick={(e) => e.preventDefault()}
                  color="dribbble"
                  className="mx-2 d-40 btn-icon p-0"
                  id="btnDribbbleTooltipHeader"
                  container="body">
                  <span className="btn-wrapper--icon">
                    <FontAwesomeIcon icon={['fab', 'dribbble']} />
                  </span>
                </Button>
                <UncontrolledTooltip target="btnDribbbleTooltipHeader">
                  Dribbble
                </UncontrolledTooltip>
                <Button
                  tag="a"
                  href="#/"
                  onClick={(e) => e.preventDefault()}
                  color="twitter"
                  className="d-40 btn-icon p-0"
                  id="btnTwitterTooltipHeader"
                  container="body">
                  <span className="btn-wrapper--icon">
                    <FontAwesomeIcon icon={['fab', 'twitter']} />
                  </span>
                </Button>
                <UncontrolledTooltip target="btnTwitterTooltipHeader">
                  Twitter
                </UncontrolledTooltip>
              </ListGroupItem> */}
            </ListGroup>
          </DropdownMenu>
        </UncontrolledDropdown>
      </>
  );
};  

// const mapStateToProps = (state) => ({
//   rProfilePicture: state.General.profilePicture
// });

// export default connect(mapStateToProps)(HeaderUserbox);
export default HeaderUserbox;
