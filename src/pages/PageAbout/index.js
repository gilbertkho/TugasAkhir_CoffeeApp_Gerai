import React from 'react';

export default function About() {
  const version = process.env.REACT_APP_VERSION;
  return (
    <>
      {version}
    </>
  );
}
