/* eslint-disable */
import React, { useState, useEffect } from 'react';

import clsx from 'clsx';

import { Collapse, Alert, Button} from 'reactstrap';

import PerfectScrollbar from 'react-perfect-scrollbar';
import { connect } from 'react-redux';

import { NavLink } from 'react-router-dom';
import { setSidebarToggleMobile } from '../../redux/reducers/ThemeOptions';
import jwt from  'jsonwebtoken'
import auth from 'config/auth';
import localforage from 'config/localForage';
import checkStatus from 'config/checkStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ChevronRight,
  Shield,
  Database,
  Clipboard,
  PieChart,
  Settings,
  Layout,
  List,
  CheckSquare,
  Briefcase,
  MessageSquare,
  Clock,
  Home,
  Circle
} from 'react-feather';
import Sidebar from 'layout-components/Sidebar';
import axios from 'config/axios';
import getApiKey from 'config/getApiKey';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';

const SidebarMenu = (props) => {
  const { setSidebarToggleMobile, sidebarUserbox } = props;

  const toggleSidebarMobile = () => setSidebarToggleMobile(false);

  const [masterOpen, setMasterOpen] = useState(false);
  const [masterPsikotesOpen, setMasterPsikotesOpen] = useState(false);
  const [masterUjianOpen, setMasterUjianOpen] = useState(false);
  const [laporanOpen, setLaporanOpen] = useState(false);
  const [staticOpen, setStatic] = useState(false);
  const [level2Open, setLevel2Open] = useState(false);
  const [user, setUser] = useState(null);
  const [NoSubs, setNoSubs] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [openMerchant, setOpenMerchant] = useState(false);
  const [apikey, setApikey] = useState('');
  const toggleMaster = (event) => {
    setMasterOpen(!masterOpen);
    event.preventDefault();
  };
  const toggleLaporan = (event) => {
    setLaporanOpen(!laporanOpen);
    event.preventDefault();
  };

  useEffect(() => {
    getApiKey().then((key) => {
      if(key.status){
        setApikey(key.key);
      }
    });
    getUser();
  }, []);

  const getUser = async () => {
    try {      
      let cekUser = await auth();
      console.log(cekUser);
      if(cekUser.status){
        let statusGerai = await checkStatus();
        console.log("STATUS GERAI", statusGerai)
        if(statusGerai.status) {
          setNoSubs(false);
        }
        else{
          setNoSubs(true);
        }
        setUser(statusGerai.data);
        if(statusGerai.data.gerai_buka === 'FALSE'){
          setOpenMerchant(false);
        }
        else{
          setOpenMerchant(true);
        }
      }
      else{
        console.log(cekUser.msg)
      }     
      setMounted(true); 
      // const value = await localforage.getItem('gerai');
      // setUser(value);
      // This code runs once the value has been loaded
      // from the offline store.
      // console.log("user private", value);
    } catch (err) {
      // This code runs if there were any errors.
      console.log(err);
    }
    // try {
    //   const value = await localforage.getItem('user');
    //   // This code runs once the value has been loaded
    //   // from the offline store.
    //   // console.log("user private", value);
    //   setUser(value);
    //   setMounted(true);
    // } catch (err) {
    //   // This code runs if there were any errors.
    //   console.log(err);
    // }
  };

  const updateOpenMerchant = () => {        
    axios.post('/app/gerai/openmerchant',{
      apikey: apikey
    }).then((data) => {
      console.log(data);
      if(data.status){
        console.log(data.data)
        if(data.data === 'FALSE'){
          setOpenMerchant(false);
        }
        else{
          setOpenMerchant(true);
        }
        window.location.reload();
      }
      else{
        toast.error(data.msg, { containerId:'B', transition: Zoom });
      }
    })
    .catch((error) => {
      if(error.response.status != 500){
        toast.error(error.response.data.msg, {containerId:'B', transition: Zoom});
      }
      else{
        toast.error(Errormsg['500'], {containerId: 'B', transition: Zoom});
      }
    })
  }

  return (
    <>
      <PerfectScrollbar>
        {/* {sidebarUserbox && <SidebarUserbox />} */}
        <div className="sidebar-navigation">
          {/* <div className="sidebar-header">
            <span>Navigation menu</span>
          </div> */}
          {(user && user.tu != 'Psikotes') &&
            <ul>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/dashboard">
                  <span className="sidebar-icon">
                    <Shield />
                  </span>
                Dashboard
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              {!NoSubs ?
              <>
              <li>
                <a
                  style = {{cursor:'pointer'}}
                  onClick={() => {updateOpenMerchant();}}
                  className={clsx({ active: masterOpen })}>
                  <span className="sidebar-icon">
                    <Home/>
                  </span>
                  <span className="sidebar-item-label">Status Gerai Buka</span>
                  <span className="sidebar-icon-indicator">
                    {openMerchant ? <FontAwesomeIcon icon='circle' color='#39ff2f' /> : <FontAwesomeIcon icon='circle' color='red'/>}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#/"
                  onClick={toggleMaster}
                  className={clsx({ active: masterOpen })}>
                  <span className="sidebar-icon">
                    <Database />
                  </span>
                  <span className="sidebar-item-label">Master</span>
                  <span className="sidebar-icon-indicator">
                    <ChevronRight />
                  </span>
                </a>
                <Collapse isOpen={masterOpen}>
                  <ul>
                  <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/tipemenu">
                        Tipe Menu
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/menu">
                        Menu
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/menu_tambahan">
                        Menu Tambahan
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/task">
                        Task
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/voucher">
                        Voucher
                      </NavLink>
                    </li>                    
                  </ul>
                </Collapse>
              </li>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/order">
                  <span className="sidebar-icon">
                    <Clipboard />
                  </span>
                  Pemesanan
                  <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/chat/list">
                  <span className="sidebar-icon">
                    <MessageSquare />
                  </span>
                  Pesan
                  <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/openhour">
                  <span className="sidebar-icon">
                    <Clock/>
                  </span>
                  Jam Operasi
                  <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              <li>
                <a
                  href="#/"
                  onClick={toggleLaporan}
                  className={clsx({ active: laporanOpen })}>
                  <span className="sidebar-icon">
                    <PieChart/>
                  </span>
                  <span className="sidebar-item-label">Laporan</span>
                  <span className="sidebar-icon-indicator">
                    <ChevronRight/>
                  </span>
                </a>
                <Collapse isOpen={laporanOpen}>
                  <ul>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/laporan/pesanan">
                        Pesanan
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/laporan/menu/list">
                        Menu
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/laporan/task/list">
                        Task
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/laporan/income">
                        Income
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/laporan/complain">
                        Komplain
                      </NavLink>
                    </li>
                  </ul>
                </Collapse>
              </li>
              </>
              :null}
              {/* <li>
                <div className="d-sm-block text-white py-2 mx-2 border-bottom border-dark">
                    <div className="d-sm-block mx-2">Tahap II Administrasi</div>
                </div>
              </li>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/tahap2">
                  <span className="sidebar-icon">
                    <Shield />
                  </span>
                Administrasi
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              <li>
                <div className="d-sm-block text-white py-2 mx-2 border-bottom border-dark">
                    <div className="d-sm-block mx-2">Tahap III Ujian</div>
                </div>
              </li>              
              <li>
                <a
                  href="#/"
                  onClick={toggleMasterUjian}
                  className={clsx({ active: masterUjianOpen })}>
                  <span className="sidebar-icon">
                    <Clipboard />
                  </span>
                  <span className="sidebar-item-label">Master Ujian</span>
                  <span className="sidebar-icon-indicator">
                    <ChevronRight />
                  </span>
                </a>
                <Collapse isOpen={masterUjianOpen}>
                  <ul>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/ujian/kategori">
                        Kategori Ujian
                    </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/ujian/soal">
                        Soal Ujian
                    </NavLink>
                    </li>
                  </ul>
                </Collapse>
              </li>
              <li> */}
                {/* <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/master/ujian/setting">
                  <span className="sidebar-icon">
                    <Settings />
                  </span>
                Ujian Setting
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li> */}
              {/* <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/tahap2">
                  <span className="sidebar-icon">
                    <Shield />
                  </span>
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                  <ChevronRight />
                </span> 
              </NavLink>
              </li> */}
              {/* <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/master/ujian/hasil">
                  <span className="sidebar-icon">
                    <CheckSquare />
                  </span>
                Hasil Ujian
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
              <li>
                <a
                  href="#/"
                  onClick={toggleMasterPsikotes}
                  className={clsx({ active: masterPsikotesOpen })}>
                  <span className="sidebar-icon">
                    <Clipboard />
                  </span>
                  <span className="sidebar-item-label">Master Psikotes</span>
                  <span className="sidebar-icon-indicator">
                    <ChevronRight />
                  </span>
                </a>
                <Collapse isOpen={masterPsikotesOpen}>
                  <ul>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/userpsikotes/list">
                        User Psikotes
                    </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/psikotes/export">
                        Export Data Peserta Psikotes
                    </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/master/aspekpsikotes/list">
                        Master Aspek
                    </NavLink>
                    </li>
                  </ul>
                </Collapse>
              </li>
              <li> */}
                {/* <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/psikotes">
                  <span className="sidebar-icon">
                    <List />
                  </span>
                Daftar ujian Psikotes
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li> */}
              {/* <li>
              <NavLink
                activeClassName="active"
                onClick={toggleSidebarMobile}
                className="nav-link-simple"
                to="/master/ujian/request">
                <span className="sidebar-icon">
                  <Clipboard />
                </span>
                Request Ujian
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                  <ChevronRight />
                </span> 
              </NavLink>
            </li> */}
             {/* <li>
                <div className="d-sm-block text-white py-2 mx-2 border-bottom border-dark">
                    <div className="d-sm-block mx-2">Tahap IV Unggah Berkas</div>
                </div>
              </li>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/tahap4">
                  <span className="sidebar-icon">
                    <Briefcase />
                  </span>
                Unggah Berkas
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
            <li>
                <div className="d-sm-block text-white py-2 mx-2 border-bottom border-dark">
                    <div className="d-sm-block mx-2">Statis</div>
                </div>
              </li>
              <li>
                <a
                  href="#/"
                  onClick={toggleStatic}
                  className={clsx({ active: staticOpen })}>
                  <span className="sidebar-icon">
                    <Layout />
                  </span>
                  <span className="sidebar-item-label">Statis</span>
                  <span className="sidebar-icon-indicator">
                    <ChevronRight />
                  </span>
                </a>
                <Collapse isOpen={staticOpen}>
                  <ul>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/static/timeline">
                        Timeline
                    </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/static/tatib">
                        Tata Tertib Ujian
                    </NavLink>
                    </li>
                    <li>
                      <NavLink
                        onClick={toggleSidebarMobile}
                        to="/static/alamatdokumen">
                        Alamat Pengiriman Dokumen
                    </NavLink>
                    </li>
                  </ul>
                </Collapse>
              </li> */}
            </ul>
          }
          {/* {(user && user.tu == 'Psikotes') &&
            <ul>
              <li>
                <NavLink
                  activeClassName="active"
                  onClick={toggleSidebarMobile}
                  className="nav-link-simple"
                  to="/psikotes">
                  <span className="sidebar-icon">
                    <List />
                  </span>
                Daftar Psikotes
                <span className="sidebar-icon-indicator sidebar-icon-indicator-right">
                    <ChevronRight />
                  </span>
                </NavLink>
              </li>
            </ul>
          } */}
        </div>
      </PerfectScrollbar>
    </>
  );
};

const mapStateToProps = (state) => ({
  sidebarUserbox: state.ThemeOptions.sidebarUserbox,
  sidebarToggleMobile: state.ThemeOptions.sidebarToggleMobile
});

const mapDispatchToProps = (dispatch) => ({
  setSidebarToggleMobile: (enable) => dispatch(setSidebarToggleMobile(enable))
});

export default connect(mapStateToProps, mapDispatchToProps)(SidebarMenu);
// export default SidebarMenu;
