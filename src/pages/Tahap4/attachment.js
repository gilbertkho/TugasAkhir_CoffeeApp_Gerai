import axios from 'config/axios';
import React from 'react';
import { Container, Row } from 'reactstrap';

function getLink(filepath) {
  let url = axios.defaults.baseURL;
  return url + 'serve/reqattach/' + filepath;
}
export default function AttachmentPage({ attachment }) {
  return (
    <Container>
      {attachment && attachment.length > 0 ? (
        attachment.map((e) => (
          <Row style={{ justifyContent: 'space-between' }} key={e.seq}>
            <a href={getLink(e.file)} target="_blank" rel="noopener noreferrer">
              {e.name}
            </a>
            <a href={getLink(e.file) + '?download=true'} download>
              Download
            </a>
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
