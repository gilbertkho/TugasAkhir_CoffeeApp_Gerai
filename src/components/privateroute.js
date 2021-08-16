import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, user, roles, ...rest }) => {
  return (
    <Route
      {...rest}      
      render={(props) => {
        // console.log("user in private", user);
        if (user === null) {
          // not logged in so redirect to login page with the return url
          return (
            <Redirect
              to={{ pathname: '/login', state: { from: props.location } }}
            />
          );
        }

        // check if route is restricted by role
        // if (roles && roles.indexOf(user.tu) === -1) {
          // console.log(roles)
          // if (roles) {
          //   // role not authorised so redirect to home page
          //   let matchRole = roles.find(x => x === user.tu);
          //   console.log("match role", matchRole, roles, user.tu);
            // if (!matchRole) {

              // if (user.tu === "Administrator" || user.tu === "Internal") {
                // return <Redirect to={{ pathname: '/dashboard' }} />
              // } else {
              //   // return <Redirect to={{ pathname: '/psikotes' }} />
              // }
            // }
          // }
        // }

        // authorised so return component
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
