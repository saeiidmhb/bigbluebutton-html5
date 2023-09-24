import React, { Component, useState, useEffect } from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';

import Auth from '/imports/ui/services/auth';

import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid } from '../service';

import { styles } from './styles';

const intlMessages = defineMessages({
  questionText: {
    id: 'app.game.modal.questionText',
    description: 'Question Text',
  },
  questionNumber: {
    id: 'app.game.modal.questionNumber',
    description: 'Question Number',
  },
  questionTime: {
    id: 'app.game.modal.questionTime',
    description: 'Question Time',
  },
  questionTimeUnit: {
    id: 'app.game.modal.questionTimeUnit',
    description: 'Question Time Unit',
  },
  writtenResponse: {
    id: 'app.game.modal.writtenResponse',
    description: 'Written Response',
  },
  choicesResponse: {
    id: 'app.game.modal.choicesResponse',
    description: 'Choices Response',
  },
  title: {
    id: 'app.externalVideo.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.externalVideo.close',
    description: 'Close',
  },
});



class QuestionModal extends Component {
  constructor(props) {
    super(props);

  }

  render() {
    const { intl, closeModal } = this.props;
    const {gameQuestion} = this.props;
    const questionID = gameQuestion["QuestionID"];
    const gameTitle = gameQuestion["GameTitle"];
    const questionTitle = gameQuestion["QuestionTitle"];
    const questionOptions = gameQuestion["QuestionOptions"];
    const questionAnswer = gameQuestion["QuestionAnswer"];
    const questionTime = gameQuestion["QuestionTime"];
    const questionFile = gameQuestion["QuestionFile"];
    const questionFileMIME = gameQuestion["QuestionFileMIME"];
    let optionsList = [];
    for (const [index, option] of questionOptions.entries()) {
      if(option == questionAnswer)
      {
        optionsList.push(
          <div className="col-6 bg-light">
            <span><i className={"fa fa-check-circle " + styles.choices} aria-hidden="true" style={{color: '#039a00'}}></i>{option}</span>
          </div>
        );
      }
      else{
        optionsList.push(
          <div className="col-6">
            <span><i className={"fa fa-check-circle " + styles.choices} aria-hidden="true"></i>{option}</span>
          </div>
        );
      }
    }
    let resText = "";
    if(optionsList.length == 0)
    {
      optionsList.push(<div>{questionAnswer}</div>);
      resText = intl.formatMessage(intlMessages.writtenResponse);
    }
    else
      resText = intl.formatMessage(intlMessages.choicesResponse);

    let questionFileHtml = null;
    if (questionFile != '')
    {
      if (questionFileMIME == '')
      {
        questionFileHtml = <img style={{width: "300px"}} src={questionFile} className="rounded mx-auto d-block" alt="game image"></img>;
      }
      else if (questionFileMIME.includes("video"))
      {
        questionFileHtml = <video style={{width: "300px"}} className="rounded mx-auto d-block" width="400" controls><source src={questionFile} type={questionFileMIME}></source>Your browser does not support HTML video.</video>;
      }
      else if (questionFileMIME.includes("audio"))
      {
        questionFileHtml = <audio controls><source src={questionFile} type={questionFileMIME}></source>Your browser does not support the audio element.</audio>;
      }
    }
    let floatText = intl.formatMessage(intlMessages.questionText) == "Question" ? 'left': 'right';
    const qTimeText = questionTime + ' ' + intl.formatMessage(intlMessages.questionTimeUnit);
    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        contentLabel={intl.formatMessage(intlMessages.title)}
        title={gameTitle}
      >
        <br/>
        <div className={styles.content}>
          <h4>{intl.formatMessage(intlMessages.questionText)}</h4>
          <div style={{fontSize: 'medium'}}>
            <p> {questionTitle} </p>
            <div style={{float: floatText}}> {questionFileHtml} </div>
          </div>
          <br></br>
          <div className="row" style={{width: 'inherit'}}>
            <div className="col-5">
              <h4>{intl.formatMessage(intlMessages.questionNumber)}</h4>
              <div style={{fontSize: 'medium'}}>
                <p> {questionID} </p>
              </div>
            </div>
            <div className="col-5">
              <h4>{intl.formatMessage(intlMessages.questionTime)}</h4>
              <div style={{fontSize: 'medium'}}>
                <p> {qTimeText} </p>
              </div>
            </div>
          </div>
          <br></br>
          <h4>{resText}</h4>
          <div className="row" style={{fontSize: 'medium', width: '100%'}}>
            {optionsList}
          </div>
        </div>
      </Modal>

    );
  }
}

export default injectIntl(withModalMounter(QuestionModal));
