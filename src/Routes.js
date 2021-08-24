/* eslint-disable */
import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ClimbingBoxLoader } from 'react-spinners';
import axios from 'config/axios';
import PrivateRoute from './components/privateroute';
// import localforage from 'config/localForage';
import localforage from 'localforage';
import { connect } from 'react-redux';
import { setProfilePicture } from './redux/reducers/General';
import auth from 'config/auth';
import jwt  from 'jsonwebtoken';
// Layout Blueprints

import { LeftSidebar, MinimalLayout } from './layout-blueprints';

// Example Pages

import PageError404 from './pages/PageError404';
import PageAbout from './pages/PageAbout';
import { toast, Zoom } from 'react-toastify';
import Errormsg from 'config/errormsg';
import checkStatus from 'config/checkStatus';

const DashboardStatistics = lazy(() => import('./pages/DashboardStatistics'));
const PageLoginBasic = lazy(() => import('./pages/PageLoginBasic'));
const PageRegister = lazy(() => import('./components/PageRegister'))
const PageRecoverBasic = lazy(() => import('./pages/PageRecoverBasic'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderList = lazy(() => import('./pages/Order'));
const OrderEdit = lazy(() => import('./pages/Order/edit'));
const MenuList = lazy(() => import('./pages/Master/Menu'));
const MenuEdit = lazy(() => import('./pages/Master/Menu/edit'));
const MenuTambahanList  = lazy(() => import('./pages/Master/MenuTambahan'));
const MenuTambahanEdit  = lazy(() => import('./pages/Master/MenuTambahan/edit'));
const TipeMenuList = lazy(() => import('./pages/Master/TipeMenu'));
const TipeMenuEdit = lazy(() => import('./pages/Master/TipeMenu/edit'));
const TaskList = lazy(() => import('./pages/Master/Task'));
const TaskEdit = lazy(() => import('./pages/Master/Task/edit'));
const VoucherList = lazy(() => import('./pages/Master/Voucher'));
const VoucherEdit = lazy(() => import('./pages/Master/Voucher/edit'));
const Withdraw = lazy(() => import('./pages/Withdraw/withdraw'));
const LaporanPesanan = lazy(() => import('./pages/Laporan/Pesanan'));
const LaporanMenuList = lazy(() => import('./pages/Laporan/Menu/index'));
const LaporanMenu = lazy(() => import('./pages/Laporan/Menu/Menu'));
const LaporanTaskList = lazy(() => import('./pages/Laporan/Task/index'));
const LaporanTask = lazy(() => import('./pages/Laporan/Task/Task'));
const LaporanIncome = lazy(() => import('./pages/Laporan/Income/index'));
const LaporanKomplain = lazy(() => import('./pages/Laporan/Komplain/index'));
const ChatList = lazy(() => import('./pages/Chat/list'));
const Chat= lazy(() => import('./pages/Chat/chat'));
const OpenHour = lazy(() => import('./pages/OpenHour/index'));
const Rating = lazy(() => import('./pages/Rating/rating'));

const Routes = (props) => {
  const { setProfilePicture } = props;
  const location = useLocation();
  const [ NoSubs, setNoSubs] = useState(true);
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.99
    },
    in: {
      opacity: 1,
      scale: 1
    },
    out: {
      opacity: 0,
      scale: 1.01
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  const SuspenseLoading = () => {
    return (
      <>
        <div className="d-flex align-items-center flex-column vh-100 justify-content-center text-center py-3">
          <div className="d-flex align-items-center flex-column px-4">
            <ClimbingBoxLoader color={'#3c44b1'} loading={true} />
          </div>
          <div className="text-muted font-size-xl text-center pt-3">
            Loading
            {/* <span className="font-size-lg d-block text-dark">
              This live preview instance can be slower than a real production
              build!
            </span> */}
          </div>
        </div>
      </>
    );
  };

  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const getUser = useCallback(async () => {
    try {
      let cekUser = await auth();
      if (cekUser.status) {
        console.log('CEK USER');
        let statusGerai = await checkStatus();
        console.log('STATUS GERAI', statusGerai);
        if (statusGerai) {
          setNoSubs(false);
        } else {
          setNoSubs(true);
        }
        setUser(statusGerai.data);
        // setProfilePicture(cekUser.data.foto_gerai);
      } else {
        console.log(cekUser.msg);
      }

      setMounted(true);
      // const value = await localforage.getItem('gerai');
      // setUser(value);
      // This code runs once the value has been loaded
      // from the offline store.
      // console.log("user private", value);
    } catch (err) {
      setMounted(false);
      // This code runs if there were any errors.
      console.log(err);
    }
  }, []);

  useEffect(() => {
    getUser();
  }, [getUser]);

  if (mounted) {
    return (
      <AnimatePresence>
        <Suspense fallback={<SuspenseLoading />}>
          <Switch>
            {!user && <Redirect exact from="/" to="/login" />}
            {!user && <Redirect exact from="/master" to="/login" />}
            {user && <Redirect exact from="/" to="/dashboard" />}
            {user && <Redirect exact from="/login" to="/dashboard" />}
            {/* <Route path={['/Overview']}>
              <PresentationLayout>
                <Switch location={location} key={location.pathname}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}>
                    <Route path="/Overview" component={Overview} />
                  </motion.div>
                </Switch>
              </PresentationLayout>
            </Route> */}

            <Route path={['/dashboard', '/master', '/tahap2', '/tahap4', '/profile', '/static' ,'/notfound','/order','/laporan','/withdraw','/chat','/openhour','/rating']}>
              <LeftSidebar>
                <Switch location={location} key={location.pathname}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}>
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/dashboard"
                      component={DashboardStatistics}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/profile"
                      component={Profile}
                    />
                    {!NoSubs ?
                    <>
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/openhour"
                      component={OpenHour}
                    />
                    <PrivateRoute
                      user= {user}
                      exact
                      roles = {["Internal", "Administrator"]}
                      path = "/order"
                      component={OrderList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/order/edit"
                      component={OrderEdit}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/master/menu"
                      component={MenuList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/master/menu/edit"
                      component={MenuEdit}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/master/tipemenu"
                      component={TipeMenuList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/master/tipemenu/edit"
                      component={TipeMenuEdit}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/master/menu_tambahan"
                      component={MenuTambahanList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/master/menu_tambahan/edit"
                      component={MenuTambahanEdit}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/master/task"
                      component={TaskList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/master/task/edit"
                      component={TaskEdit}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/master/voucher"
                      component={VoucherList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/master/voucher/edit"
                      component={VoucherEdit}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/laporan/pesanan"
                      component={LaporanPesanan}
                    />
                    <PrivateRoute
                      user={user}                      
                      roles={["Internal", "Administrator"]}
                      path="/laporan/menu/list"
                      component={LaporanMenuList}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/laporan/menu"
                      component={LaporanMenu}
                    />
                    <PrivateRoute
                      user={user}                      
                      roles={["Internal", "Administrator"]}
                      path="/laporan/task/list"
                      component={LaporanTaskList}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/laporan/task"
                      component={LaporanTask}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/laporan/income"
                      component={LaporanIncome}
                    />
                    <PrivateRoute
                      user={user}
                      exact
                      roles={["Internal", "Administrator"]}
                      path="/laporan/complain"
                      component={LaporanKomplain}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/withdraw"
                      component={Withdraw}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/chat/list"
                      component={ChatList}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/chat"
                      exact
                      component={Chat}
                    />
                    <PrivateRoute
                      user={user}
                      roles={["Internal", "Administrator"]}
                      path="/rating"
                      component={Rating}
                    />
                    </>
                    : null }
                  </motion.div>
                </Switch>
              </LeftSidebar>
            </Route>

            {/* <Route
              path={[
                '/PageCalendar',
                '/PageChat',
                '/PageProjects',
                '/PageFileManager',
                '/PageProfile'
              ]}>
              <CollapsedSidebar>
                <Switch location={location} key={location.pathname}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}>
                    <Route path="/PageCalendar" component={PageCalendar} />
                    <Route path="/PageChat" component={PageChat} />
                    <Route path="/PageProjects" component={PageProjects} />
                    <Route path="/PageFileManager" component={PageFileManager} />
                    <Route path="/PageProfile" component={PageProfile} />
                  </motion.div>
                </Switch>
              </CollapsedSidebar>
            </Route> */}

            <Route path={['/login','/register', '/forgotpassword', '/notfound', '/about']}>
              <MinimalLayout>
                <Switch location={location} key={location.pathname}>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}>
                    <Route exact path="/login" component={PageLoginBasic} />
                    <Route exact path="/register" component={PageRegister} />
                    {/* <Route exact path="/login/psikotes" component={PageLoginPsikotes} /> */}
                    <Route
                      path="/forgotpassword"
                      component={PageRecoverBasic}
                    />
                    <Route path="/notfound" component={PageError404} />
                    <Route path="/about/version" component={PageAbout} />
                  </motion.div>
                </Switch>
              </MinimalLayout>
            </Route>
            <Route component={PageError404} />
          </Switch>
        </Suspense>
      </AnimatePresence>
    );
  } else {
    return null;
  }
};

// const mapStateToProps = (state) => ({
//   rProfilePicture: state.General.profilePicture
// });

// const mapDispatchToProps = (dispatch) => ({
//   setProfilePicture: (pp) => dispatch(setProfilePicture(pp))
// });

// export default connect(mapStateToProps, mapDispatchToProps)(Routes);
export default Routes;
