import React, { useContext } from 'react';
import { makeCall } from '/imports/ui/services/api';
import { withTracker } from 'meteor/react-meteor-data';
import Presentations from '/imports/api/presentations';
import PresentationService from '/imports/ui/components/presentation/service';
import Poll from '/imports/ui/components/poll/component';
import { Session } from 'meteor/session';
import Service from './service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '../components-data/users-context/context';
import LayoutContext from '../layout/context';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const PollContainer = ({ ...props }) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch } = layoutContext;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;

  const usernames = {};

  Object.values(users[Auth.meetingID]).forEach((user) => {
    usernames[user.userId] = { userId: user.userId, name: user.name };
  });

  return <Poll {...{ layoutContextDispatch, ...props }} usernames={usernames} />;
};

export default withTracker(() => {
  const isPollSecret = Session.get('secretPoll') || false;
  Meteor.subscribe('current-poll', isPollSecret);

  const currentPresentation = Presentations.findOne({
    current: true,
  }, { fields: { podId: 1 } }) || {};

  const currentSlide = PresentationService.getCurrentSlide(currentPresentation.podId);

  const pollId = currentSlide ? currentSlide.id : PUBLIC_CHAT_KEY;

  const { pollTypes } = Service;

  const isGame = "false";

  const currentMeeting = Service.currentMeeting();

  const startPoll = (type, secretPoll, question = '', gameID = '', gameQuestionID = '', gQuestionTime = '', gameQuestionAnswer = '', gQuestionFile = '', gQuestionFileMIME = '', prvGameScoreBoard = currentMeeting.gameScoreBoard, prvPlayedQuestions = currentMeeting.playedQuestions, prvIsAutoPlay='poll') => makeCall('startPoll', pollTypes, type, isGame, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, pollId, secretPoll, question);

  const startCustomPoll = (type, secretPoll, question = '', answers, gameID = '', gameQuestionID = '', gQuestionTime = '', gameQuestionAnswer = '', gQuestionFile = '', gQuestionFileMIME = '',  prvGameScoreBoard = currentMeeting.gameScoreBoard, prvPlayedQuestions = currentMeeting.playedQuestions, prvIsAutoPlay='poll') => makeCall('startPoll', pollTypes, type, isGame, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, pollId, secretPoll, question, answers);

  const stopPoll = () => makeCall('stopPoll');
  let currentPoll = Service.currentPoll();
  
  return {
    currentSlide,
    amIPresenter: Service.amIPresenter(),
    pollTypes,
    startPoll,
    startCustomPoll,
    stopPoll,
    publishPoll: Service.publishPoll,
    currentPoll: currentPoll,
    currentMeeting: currentMeeting,
    isDefaultPoll: Service.isDefaultPoll,
    checkPollType: Service.checkPollType,
    resetPollPanel: Session.get('resetPollPanel') || false,
    pollAnswerIds: Service.pollAnswerIds,
    isMeteorConnected: Meteor.status().connected,
  };
})(PollContainer);
