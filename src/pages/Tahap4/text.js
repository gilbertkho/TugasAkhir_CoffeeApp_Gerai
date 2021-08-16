import React from 'react';
import { Container, Row } from 'reactstrap';

export default function TextPage({ texts, reqName }) {
  return (
    <Container>
      {texts && texts.length > 0 ? (
        texts.map((e) => (
          <Row style={{ justifyContent: 'space-between' }} key={e.seq}>
            <p>{reqName}</p>
            <p>{e.txt}</p>
          </Row>
        ))
      ) : (
        <Row>
          <p>Belum ada data</p>
        </Row>
      )}
    </Container>
  );
}
