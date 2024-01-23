import React, { useState, useEffect } from "react";
import { Flex, Spin, Col, Row, Button, Radio, Card, Result } from "antd";
import { DingdingOutlined } from "@ant-design/icons";
import LoadingBar from "react-top-loading-bar";
import "./quiz-body.scss";

export default function QuizBody() {
  const [quizData, setQuizData] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTrue, setState] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [value, setValue] = useState(1);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [timerWarning, setTimerWarning] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [showQuizStatus, setQuiz] = useState(false);

  async function fetchData() {
    try {
      const response = await fetch(`https://the-trivia-api.com/v2/questions/`);
      const result = await response.json();
      setQuizData(result);
      setState(true);
      setQuizAnswers([...result[0].incorrectAnswers, result[1].correctAnswer]);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (quizData.length > 0) {
      const returnArr = shuffleArray([
        ...quizData[questionIndex].incorrectAnswers,
        quizData[questionIndex].correctAnswer,
      ]);
      setQuizAnswers(returnArr);
    }
  }, [questionIndex, quizData]);

  useEffect(() => {
    if (quizStarted && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeRemaining((prevTime) => prevTime - 1);

        if (timeRemaining === 60) {
          setTimerWarning(true);
        }

        if (timeRemaining === 0) {
          setQuizCompleted(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [quizStarted, quizCompleted, timeRemaining]);

  const onChange = (e) => {
    setValue(e.target.value);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleNextQuestion = () => {
    setProgress(progress + 10);

    if (value === quizData[questionIndex].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    if (questionIndex + 1 < quizData.length) {
      setQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }

    setUserResponses((prevResponses) => [
      ...prevResponses,
      {
        question: quizData[questionIndex].question.text,
        userAnswer: value,
        correctAnswer: quizData[questionIndex].correctAnswer,
      },
    ]);

    setValue(1);
  };

  const handleRetry = () => {
    setQuestionIndex(0);
    setProgress(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
    setTimeRemaining(600);
    setTimerWarning(false);
    setUserResponses([])
  };
  
  const handleExit = () => {
    setUserResponses([])
    setQuestionIndex(0);
    setProgress(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(false);
    setTimeRemaining(600);
    setTimerWarning(false);
  };

  return (
    <div className="main">
      {!quizStarted ? (
        <div>
          <div style={{padding: "30px" }}>
            <Row gutter={24}>
              <Col span={24}>
                <Card title="" bordered={false}>
                <img width="200px" src="https://cdn3d.iconscout.com/3d/free/thumb/free-puzzle-3814119-3187500.png" />
                <h1 style={{textAlign:"center"}}>Let's play!</h1>
                <p style={{textAlign:"center", color:"#989898"}}>
                  Play now and level up
                </p>
                  <Button
                  style={{width:"100%", fontSize:"18px", padding:"10px 0px 40px 0px"}}
                    type="primary"
                    size="medium"
                    onClick={handleStartQuiz}
                  >
                    Start Quiz
                  </Button>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      ) : isTrue && !quizCompleted ? (
        <div className="question-section">
          <div>
            <div className="header">
              <h1>Quiz</h1>
              <div>
                {timerWarning && (
                  <div className="warning-last-minute">
                    1 minute left!
                  </div>
                )}
                <div className="time">
                  Time : {Math.floor(timeRemaining / 60)}:
                  {timeRemaining % 60 < 10
                    ? `0${timeRemaining % 60}`
                    : timeRemaining % 60}
                </div>
              </div>
            </div>
          </div>
          <LoadingBar
            style={{ background: "#fffb24" }}
            progress={progress + 10}
            onLoaderFinished={() => setProgress(progress)}
          />
          <Row wrap={false}>
            <Col span={2} xs={3} sm={2} md={1}>
              <div
                style={{
                  padding: "0 10px 0px 0px",
                }}
              >
                <h3>{`${
                  questionIndex < 9
                    ? `0${questionIndex + 1}`
                    : questionIndex + 1
                }: `}</h3>
              </div>
            </Col>
            <Col span={22} xs={21} sm={22} md={23}>
              <h3>{quizData[questionIndex].question.text}</h3>
            </Col>
          </Row>
          <Row>
            <Radio.Group
              className="radio-group"
              onChange={onChange}
              value={value}
            >
              {quizAnswers &&
                quizAnswers.map((v, i) => (
                  <Col span={24} key={i}>
                    <Radio className="option" value={v} key={v}>
                      {v}
                    </Radio>
                  </Col>
                ))}
            </Radio.Group>
          </Row>
          <div className="btn-div">
            <Button
              type="primary"
              size="large"
              onClick={handleNextQuestion}
              disabled={value === 1}
            >
              {questionIndex < 9 ? "Next" : "Submit"}
              <DingdingOutlined />
            </Button>
          </div>
        </div>
      ) : !quizCompleted ? (
        <Flex align="center" gap="middle">
          <Spin size="large" />
        </Flex>
      ) : (
        <Result
          className="result"
          status={score / quizData.length >= 0.5 ? "success" : "error"}
          title={`Quiz Completed! Your score: ${score}/${quizData.length}`}
          extra={
            <div>
              <Button type="primary" size="medium" onClick={handleRetry}>
                Retry Quiz
              </Button>
              <Button
                style={{ margin: "0px 10px" }}
                type="primary"
                size="medium"
                onClick={() => setQuiz(!showQuizStatus)}
              >
                {!showQuizStatus ? "View quiz status" : "Hide quiz status"}
              </Button>
              <Button
                type="danger"
                size="large"
                onClick={handleExit}
                className="exit"
              >
                Exit
              </Button>
            </div>
          }
        >
          {showQuizStatus ? (
            <div className="quiz-status">
              <h3>Quiz Status</h3>
              <ol>
                {userResponses.map((response, index) => (
                  <li key={index}>
                    <p>
                      <strong>Question:</strong> {response.question}
                    </p>
                    <p>
                      <strong>Your Answer:</strong> {response.userAnswer}
                    </p>
                    <p>
                      <strong>Correct Answer:</strong> {response.correctAnswer}
                    </p>
                    <hr />
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div></div>
          )}
        </Result>
      )}
    </div>
  );
}
