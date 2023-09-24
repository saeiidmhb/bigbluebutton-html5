import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/components/button/component';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { Meteor } from 'meteor/meteor';
import { styles } from './styles.scss';
import AudioService from '/imports/ui/components/audio/service';

// import Reward from 'react-rewards';
import confetti from "canvas-confetti";
import Countdown from "react-countdown";
import { makeCall } from '/imports/ui/services/api';

const MAX_INPUT_CHARS = Meteor.settings.public.poll.maxTypedAnswerLength;

const intlMessages = defineMessages({
  pollingTitleLabel: {
    id: 'app.polling.pollingTitle',
  },
  pollAnswerLabel: {
    id: 'app.polling.pollAnswerLabel',
  },
  pollAnswerDesc: {
    id: 'app.polling.pollAnswerDesc',
  },
  gameQuestionTitle: {
    id: 'app.game.gameQuestionTitle',
  },
  submitLabel: {
    id: 'app.polling.submitLabel',
  },
  submitAriaLabel: {
    id: 'app.polling.submitAriaLabel',
  },
  responsePlaceholder: {
    id: 'app.polling.responsePlaceholder',
  },
  questionTimesUp: {
    id: 'app.game.questionTimesUp',
    description: 'question times up prompt',
  },
});

const validateInput = (i) => {
  let _input = i;
  if (/^\s/.test(_input)) _input = '';
  return _input;
};

class Polling extends Component {
  constructor(props) {
    super(props);

    this.state = {
      typedAns: '',
      answerButtonsDisabled: false,
    };

    this.play("poll");
    this.play = this.play.bind(this);
    this.timeComplete = this.timeComplete.bind(this);
    this.handleUpdateResponseInput = this.handleUpdateResponseInput.bind(this);
    this.handleMessageKeyDown = this.handleMessageKeyDown.bind(this);
  }

  componentDidMount() {
    this.play("poll");
  }

  play(type) {
    if (type == "poll")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/Poll.mp3');
    else if (type == "right")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/small-success.mp3');
    else if (type == "wrong")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/wrong-answer.mp3');
    else if ("lastSeconds")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/race-countdown-beeps.mp3');
  }

  handleUpdateResponseInput(e) {
    this.responseInput.value = validateInput(e.target.value);
    this.setState({ typedAns: this.responseInput.value });
  }

  handleMessageKeyDown(e, qAnswer) {
    const {
      poll,
      handleTypedVote,
    } = this.props;

    const {
      typedAns,
    } = this.state;

    if (e.keyCode === 13 && typedAns.length > 0) {
      handleTypedVote(poll.pollId, typedAns, '');
      this.setState({
        answerButtonsDisabled: true,
      });
      if(typedAns === qAnswer){
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6, x: 0.8 }
        });
        this.play("right");
      }
      else
        this.play("wrong");
    }
  }
  timeComplete() {
    // this.play("wrong");
    this.setState({
      answerButtonsDisabled: true,
    });
  }
  render() {
    const {
      isMeteorConnected,
      intl,
      poll,
      handleVote,
      handleTypedVote,
      pollAnswerIds,
      pollTypes,
      isDefaultPoll,
      currentUser,
    } = this.props;

    const {
      typedAns,
      answerButtonsDisabled,
    } = this.state;
    if (!poll) return null;
    const { stackOptions, answers, question, pollType, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME } = poll;

    let {gQuestionTime} = poll;
    gQuestionTime = parseInt(gQuestionTime);
    const defaultPoll = isDefaultPoll(pollType);
    const qAnswer = gameQuestionAnswer;
    const qStartTime = new Date(poll.gStartTime);
    console.log("qStartTime")
    console.log(qStartTime)
    const pollAnswerStyles = {
      [styles.pollingAnswers]: true,
      [styles.removeColumns]: answers.length === 1,
      [styles.stacked]: stackOptions,
    };
    // Random component
    const Completionist = () => <span className="rounded" style={{backgroundColor: "red", color: "white", fontSize: "x-large"}}>{intl.formatMessage(intlMessages.questionTimesUp)}</span>;

    // Renderer callback with condition
    const renderer = ({ hours, minutes, seconds, completed }) => {
      if (completed) {
        // Render a complete state
        return <Completionist />;
      } else {
        // Render a countdown
        if (minutes === 0 && seconds === 4)
          this.play("lastSeconds");
        if (minutes === 0)
          seconds = seconds - 1;
        return (
          <span className="rounded" style={{backgroundColor: "#61b1be", color: "white", fontSize: "x-large"}}>
            {minutes}:{seconds}
          </span>
        );
      }
    };

    const serverTimeDif = currentUser.serverTimeDif;
    var nt = Date.now();
    nt += serverTimeDif;
    nt = new Date(nt);
    const elapsedTime = nt - qStartTime;
    let questionFile = null;
    if (gQuestionFile != '')
    {
      if (gQuestionFileMIME == '')
      {
        questionFile = <img style={{width: "300px"}} src={gQuestionFile} className="rounded mx-auto d-block" alt="game image"></img>;
      }
      else if (gQuestionFileMIME.includes("video"))
      {
        questionFile = <video style={{width: "300px"}} className="rounded mx-auto d-block" width="400" controls><source src={gQuestionFile} type={gQuestionFileMIME}></source>Your browser does not support HTML video.</video>;
      }
      else if (gQuestionFileMIME.includes("audio"))
      {
        questionFile = <audio controls><source src={gQuestionFile} type={gQuestionFileMIME}></source>Your browser does not support the audio element.</audio>;
      }
    }

    if (serverTimeDif) {
      return (
        <div className={styles.overlay}>
        <div
          data-test="pollingContainer"
          className={cx({
            [styles.pollingContainer]: true,
            [styles.autoWidth]: stackOptions,
          })}
          role="alert"
        >
          {
            question.length > 0 && (
              <>
              <div className="row text-center">
                <Countdown date={Date.now() + gQuestionTime*1000 - (elapsedTime)} renderer={renderer} onComplete={this.timeComplete}/>
              </div>
              <span className={styles.qHeader}>
                <div className={styles.qTitle}>
                  {intl.formatMessage(intlMessages.gameQuestionTitle)}
                </div>
                <div data-test="pollQuestion53" className={styles.qText}>{question}</div>
                <div>
                  {questionFile}
                </div>
              </span>
              </>
            )
          }
          {
            poll.pollType !== pollTypes.Response && (
              <span>
                {
                  question.length === 0
                  && (
                    <div className={styles.pollingTitle}>
                      {intl.formatMessage(intlMessages.pollingTitleLabel)}
                    </div>
                  )
                }
                <div className={cx(pollAnswerStyles)}>
                  {poll.answers.map((pollAnswer, index) => {
                    const formattedMessageIndex = pollAnswer.key.toLowerCase();
                    let label = pollAnswer.key;
                    if (defaultPoll && pollAnswerIds[formattedMessageIndex]) {
                      label = intl.formatMessage(pollAnswerIds[formattedMessageIndex]);
                    }

                    return (
                      <div
                        key={pollAnswer.id}
                        className={styles.pollButtonWrapper}
                      >
                        <Button
                          disabled={!isMeteorConnected || answerButtonsDisabled}
                          className={styles.pollingButton}
                          color="primary"
                          size="md"
                          label={label}
                          key={pollAnswer.key}
                          onClick={() => {
                            handleVote(poll.pollId, pollAnswer, '');
                            this.setState({
                              answerButtonsDisabled: true,
                            });
                            if(label === qAnswer){
                              confetti({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6, x: 0.8 }
                              });
                              this.play("right");
                            }
                            else
                              this.play("wrong");
                            }
                          }
                          aria-labelledby={`pollAnswerLabel${pollAnswer.key}`}
                          aria-describedby={`pollAnswerDesc${pollAnswer.key}`}
                          data-test="pollAnswerOption"
                        />
                        <div
                          className={styles.hidden}
                          id={`pollAnswerLabel${pollAnswer.key}`}
                        >
                          {intl.formatMessage(intlMessages.pollAnswerLabel, { 0: label })}
                        </div>
                        <div
                          className={styles.hidden}
                          id={`pollAnswerDesc${pollAnswer.key}`}
                        >
                          {intl.formatMessage(intlMessages.pollAnswerDesc, { 0: label })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </span>
            )
          }
          {
            poll.pollType === pollTypes.Response
            && (
              <div className={styles.typedResponseWrapper}>
                <input
                  data-test="pollAnswerOption"
                  onChange={(e) => {
                    this.handleUpdateResponseInput(e);
                  }}
                  onKeyDown={(e) => {
                    this.handleMessageKeyDown(e, qAnswer);
                  }}
                  type="text"
                  className={styles.typedResponseInput}
                  placeholder={intl.formatMessage(intlMessages.responsePlaceholder)}
                  maxLength={MAX_INPUT_CHARS}
                  ref={(r) => { this.responseInput = r; }}
                />
                  <Button
                    data-test="submitAnswer"
                    className={styles.submitVoteBtn}
                    disabled={typedAns.length === 0 || answerButtonsDisabled}
                    color="primary"
                    size="sm"
                    label={intl.formatMessage(intlMessages.submitLabel)}
                    aria-label={intl.formatMessage(intlMessages.submitAriaLabel)}
                    onClick={() => {
                      handleTypedVote(poll.pollId, typedAns, '');
                      this.setState({
                        answerButtonsDisabled: true,
                      });
                      if(typedAns === qAnswer){
                        confetti({
                          particleCount: 100,
                          spread: 70,
                          origin: { y: 0.6, x: 0.8 }
                        });
                        this.play("right");
                      }
                      else
                        this.play("wrong");
                    }}
                  />
              </div>
            )
          }
        </div>
      </div>
      );
    } else {
      return null;
    }
  }
}

export default injectIntl(injectWbResizeEvent(Polling));

Polling.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  handleVote: PropTypes.func.isRequired,
  handleTypedVote: PropTypes.func.isRequired,
  poll: PropTypes.shape({
    pollId: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      key: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  }).isRequired,
};
