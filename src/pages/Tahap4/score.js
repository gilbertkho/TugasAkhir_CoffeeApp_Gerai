import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

export default function ScorePage({ scores }) {
  /* 
    mappedScores = [
    {
        grade: GRADE,
        score: [
            {subject: Math, score: 123},
            {subject: A, score: 123}
        ]
    }]  
    */
  const [mappedScores, setMappedScores] = useState([]);

  function mapScore(scores) {
    let mapped = [];
    scores.forEach((x) => {
      let newScore = {
        grade: x.grade,
        score: [
          {
            subject: x.subject,
            score: x.score
          }
        ]
      };
      let stored = mapped.find((e) => e.grade === newScore.grade);
      if (stored) {
        stored.score = [...stored.score, ...newScore.score];
      } else mapped.push(newScore);
    });
    setMappedScores(mapped);
  }

  useEffect(() => {
    mapScore(scores);
  }, [scores]);

  return (
    <Container>
      {mappedScores && mappedScores.length > 0 ? (
        mappedScores.map((x) => (
          <Col key={x.grade} className="my-4">
            <Row style={{ fontWeight: 'bold', justifyContent: 'center' }}>
              {x.grade}
            </Row>
            <hr />
            {x.score.map((y) => (
              <Row
                style={{
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                key={y.subject}>
                <Col>{y.subject}</Col>
                <Col style={{ textAlign: 'right' }}>{y.score}</Col>
              </Row>
            ))}
          </Col>
        ))
      ) : (
        <Row>
          <p>Belum ada data</p>
        </Row>
      )}
    </Container>
  );
}
