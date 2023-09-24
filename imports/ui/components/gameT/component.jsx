import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import _ from 'lodash';
import { Session } from 'meteor/session';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import LiveResult from './live-result/component';
import { styles } from './styles.scss';
import { PANELS, ACTIONS } from '../layout/enums';

import QuestionModal from './modal/container';
import Service from './live-result/service';

const intlMessages = defineMessages({
  gamePaneTitle: {
    id: 'app.game.gamePaneTitle',
    description: 'heading label for the game menu',
  },
  closeLabel: {
    id: 'app.poll.closeLabel',
    description: 'label for poll pane close button',
  },
  hideGameDesc: {
    id: 'app.game.hideGameDesc',
    description: 'aria label description for hide game button',
  },
  quickPollInstruction: {
    id: 'app.poll.quickPollInstruction',
    description: 'instructions for using pre configured polls',
  },
  activePollInstruction: {
    id: 'app.poll.activePollInstruction',
    description: 'instructions displayed when a poll is active',
  },
  ariaInputCount: {
    id: 'app.poll.ariaInputCount',
    description: 'aria label for custom poll input field',
  },
  customPlaceholder: {
    id: 'app.poll.customPlaceholder',
    description: 'custom poll input field placeholder text',
  },
  noPresentationSelected: {
    id: 'app.poll.noPresentationSelected',
    description: 'no presentation label',
  },
  clickHereToSelect: {
    id: 'app.poll.clickHereToSelect',
    description: 'open uploader modal button label',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  optionErr: {
    id: 'app.poll.optionErr',
    description: 'poll input error label',
  },
  tf: {
    id: 'app.poll.tf',
    description: 'label for true / false poll',
  },
  a4: {
    id: 'app.poll.a4',
    description: 'label for A / B / C / D poll',
  },
  delete: {
    id: 'app.poll.optionDelete.label',
    description: '',
  },
  gamePanelDesc: {
    id: 'app.game.panel.desc',
    description: '',
  },
  questionLabel: {
    id: 'app.poll.question.label',
    description: '',
  },
  userResponse: {
    id: 'app.poll.userResponse.label',
    description: '',
  },
  responseChoices: {
    id: 'app.poll.responseChoices.label',
    description: '',
  },
  typedResponseDesc: {
    id: 'app.poll.typedResponse.desc',
    description: '',
  },
  responseTypesLabel: {
    id: 'app.poll.responseTypes.label',
    description: '',
  },
  addOptionLabel: {
    id: 'app.poll.addItem.label',
    description: '',
  },
  startGameLabel: {
    id: 'app.game.start.label',
    description: '',
  },
  questionTitle: {
    id: 'app.poll.question.title',
    description: '',
  },
  true: {
    id: 'app.poll.answer.true',
    description: '',
  },
  false: {
    id: 'app.poll.answer.false',
    description: '',
  },
  a: {
    id: 'app.poll.answer.a',
    description: '',
  },
  b: {
    id: 'app.poll.answer.b',
    description: '',
  },
  c: {
    id: 'app.poll.answer.c',
    description: '',
  },
  d: {
    id: 'app.poll.answer.d',
    description: '',
  },
  yna: {
    id: 'app.poll.yna',
    description: '',
  },
  yes: {
    id: 'app.poll.y',
    description: '',
  },
  no: {
    id: 'app.poll.n',
    description: '',
  },
  abstention: {
    id: 'app.poll.abstention',
    description: '',
  },
  startPollDesc: {
    id: 'app.poll.startPollDesc',
    description: '',
  },
  showRespDesc: {
    id: 'app.poll.showRespDesc',
    description: '',
  },
  addRespDesc: {
    id: 'app.poll.addRespDesc',
    description: '',
  },
  deleteRespDesc: {
    id: 'app.poll.deleteRespDesc',
    description: '',
  },
  questionsNumber: {
    id: 'app.game.questionsNumber',
    description: 'games number of questions',
  },
  totalTime: {
    id: 'app.game.totalTime',
    description: 'games total time',
  },
  difficultyLevel: {
    id: 'app.game.difficultyLevel',
    description: 'games Difficulty level',
  },
  beginnerLevel: {
    id: 'app.game.beginnerLevel',
    description: 'games level is beginner',
  },
  intermediateLevel: {
    id: 'app.game.intermediateLevel',
    description: 'games level is intermediate',
  },
  professionalLevel: {
    id: 'app.game.professionaLevel',
    description: 'games level is professional',
  },
  questions: {
    id: 'app.game.questions',
    description: 'game questions list',
  },
  Start: {
    id: 'app.game.start',
    description: 'start game automatically',
  },
  End: {
    id: 'app.game.end',
    description: 'end game',
  },
  QuestionDetails: {
    id: 'app.game.questionDetails',
    description: 'question details',
  },
  gameTimeUnit: {
    id: 'app.game.gameTimeUnit',
    description: 'question details',
  },
});

const POLL_SETTINGS = Meteor.settings.public.poll;

const MAX_CUSTOM_FIELDS = POLL_SETTINGS.maxCustom;
const MAX_INPUT_CHARS = POLL_SETTINGS.maxTypedAnswerLength;
const QUESTION_MAX_INPUT_CHARS = 400;

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPolling: false,
      question: '',
      optList: [],
      error: null,
      secretPoll: false,
    };

    this.handleBackClick = this.handleBackClick.bind(this);
    this.autoStart = this.autoStart.bind(this);
  }

  componentDidMount() {
    const { props } = this.hideBtn;
    const { className } = props;

    const hideBtn = document.getElementsByClassName(`${className}`);
    if (hideBtn[0]) hideBtn[0].focus();
  }

  componentDidUpdate() {
    const { amIPresenter, layoutContextDispatch } = this.props;

    if (Session.equals('resetGamePanel', true)) {
      this.handleBackClick();
    }

    if (!amIPresenter) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.NONE,
      });
    }
  }

  componentWillUnmount() {
    Session.set('secretPoll', false);
  }

  handleBackClick() {
    const { stopPoll } = this.props;
    this.setState({
      isPolling: false,
      error: null,
    }, () => {
      stopPoll();
      Session.set('resetGamePanel', false);
      document.activeElement.blur();
    });
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

  renderActivePollOptions() {
    const {
      intl,
      isMeteorConnected,
      stopPoll,
      currentPoll,
      currentMeeting,
      pollAnswerIds,
      usernames,
      isDefaultPoll,
      gamesList,
      currentUser,
    } = this.props;
    return (
      <div>
        <div className={styles.instructions}>
          {intl.formatMessage(intlMessages.activePollInstruction)}
        </div>
        <LiveResult
          {...{
            isMeteorConnected,
            stopPoll,
            currentPoll,
            currentMeeting,
            pollAnswerIds,
            usernames,
            isDefaultPoll,
            gamesList,
            currentUser,
          }}
          handleBackClick={this.handleBackClick}
        />
      </div>
    );
  }

  autoStart(game) {
    const questionsList = game["QuestionsList"];
    const { startPoll, stopPoll, startCustomPoll, intl, pollTypes, isDefaultPoll, checkPollType } = this.props;
    const {currentMeeting} = this.props;
    let prvGameScoreBoard = currentMeeting.gameScoreBoard;
    let prvPlayedQuestions = currentMeeting.playedQuestions;
    let playedQuestionsSplit = prvPlayedQuestions.split('|');
    let allPlayedQuestions = [];
    for (const [index2, gameQuestion] of questionsList.entries()) {
      for (const [index, value] of playedQuestionsSplit.entries()) {
        let valueSplit = value.split('*');
        if(valueSplit[0] == gameQuestion["QuestionGameID"])
          {
            allPlayedQuestions = valueSplit[1].split(',');
            break;
          }
      }
      let questionPlayed = false;
      for (const [index, value] of allPlayedQuestions.entries()) {
        if(value == gameQuestion["QuestionID"])
        {
          questionPlayed = true;
          break;
        }
      }
      if(!questionPlayed)
      {
        prvGameScoreBoard = currentMeeting.gameScoreBoard;
        prvPlayedQuestions = currentMeeting.playedQuestions;
        let gQuestionType = "";
        let questionOptList = [];
        if (gameQuestion["QuestionType"] == "Custom")
          gQuestionType = pollTypes.Custom
        else if (gameQuestion["QuestionType"] == "Response")
          gQuestionType = pollTypes.Response
        gameQuestion["QuestionOptions"].forEach((opt) => {
          questionOptList.push(opt);
        });

        const question = gameQuestion["QuestionTitle"];
        const optList = questionOptList;
        const type = gQuestionType;

        const defaultPoll = isDefaultPoll(type);
        let hasVal = false;
        optList.forEach((o) => {
          if (o && o != "") hasVal = true;
        });
        let err = null;
        if (type === pollTypes.Response && question.length === 0) err = intl.formatMessage(intlMessages.questionErr);
        if (!hasVal && type !== pollTypes.Response) err = intl.formatMessage(intlMessages.optionErr);
        if (err) return this.setState({ error: err });
        const verifiedPollType = checkPollType(
          type,
          optList,
          intl.formatMessage(intlMessages.yes),
          intl.formatMessage(intlMessages.no),
          intl.formatMessage(intlMessages.abstention),
          intl.formatMessage(intlMessages.true),
          intl.formatMessage(intlMessages.false)
        );
        const verifiedOptions = optList.map((o) => {
          if (o && o != "") return o;
          return null;
        });
        if(prvPlayedQuestions[prvPlayedQuestions.length - 1] == '|')
          prvGameScoreBoard = '';

        if (verifiedPollType === pollTypes.Custom) {
          startCustomPoll(
            gameQuestion["QuestionGameID"],
            gameQuestion["QuestionID"],
            gameQuestion["QuestionTime"],
            gameQuestion["QuestionAnswer"],
            gameQuestion["QuestionFile"],
            gameQuestion["QuestionFileMIME"],
            prvGameScoreBoard,
            prvPlayedQuestions,
            'true',
            verifiedPollType,
            question,
            _.compact(verifiedOptions),
          );
          this.setState({ isPolling: true });
          break;
        } else {
          startPoll(gameQuestion["QuestionGameID"], gameQuestion["QuestionID"], gameQuestion["QuestionTime"], gameQuestion["QuestionAnswer"], gameQuestion["QuestionFile"], gameQuestion["QuestionFileMIME"], prvGameScoreBoard, prvPlayedQuestions, 'true', verifiedPollType, question);
          this.setState({ isPolling: true });
          break;
        }

      }
    }
  }

  handleEndGame(gameID){
    Session.set('EndedGame', gameID);
    this.setState({
      EndedGameID: gameID
    });
  }

  renderQuestions(gameAllQuestions){
    let gameQuestions = [];
    const { startPoll, startCustomPoll, intl, pollTypes, isDefaultPoll, checkPollType, currentMeeting } = this.props;
    let prvGameScoreBoard = currentMeeting.gameScoreBoard;
    let prvPlayedQuestions = currentMeeting.playedQuestions;
    let playedQuestionsSplit = prvPlayedQuestions.split('|');
    let checkLable = null;
    let allPlayedQuestions = []
    for (const [index2, gameQuestion] of gameAllQuestions.entries()) {
      for (const [index, value] of playedQuestionsSplit.entries()) {
        let valueSplit = value.split('*');
        if(valueSplit[0] == gameQuestion["QuestionGameID"])
          {
            allPlayedQuestions = valueSplit[1].split(',');
            break;
          }
      }
      let questionPlayed = false;

      // const endedGameID = Session.get('EndedGame');
      const endedGameID = Session.get('EndedGame');
      const isOneGamePlaying = (endedGameID && endedGameID != '') || prvPlayedQuestions == '' || prvPlayedQuestions[prvPlayedQuestions.length - 1] == '|' ? false : true;
      questionPlayed = allPlayedQuestions.find(element => element === gameQuestion["QuestionID"]) ? true : false;
      // for (const [index, value] of allPlayedQuestions.entries()) {
      //   if(value == gameQuestion["QuestionID"])
      //   {
      //     questionPlayed = true;
      //     break;
      //   }
      // }
      if (!questionPlayed && isOneGamePlaying)
      {
        if (gameQuestion["QuestionGameID"] != playedQuestionsSplit[playedQuestionsSplit.length - 1].split('*')[0])
          questionPlayed = true;
      }

      let questionType = gameQuestion["QuestionType"];
      let questionOptions = gameQuestion["QuestionOptions"];
      let question = gameQuestion["QuestionTitle"];
      let questionID = gameQuestion["QuestionID"];
      let gQuestionTime = gameQuestion["QuestionTime"];
      let gameQuestionAnswer = gameQuestion["QuestionAnswer"];
      let gQuestionFile = gameQuestion["QuestionFile"];
      let gQuestionFileMIME = gameQuestion["QuestionFileMIME"];
      let gameID = gameQuestion["QuestionGameID"];
      let number = "#" + questionID;
      const liQKey = gameID + questionID;
      const liQKey1 = "1" + gameID + questionID;
      const liQKey2 = "2" + gameID + questionID;
      const liQKey3 = "3" + gameID + questionID;
      const liQKey4 = "4" + gameID + questionID;
      checkLable = !questionPlayed ? <i className="fa fa-close fa-2x" style={{color: '#dc3545'}} aria-hidden="true"></i> : checkLable = <i className="fa fa-check fa-2x" style={{color: 'blue'}} aria-hidden="true"></i> ;
      gameQuestions.push(
        <li className="list-group-item" key={liQKey}>
          <div className={"row " + styles.gameQuestionsRow} key={liQKey1}>
            <div className="col-3" style={{width: '20%'}} key={liQKey2}><strong>{number}</strong></div>
            <div className={"col-4 " + styles.gameQuestionsDetailDiv} key={liQKey3}>
              <button className="btn btn-sm btn-info"
                onClick={() => {
                  const { mountModal } = this.props;
                  return (mountModal(<QuestionModal gameQuestion={gameQuestion}/>));}}
                  > {intl.formatMessage(intlMessages.QuestionDetails)} </button>
            </div>
            <div className={"col-3 " + styles.GameQuestionsList} key={liQKey4}>
              <button className={cx("btn btn-sm btn-primary", { [styles.selectedBtnBlue]: questionType === pollTypes.TrueFalse })}
                disabled={questionPlayed}
                onClick={() => {
                  let type = null;
                  if(questionType == "Custom")
                    type = pollTypes.Custom;
                  else if(questionType == "Response")
                    type = pollTypes.Response;
                  let optList=[];
                  questionOptions.forEach((item) => {
                    optList.push(item);
                  });
                  let hasVal = false;
                  optList.forEach((o) => {
                    if (o || o != "") hasVal = true;
                  });

                  let err = null;
                  if (type === pollTypes.Response && question.length === 0) err = intl.formatMessage(intlMessages.questionErr);
                  if (!hasVal && type !== pollTypes.Response) err = intl.formatMessage(intlMessages.optionErr);
                  if (err) return this.setState({ error: err });

                  return this.setState({ isPolling: true }, () => {
                    const verifiedPollType = checkPollType(
                      type,
                      optList,
                      intl.formatMessage(intlMessages.yes),
                      intl.formatMessage(intlMessages.no),
                      intl.formatMessage(intlMessages.abstention),
                      intl.formatMessage(intlMessages.true),
                      intl.formatMessage(intlMessages.false)
                    );
                    const verifiedOptions = optList.map((o) => {
                      if (o || o != "")return o;
                      return null;
                    });
                    if(prvPlayedQuestions[prvPlayedQuestions.length - 1] == '|')
                      prvGameScoreBoard = '';
                    if (verifiedPollType === pollTypes.Custom) {

                      startCustomPoll(
                        gameID,
                        questionID,
                        gQuestionTime,
                        gameQuestionAnswer,
                        gQuestionFile,
                        gQuestionFileMIME,
                        prvGameScoreBoard,
                        prvPlayedQuestions,
                        'false',
                        verifiedPollType,
                        question,
                        _.compact(verifiedOptions),
                      );
                    } else {
                      startPoll(gameID, questionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, 'false', verifiedPollType, question);
                    }
                  });
                }}
                > {intl.formatMessage(intlMessages.Start)} </button></div>
              <div className="col-1">
              {checkLable}
            </div>
          </div>
        </li>
      );
    }
    return gameQuestions;
  }

  renderGames(){
    const {gamesList} = this.props;
    let allGames = [];

    const {
      type, optList, question, error,
    } = this.state;
    const { startPoll, startCustomPoll, intl, pollTypes, isDefaultPoll, checkPollType } = this.props;
    const {currentMeeting} = this.props;
    for (const [index, game] of gamesList.entries()) {
      let gameTitle = game["Title"];
      let gameQNumber = game["QuestionsNumber"];
      let gameTime = game["Time"] + ' ' + intl.formatMessage(intlMessages.gameTimeUnit);
      let gameDifficulty = game["Difficulty"];
      let gameAllQuestions =  game["QuestionsList"];
      let bgClass = "";
      let gameDifficultyText = "";
      if (gameDifficulty === "Beginner")
      {
        bgClass = " bg-success";
        gameDifficultyText = intl.formatMessage(intlMessages.beginnerLevel);
      }
      else if(gameDifficulty === "Professional")
      {
        bgClass = " bg-danger";
        gameDifficultyText = intl.formatMessage(intlMessages.professionalLevel);
      }
      else if(gameDifficulty === "Intermediate")
      {
        bgClass = " bg-warning"
        gameDifficultyText = intl.formatMessage(intlMessages.intermediateLevel);
      }

      const playedQuestions = currentMeeting.playedQuestions;
      const endedGameID = Session.get('EndedGame');
      const isOneGamePlaying = (endedGameID && endedGameID != '') || playedQuestions == '' || playedQuestions[playedQuestions.length - 1] == '|' ? false : true;
      const playedQuestionsSplit = playedQuestions.split("|");

      let gameFullyPlayed = false;
      if(isOneGamePlaying)
      {
        gameFullyPlayed = true;
        if (game["GameID"] == playedQuestionsSplit[playedQuestionsSplit.length - 1].split('*')[0])
          gameFullyPlayed = false;
      }
      else
      {
        for (const [index, value] of playedQuestionsSplit.entries()) {
          let valueSplit = value.split('*');
          if (valueSplit[0] == game["GameID"])
          {
            let plLen = valueSplit[1].split(",").length;
            if (valueSplit[1][valueSplit[1].length - 1] == ',')
              plLen--;
            gameFullyPlayed = gameQNumber == plLen ? true : false;
            break;
          }
        }
      }
      const color = !gameFullyPlayed && isOneGamePlaying ? "#d7f1fd" : "";
      let disableEnd = false;
      if (color != '')
        disableEnd = true;
      const k1 = game["GameID"];
      const k2 = "111" + k1;
      const k3 = "222" + k1;
      const k4 = "333" + k1;
      const k5 = "444" + k1;
      const k6 = "555" + k1;
      const k7 = "666" + k1;
      const k8 = "777" + k1;
      allGames.push(
        <div className="card text-center" style={{marginBottom: '5%'}} key={k1}>
          <strong className="card-header fs-5 text-muted" style={{backgroundColor: color}}> {gameTitle} </strong>
          <table className="card-body">
            <tbody>
              <tr key={k2}>
                <td className="bg-light text-wrap fs-6 align-baseline"><strong> {intl.formatMessage(intlMessages.questionsNumber)} </strong></td>
                <td className="badge text-wrap fs-6 align-top text-dark">{gameQNumber}</td>
              </tr>
              <tr key={k3}>
                <td className="bg-light text-wrap fs-6 align-baseline"><strong> {intl.formatMessage(intlMessages.totalTime)} </strong></td>
                <td className="badge text-wrap fs-6 align-top text-dark">{gameTime}</td>
              </tr>
              <tr style={{borderBottom: '1px solid rgba(0,0,0,.125)'}} key={k4}>
                <td className="bg-light text-wrap fs-6 align-baseline"><strong> {intl.formatMessage(intlMessages.difficultyLevel)} </strong></td>
                <td className={"badge text-wrap fs-6 align-top" + bgClass}>{gameDifficultyText}</td>
              </tr>
            </tbody>
          </table>
          <div className="accordion accordion-flush" id="accordionFlushExample"  key={k5}>
            <div className="accordion-item" key={k6}>
              <h2 className="accordion-header" id="flush-headingOne">
                <button className="accordion-button collapsed" style={{backgroundColor: 'rgba(0,0,0,.03)'}} type="button" data-bs-toggle="collapse" data-bs-target={"#flush-collapseOne" + game["GameID"]} aria-expanded="false" aria-controls={"flush-collapseOne" + game["GameID"]}>
                  {intl.formatMessage(intlMessages.questions)}
                </button>
              </h2>
              <div id={"flush-collapseOne" + game["GameID"]} className="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample" key={k7}>
                <div className="accordion-body">
                  <ul className="list-group list-group-flush" style={{direction: "ltr"}}>
                    {this.renderQuestions(gameAllQuestions)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer" key={k8}>
            <div className={"row " + styles.GameButtonsRow}>
              <Button
                label={intl.formatMessage(intlMessages.Start)}
                color="default"
                disabled={gameFullyPlayed}
                className={cx(styles.pBtn, styles.btnMR, "col-5")}
                onClick={() => this.autoStart(game)}
              />
              <Button
                  label={intl.formatMessage(intlMessages.End)}
                  color="default"
                  disabled={!disableEnd}
                  className={cx(styles.pBtn, styles.btnMR, "col-5")}
                  onClick={() => this.handleEndGame(game["GameID"])}
                />
            </div>
          </div>
        </div>
      );
    }
    return allGames;
  }

  renderPollOptions() {
    const {
      type, optList, question, error,
    } = this.state;
    const {
      startPoll,
      startCustomPoll,
      intl,
      pollTypes,
      isDefaultPoll,
      checkPollType,
      smallSidebar,
    } = this.props;
    const defaultPoll = isDefaultPoll(type);
    const k1 = "gamePanelDesc00";
    const k2 = "gamePanelDesc111";
    return (
      <div key={k1}>
        <div className={styles.instructions} key={k2}>
          {intl.formatMessage(intlMessages.gamePanelDesc)}
        </div>
        <hr/>

        {this.renderGames()}

      </div>
    );
  }

  renderNoSlidePanel() {
    const { intl } = this.props;
    return (
      <div className={styles.noSlidePanelContainer}>
        <h4 className={styles.sectionHeading}>{intl.formatMessage(intlMessages.noPresentationSelected)}</h4>
        <Button
          label={intl.formatMessage(intlMessages.clickHereToSelect)}
          color="primary"
          onClick={() => Session.set('showUploadPresentationView', true)}
          className={styles.pollBtn}
        />
      </div>
    );
  }

  renderPollPanel() {
    const { isPolling } = this.state;
    const {
      currentPoll,
      currentSlide,
    } = this.props;

    if (!currentSlide) return this.renderNoSlidePanel();

    if (isPolling || currentPoll) {
      return this.renderActivePollOptions();
    }

    return this.renderPollOptions();
  }


  render() {
    const {
      intl,
      stopPoll,
      currentPoll,
      layoutContextDispatch,
    } = this.props;

    return (
      <div>
        <header className={styles.header}>
          <Button
            ref={(node) => { this.hideBtn = node; }}
            data-test="hideGameDesc"
            tabIndex={0}
            label={intl.formatMessage(intlMessages.gamePaneTitle)}
            icon="left_arrow"
            aria-label={intl.formatMessage(intlMessages.hideGameDesc)}
            className={styles.hideBtn}
            onClick={() => {
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
            }}
          />
          <Button
            label={intl.formatMessage(intlMessages.closeLabel)}
            aria-label={`${intl.formatMessage(intlMessages.closeLabel)} ${intl.formatMessage(intlMessages.gamePaneTitle)}`}
            onClick={() => {
              if (currentPoll) stopPoll();
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                value: false,
              });
              layoutContextDispatch({
                type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                value: PANELS.NONE,
              });
              Session.set('forceGameOpen', false);
              Session.set('gameInitiated', false);
            }}
            className={styles.closeBtn}
            icon="close"
            size="sm"
            hideLabel
          />
        </header>
        {this.renderPollPanel()}
        <span className="sr-only" id="poll-config-button">{intl.formatMessage(intlMessages.showRespDesc)}</span>
        <span className="sr-only" id="add-item-button">{intl.formatMessage(intlMessages.addRespDesc)}</span>
        <span className="sr-only" id="start-poll-button">{intl.formatMessage(intlMessages.startPollDesc)}</span>
      </div>
    );
  }
}

export default withModalMounter(injectIntl(Poll));

Poll.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  amIPresenter: PropTypes.bool.isRequired,
  pollTypes: PropTypes.instanceOf(Object).isRequired,
  startPoll: PropTypes.func.isRequired,
  startCustomPoll: PropTypes.func.isRequired,
  stopPoll: PropTypes.func.isRequired,
};
