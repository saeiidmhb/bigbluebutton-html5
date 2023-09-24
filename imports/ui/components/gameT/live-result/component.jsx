import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { styles } from './styles';
import Service from './service';

import Countdown from "react-countdown";
import confetti from "canvas-confetti";
import GUsers from '/imports/api/users';

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.poll.liveResult.usersTitle',
    description: 'heading label for poll users',
  },
  responsesTitle: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'heading label for poll responses',
  },
  publishLabel: {
    id: 'app.game.publishLabel',
    description: 'label for the publish button',
  },
  cancelPollLabel: {
    id: 'app.poll.cancelPollLabel',
    description: 'label for cancel poll button',
  },
  backLabel: {
    id: 'app.poll.backLabel',
    description: 'label for the return to poll options button',
  },
  doneLabel: {
    id: 'app.createBreakoutRoom.doneLabel',
    description: 'label shown when all users have responded',
  },
  waitingLabel: {
    id: 'app.poll.waitingLabel',
    description: 'label shown while waiting for responses',
  },
  questionTimesUp: {
    id: 'app.game.questionTimesUp',
    description: 'question times up prompt',
  },
});

const getResponseString = (obj) => {
  const { children } = obj.props;
  if (typeof children !== 'string') {
    return getResponseString(children[1]);
  }

  return children;
};

class LiveResult extends PureComponent {
  static getDerivedStateFromProps(nextProps) {
    const {
      currentPoll, intl, pollAnswerIds, usernames, isDefaultPoll
    } = nextProps;
    if (!currentPoll) return null;

    const {
      answers, responses, users, numRespondents, pollType
    } = currentPoll;

    const defaultPoll = isDefaultPoll(pollType);

    const currentPollQuestion = (currentPoll.question) ? currentPoll.question : '';


    let gameUserAnswers = responses
      ? [...users, ...responses.map(u => u.userId)]
      : [...users];

    gameUserAnswers = gameUserAnswers.map(id => usernames[id])
      .map((user) => {
        let answer = '';
        let time = '';
        if (responses) {
          const response = responses.find(r => r.userId === user.userId);
          if (response){
            answer = answers[response.answerId].key;
            time = response.gAnswerTime;
          }
        }
        return {
          name: user.name,
          iddd: user.userId,
          avatar: user.avatar,
          answer,
          time,
        };
      })
      .sort(Service.sortUsers)

    let userAnswers = responses
      ? [...users, ...responses.map(u => u.userId)]
      : [...users];

    userAnswers = userAnswers.map(id => usernames[id])
      .map((user) => {
        let answer = '';
        let time = '';

        if (responses) {
          const response = responses.find(r => r.userId === user.userId);
          if (response){
            answer = answers[response.answerId].key;
            time = response.gAnswerTime;
          }
        }

        return {
          name: user.name,
          answer,
          time,
        };
      })
      .sort(Service.sortUsers)
      .reduce((acc, user) => {
        const formattedMessageIndex = user.answer.toLowerCase();
        return ([
          ...acc,
          (
            <tr key={_.uniqueId('stats-')}>
              <td className={styles.resultLeft}>{user.name}</td>
              <td data-test="receivedAnswer" className={styles.resultRight}>
                {
                  defaultPoll && pollAnswerIds[formattedMessageIndex]
                    ? intl.formatMessage(pollAnswerIds[formattedMessageIndex])
                    : user.answer
                }
              </td>
            </tr>
          ),
        ]);
      }, []);

    const pollStats = [];

    answers.reduce(caseInsensitiveReducer, []).map((obj) => {
      const formattedMessageIndex = obj.key.toLowerCase();
      const pct = Math.round(obj.numVotes / numRespondents * 100);
      const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;

      const calculatedWidth = {
        width: pctFotmatted,
      };

      return pollStats.push(
        <div className={styles.main} key={_.uniqueId('stats-')}>
          <div className={styles.left}>
            {
              defaultPoll && pollAnswerIds[formattedMessageIndex]
                ? intl.formatMessage(pollAnswerIds[formattedMessageIndex])
                : obj.key
            }
          </div>
          <div className={styles.center}>
            <div className={styles.barShade} style={calculatedWidth} />
            <div className={styles.barVal}>{obj.numVotes || 0}</div>
          </div>
          <div className={styles.right}>
            {pctFotmatted}
          </div>
        </div>,
      );
    });

    return {
      userAnswers,
      gameUserAnswers,
      pollStats,
      currentPollQuestion,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      userAnswers: null,
      pollStats: null,
      currentPollQuestion: null,
    };
  }
  sortPlayers(players, state) {

    for (var i = 0; i < players.length; i++) {
      for (var j = 0; j < ( players.length - i -1 ); j++) {
        let splt = parseInt(players[j].split(",")[2]);
        let splt2 = parseInt(players[j+1].split(",")[2]);
        if(state == 0)
        {
          if(splt > splt2)
          {
            let temp = players[j];
            players[j] = players[j + 1];
            players[j+1] = temp;
          }
        }
        else {
          if(splt < splt2)
          {
            let temp = players[j];
            players[j] = players[j + 1];
            players[j+1] = temp;
          }
        }
      }
    }
    return players;
  }

  timeComplete(isAutoPlay) {
    if(isAutoPlay == 'true')
    {
      const myBtn = document.getElementById("myPublishBtnID");
      if(myBtn)
        myBtn.click();
    }
  }

  render() {
    const {
      isMeteorConnected,
      intl,
      stopPoll,
      handleBackClick,
      currentPoll,
      currentMeeting,
      gamesList,
      currentUser,
    } = this.props;

    const { userAnswers, gameUserAnswers, pollStats, currentPollQuestion } = this.state;

    let waiting;
    let userCount = 0;
    let respondedCount = 0;

    if (userAnswers) {
      userCount = userAnswers.length;
      userAnswers.map((user) => {
        const response = getResponseString(user);
        if (response === '') return user;
        respondedCount += 1;
        return user;
      });

      waiting = respondedCount !== userAnswers.length && currentPoll;
    }

    const Completionist = () => <span className="rounded" style={{backgroundColor: "red", color: "white", fontSize: "x-large"}}>{intl.formatMessage(intlMessages.questionTimesUp)}</span>;

    const renderer = ({ hours, minutes, seconds, completed }) => {
      if (completed) {
        // Render a complete state
        return <Completionist />;
      } else {
        // Render a countdown
        return (
          <span className="rounded" style={{backgroundColor: "#61b1be", color: "white", fontSize: "x-large"}}>
            {minutes}:{seconds}
          </span>
        );
      }
    };
    let qTime = 0;
    let gQuestionFile = '';
    let questionFile = '';
    let elapsedTime = 0;
    let gQuestionTime = '';
    if(currentPoll)
    {
      const qStartTime = new Date(currentPoll.gStartTime);
      const serverTimeDif = currentUser.serverTimeDif;
      var nt = Date.now();
      nt += serverTimeDif;
      nt = new Date(nt);
      elapsedTime = nt - qStartTime;
      const qTime = parseInt(currentPoll.gQuestionTime);
      gQuestionTime = qTime;
      gQuestionFile = currentPoll.gQuestionFile;
      const gQuestionFileMIME = currentPoll.gQuestionFileMIME;
      if (gQuestionFile != '')
      {
        if (gQuestionFileMIME == '')
        {
          questionFile = <img style={{width: "200px"}} src={gQuestionFile} className="rounded mx-auto d-block" alt="game image"></img>;
        }
        else if (gQuestionFileMIME.includes("video"))
        {
          questionFile = <video style={{width: "200px"}} className="rounded mx-auto d-block" width="400" controls><source src={gQuestionFile} type={gQuestionFileMIME}></source>Your browser does not support HTML video.</video>;
        }
        else if (gQuestionFileMIME.includes("audio"))
        {
          questionFile = <audio style={{width: "215px"}} controls><source src={gQuestionFile} type={gQuestionFileMIME}></source>Your browser does not support the audio element.</audio>;
        }
      }
    }
    return (
      <>
      {currentPoll ? <div className="row text-center">
        <Countdown date={Date.now() + gQuestionTime*1000 - (elapsedTime)} renderer={renderer} onComplete={() => this.timeComplete(currentMeeting.isAutoPlay)}/>
      </div>:null}
      <div>
        <div className={styles.stats}>
          {currentPollQuestion ? <span className={styles.title}>{currentPollQuestion}</span> : null}
          {questionFile !== '' ? questionFile : null}
          <div className={styles.status}>
            {waiting
              ? (
                <span>
                  {`${intl.formatMessage(intlMessages.waitingLabel, {
                    0: respondedCount,
                    1: userCount,
                  })} `}
                </span>
              )
              : <span>{intl.formatMessage(intlMessages.doneLabel)}</span>}
            {waiting
              ? <span className={styles.connectingAnimation} /> : null}
          </div>
          {pollStats}
        </div>
        {currentPoll
          ? (
            <div className={styles.buttonsActions}>
              <Button
                id="myPublishBtnID"
                disabled={!isMeteorConnected}
                onClick={() => {
                  Session.set('gameInitiated', false);
                  // let gameScoreBoard="G11111*Ahmadreza,20,1,120,1|Alireza,10,3,100,2|Maryam,15,2,80,3";
                  let isAutoPlay = currentMeeting.isAutoPlay;
                  let gameScoreBoard = currentMeeting.gameScoreBoard;
                  let playedQuestions = currentMeeting.playedQuestions;
                  let playersTimeList = [];
                  for (const [index, value] of gameUserAnswers.entries()) {
                    if( currentPoll.gameQuestionAnswer == value.answer )
                    {
                      let respTime = new Date(value.time);
                      let quesTime = new Date(currentPoll.gStartTime);
                      let calculatedTime = respTime - quesTime;
                      let avtr = "";
                      if(value.avatar && value.avatar != '')
                        avtr = value.avatar;
                      else
                        avtr = "https://www.w3schools.com/howto/img_avatar.png";
                      playersTimeList.push(value.name + "," + avtr + "," + calculatedTime + "," + value.iddd);
                    }
                  }
                  playersTimeList = this.sortPlayers(playersTimeList,0);
                  let playersQuestionScoreList = [];
                  let playersGameScoreList = [];
                  for (const [index, value] of playersTimeList.entries()) {
                    const valueSplit = value.split(",");
                    const tname = valueSplit[0];
                    const tavatar = valueSplit[1];
                    const tiddd = valueSplit[3];
                    let rank = index + 1;
                    if(index == 0)
                      playersQuestionScoreList.push(tname + "," + "10," + rank + "," + tiddd + "," + tavatar);
                    else if(index == 1)
                      playersQuestionScoreList.push(tname + "," + "7," + rank + "," + tiddd + "," + tavatar);
                    else if(index == 2)
                      playersQuestionScoreList.push(tname + "," + "5," + rank + "," + tiddd + "," + tavatar);
                    else if(index > 2)
                      playersQuestionScoreList.push(tname + "," + "2," + rank + "," + tiddd + "," + tavatar);
                  }
                  const correctAnswersNumber = playersQuestionScoreList.length;
                  let counter = 0;
                  for (const [index, value] of gameUserAnswers.entries()) {
                    let playerFound = false;
                    for (const [index1, value1] of playersQuestionScoreList.entries()) {
                      let tempIddd = value1.split(",")[3];
                       if(value.iddd == tempIddd)
                       {
                          playerFound = true;
                       }
                    }
                    if(!playerFound)
                    {
                      let rank = correctAnswersNumber + counter + 1;
                      playersQuestionScoreList.push(value.name + "," + "0," + rank + "," + value.iddd + "," + value.avatar);
                      counter += 1;
                    }
                  }
                  playedQuestions = currentMeeting.playedQuestions;

                  let qNumbers = 0;
                  for (const [index, value] of gamesList.entries()){
                    if(value["GameID"] == currentPoll.gameID){
                      qNumbers = parseInt(value["QuestionsNumber"]);
                      break;
                    }
                  }

                  const endedGameID = Session.get('EndedGame');
                  if (endedGameID && endedGameID != '') gameScoreBoard = '';
                  if (gameScoreBoard == '')
                  {
                    gameScoreBoard += currentPoll.gameID + "*";
                    for (const [index, value] of playersQuestionScoreList.entries()) {
                      let playerScore = value.split(",");
                      let text = "";
                      let avtr1 = playerScore[4] != '' ? playerScore[4] : "https://www.w3schools.com/howto/img_avatar.png";
                      text += playerScore[0] + "," + playerScore[1] + "," + playerScore [2] + "," + playerScore[1] + "," + playerScore[2] + "," + playerScore[3] + "," + avtr1;
                      if (index + 1 != playersQuestionScoreList.length)
                        text += "|";
                      gameScoreBoard += text;
                    }
                  }
                  else {
                    const gsbGameID = gameScoreBoard.split('*')[0];
                    const gsbPlayers = gameScoreBoard.split('*')[1];
                    const gsbPlayersScores = gsbPlayers.split('|');
                    playersGameScoreList = [];
                    // Ahmadreza,10,1,10,1,iddd,avatar
                    for (const [index, value] of playersQuestionScoreList.entries()) {
                      let found = false;
                      let playerQuestionScore = value.split(",");
                      for (const [index1, value1] of gsbPlayersScores.entries()) {
                        let playerGameScore = value1.split(",");
                        if(playerQuestionScore[3] == playerGameScore[5])
                        {
                          found = true;
                          let avtr1 = playerQuestionScore[4];
                          if(avtr1 == '')
                          {
                            const gUser = GUsers.findOne(
                              { userId: playerQuestionScore[3] },
                              {
                                fields:
                                {
                                  avatar: 1,
                                },
                              },
                            );
                            avtr1 = gUser.avatar && gUser.avatar != '' ? gUser.avatar : "https://www.w3schools.com/howto/img_avatar.png";
                          }
                          let pGScore = parseInt(playerQuestionScore[1]) + parseInt(playerGameScore[3]);
                          playersGameScoreList.push(playerQuestionScore[0] + "," + playerQuestionScore[1] + "," + pGScore + "," + playerQuestionScore[3] + "," + avtr1);
                        }
                      }
                      if(!found)
                      {
                        let avtr1 = playerQuestionScore[4];
                        if(avtr1 == '')
                        {
                          const gUser = GUsers.findOne(
                            { userId: playerQuestionScore[3] },
                            {
                              fields:
                              {
                                avatar: 1,
                              },
                            },
                          );
                          avtr1 = gUser.avatar != '' ? gUser.avatar : "https://www.w3schools.com/howto/img_avatar.png";
                        }
                        playersGameScoreList.push(playerQuestionScore[0] + "," + playerQuestionScore[1] + "," + playerQuestionScore[1] + "," + playerQuestionScore[3] + "," + avtr1);
                      }


                    }
                    let tempPlayersGameScoreList = [];
                    playersGameScoreList = this.sortPlayers(playersGameScoreList,1);
                    for (const [index, value] of playersGameScoreList.entries()) {
                      let rank = index + 1;
                      let split = value.split(",");
                      tempPlayersGameScoreList.push(split[0] + "," + split[2] + "," + rank + "," + split[3] + "," + split[4]);

                    }
                    playersGameScoreList = tempPlayersGameScoreList;
                    gameScoreBoard = currentPoll.gameID + "*";
                    for (const [index, value] of playersGameScoreList.entries()) {
                      let pGScore = value.split(",");
                      let rank = index + 1;
                      for (const [index1, value1] of playersQuestionScoreList.entries()) {
                        let pQScore = value1.split(",");
                        if(pGScore[3] == pQScore[3])
                        {
                          let t = pQScore[0] + "," + pQScore[1]  + "," + pQScore[2] + "," + pGScore[1] + "," + rank + "," + pGScore[3] + "," + pGScore[4];
                          gameScoreBoard += t;
                          if ( tempPlayersGameScoreList.length != (index + 1) )
                          gameScoreBoard += "|";
                        }
                      }
                    }
                  }
                  let tempID = 0;
                  // playedQuestions = "1*1,2,3,4|2*1,2,3"
                  let playedQuestionsTemp = playedQuestions;
                  if (endedGameID && endedGameID != '') {
                    playedQuestionsTemp = '';
                    for (let i = 0; i < playedQuestions.length - 1; i++) {
                      playedQuestionsTemp += playedQuestions[i];
                    }
                    if (playedQuestions[playedQuestions.length - 1] == ',')
                      playedQuestionsTemp += '|';
                    else
                      playedQuestionsTemp += playedQuestions[playedQuestions.length - 1] + '|';
                  }
                  playedQuestions = playedQuestionsTemp;
                  if(playedQuestions == ''){
                    playedQuestions += currentPoll.gameID + '*' + currentPoll.gameQuestionID;
                    if(qNumbers == 1)
                      playedQuestions += '|';
                    else
                      playedQuestions += ',';
                  }
                  else {
                    const gamesQ = playedQuestions.split('|');
                    let qFound = false;
                    for (const [index, value] of gamesQ.entries()) {

                      let gID = value.split('*');
                      if(currentPoll.gameID == gID[0])
                      {
                        qFound = true;
                        tempID = currentPoll.gameID;
                        break;
                      }
                    }

                    if (!qFound) {
                      playedQuestions += currentPoll.gameID + '*' + currentPoll.gameQuestionID;
                      if(qNumbers == 1)
                        playedQuestions += '|';
                      else
                        playedQuestions += ',';
                    }
                    else {
                      const gamesQ = playedQuestions.split('|');
                      let playedQTemp = '';
                      let tempFound = '';
                      for (const [index, value] of gamesQ.entries()) {
                        if (tempID != value.split("*")[0]) {
                          if (value != '')
                            playedQTemp += value + "|";
                        }
                        else {
                          tempFound = value;
                        }
                      }

                      if (tempFound != '') {
                        if (tempFound[tempFound.length - 1] == ',')
                          playedQTemp += tempFound + currentPoll.gameQuestionID;
                        else
                          playedQTemp += tempFound + "," + currentPoll.gameQuestionID;

                        let len = 0;
                        for (const [index, value] of playedQTemp.split("|").entries()) {
                          if (value.split("*")[0] == currentPoll.gameID)
                            len = value.split("*")[1].split(',').length;
                        }
                        if(qNumbers == len)
                          playedQTemp += '|';
                        else
                          playedQTemp += ",";
                        playedQuestions = playedQTemp;
                      }
                    }
                  }

                  Session.set('EndedGame', '');
                  Service.publishPoll(gameScoreBoard, playedQuestions, isAutoPlay);
                  stopPoll();
                }}
                  label={intl.formatMessage(intlMessages.publishLabel)}
                  data-test="publishPollingLabel"
                  color="primary"
                  className={styles.publishBtn}
                />
              <Button
                disabled={!isMeteorConnected}
                onClick={() => {
                  Session.set('gameInitiated', false);
                  Session.set('resetGamePanel', true);
                  stopPoll();
                }}
                label={intl.formatMessage(intlMessages.cancelPollLabel)}
                data-test="cancelGameLabel"
                className={styles.cancelBtn}
              />
            </div>
          ) : (
            <Button
              disabled={!isMeteorConnected}
              onClick={() => {
                handleBackClick();
              }}
              label={intl.formatMessage(intlMessages.backLabel)}
              color="primary"
              data-test="restartPoll"
              className={styles.btn}
            />
          )
        }
        <div className={styles.separator} />
        { currentPoll
          ? (
            <table>
              <tbody>
                <tr>
                  <th className={styles.theading}>{intl.formatMessage(intlMessages.usersTitle)}</th>
                  <th className={styles.theading}>{intl.formatMessage(intlMessages.responsesTitle)}</th>
                </tr>
                {userAnswers}
              </tbody>
            </table>
          ) : (
            currentPoll ? (<div>{intl.formatMessage(intlMessages.secretPollLabel)}</div>) : null
        )}
        </div>
      </>
    );
  }
}

export default injectIntl(LiveResult);

LiveResult.defaultProps = { currentPoll: null };

LiveResult.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentPoll: PropTypes.oneOfType([
    PropTypes.arrayOf(Object),
    PropTypes.shape({
      answers: PropTypes.arrayOf(PropTypes.object),
      users: PropTypes.arrayOf(PropTypes.string),
    }),
  ]),
  stopPoll: PropTypes.func.isRequired,
  handleBackClick: PropTypes.func.isRequired,
};
