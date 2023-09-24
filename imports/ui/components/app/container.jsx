import React, { useContext, useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import CaptionsContainer from '/imports/ui/components/captions/container';
import CaptionsService from '/imports/ui/components/captions/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import UserInfos from '/imports/api/users-infos';
import LayoutContext from '../layout/context';
import Settings from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import _ from 'lodash';

import {
  getFontSize,
  getBreakoutRooms,
  validIOSVersion,
  getCurrentPoll,
} from './service';

import { withModalMounter, getModal } from '../modal/service';
import { UsersContext } from '../components-data/users-context/context';

import App from './component';
import ActionsBarContainer from '../actions-bar/container';
import NavBarContainer from '../nav-bar/container';

const CUSTOM_STYLE_URL = Meteor.settings.public.app.customStyleUrl;

import GameTService from '/imports/ui/components/gameT/service';
import { makeCall } from '/imports/ui/services/api';
import Presentations from '/imports/api/presentations';
import PresentationAreaService from '/imports/ui/components/presentation/service';
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const propTypes = {
  actionsbar: PropTypes.node,
  meetingLayout: PropTypes.string.isRequired,
};

const defaultProps = {
  actionsbar: <ActionsBarContainer />,
};

const intlMessages = defineMessages({
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
});

const endMeeting = (code) => {
  Session.set('codeError', code);
  Session.set('isMeetingEnded', true);
};

const AppContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const {
    meetingLayout,
    selectedLayout,
    settingsLayout,
    pushLayoutToEveryone,
    currentUserId,
    currentUserRole,
    serverUrl,
    projectID,
    success,
    meetingTitleText,
    institutionWelcomeMessage,
    currentPoll,
    currentMeeting,
    gameScoreBoard,
    pollTypes,
    startCustomPoll,
    startPoll,
    shouldShowPresentation: propsShouldShowPresentation,
    presentationRestoreOnUpdate,
    isPresenter,
    randomlySelectedUser,
    isModalOpen,
    ...otherProps
  } = props;
  const {
    input,
    output,
    layoutType,
    deviceType,
  } = layoutContextState;
  const { sidebarContent, sidebarNavigation, presentation } = input;
  const { actionBar: actionsBarStyle, captions: captionsStyle } = output;
  const { sidebarNavPanel } = sidebarNavigation;
  const { sidebarContentPanel } = sidebarContent;
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;
  const presentationIsOpen = presentation.isOpen;
  const shouldShowPresentation = propsShouldShowPresentation
    && (presentationIsOpen || presentationRestoreOnUpdate);

  const prevRandomUser = usePrevious(randomlySelectedUser);

  const mountRandomUserModal = !isPresenter
  && !_.isEqual( prevRandomUser, randomlySelectedUser)
  && randomlySelectedUser.length > 0
  && !isModalOpen;
  let actionsbar = (<ActionsBarContainer serverUrl={serverUrl} projectID={projectID} success={success}/>);
  let navbar = <NavBarContainer meetingTitleText={meetingTitleText}/> ;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const usernames = {};
  const isDefaultPoll = GameTService.isDefaultPoll;
  const checkPollType = GameTService.checkPollType;
  Object.values(users[Auth.meetingID]).forEach((user) => {
    usernames[user.userId] = { userId: user.userId, name: user.name };
  });

  return currentUserId
    ? (
      <App
        {...{
          navbar,
          actionsbar,
          actionsBarStyle,
          captionsStyle,
          currentUserId,
          serverUrl,
          projectID,
          success,
          institutionWelcomeMessage,
          currentPoll,
          gameScoreBoard,
          usernames,
          currentMeeting,
          pollTypes,
          isDefaultPoll,
          checkPollType,
          startCustomPoll,
          startPoll,
          layoutType,
          meetingLayout,
          selectedLayout,
          settingsLayout,
          pushLayoutToEveryone,
          deviceType,
          layoutContextDispatch,
          sidebarNavPanel,
          sidebarNavigationIsOpen,
          sidebarContentPanel,
          sidebarContentIsOpen,
          shouldShowPresentation,
          mountRandomUserModal,
          isPresenter,
          currentUserRole,
        }}
        {...otherProps}
      />
    )
    : null;
};

const currentUserEmoji = (currentUser) => (currentUser
  ? {
    status: currentUser.emoji,
    changedAt: currentUser.emojiTime,
  }
  : {
    status: 'none',
    changedAt: null,
  }
);

export default injectIntl(withModalMounter(withTracker(({ intl, baseControls }) => {
  const authTokenValidation = AuthTokenValidation.findOne({}, { sort: { updatedAt: -1 } });

  if (authTokenValidation.connectionId !== Meteor.connection._lastSessionId) {
    endMeeting('403');
  }

  Users.find({ userId: Auth.userID, meetingId: Auth.meetingID }).observe({
    removed() {
      endMeeting('403');
    },
  });

  const currentUser = Users.findOne(
    { userId: Auth.userID },
    {
      fields:
      {
        approved: 1, emoji: 1, userId: 1, presenter: 1, role: 1
      },
    },
  );
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    {
      fields: {
        gameScoreBoard: 1,
        playedQuestions: 1,
        isAutoPlay: 1,
        publishedPoll: 1,
        voiceProp: 1,
        randomlySelectedUser: 1,
        layout: 1,
      },
    });

  const {
    publishedPoll,
    gameScoreBoard,
    playedQuestions,
    isAutoPlay,
    voiceProp,
    randomlySelectedUser,
    layout,
  } = currentMeeting;
  const currentPoll = getCurrentPoll();

  if (currentUser && !currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();
  // Meteor.subscribe('current-poll');

  const currentPresentation = Presentations.findOne({
    current: true,
  }, { fields: { podId: 1 } }) || {};

  const AppSettings = Settings.application;
  const { selectedLayout } = AppSettings;
  const { viewScreenshare } = Settings.dataSaving;
  const shouldShowExternalVideo = MediaService.shouldShowExternalVideo();
  const shouldShowScreenshare = MediaService.shouldShowScreenshare()
    && (viewScreenshare || MediaService.isUserPresenter());
  let customStyleUrl = getFromUserSettings('bbb_custom_style_url', false);

  if (!customStyleUrl && CUSTOM_STYLE_URL) {
    customStyleUrl = CUSTOM_STYLE_URL;
  }

  const LAYOUT_CONFIG = Meteor.settings.public.layout;

  const currentSlide = PresentationAreaService.getCurrentSlide(currentPresentation.podId);

  const pollId = currentSlide ? currentSlide.id : PUBLIC_CHAT_KEY;

  const pollTypes = GameTService.pollTypes;

  const isGame = "true";
  const startPoll = ( gameID = '', gameQuestionID = '', gQuestionTime = '', gameQuestionAnswer = '', gQuestionFile = '', gQuestionFileMIME = '', prvGameScoreBoard = '', prvPlayedQuestions = '', prvIsAutoPlay = 'false', type, question = '') => {
    makeCall('startPoll', pollTypes, type, isGame, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, pollId, false, question);
  };

  const startCustomPoll = (gameID = '', gameQuestionID = '', gQuestionTime = '', gameQuestionAnswer = '', gQuestionFile = '', gQuestionFileMIME = '', prvGameScoreBoard = '', prvPlayedQuestions = '', prvIsAutoPlay = '', type, question = '', answers) => {
    makeCall('startPoll', pollTypes, type, isGame, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, pollId, false, question, answers);
  };

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl,
    UserInfo,
    notify,
    validIOSVersion,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    meetingMuted: voiceProp.muteOnStart,
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedPoll: publishedPoll,
    currentPoll: currentPoll,
    gameScoreBoard: gameScoreBoard,
    playedQuestions: playedQuestions,
    isAutoPlay: isAutoPlay,
    randomlySelectedUser,
    currentUserRole: currentUser?.role,
    currentUserId: currentUser?.userId,
    isPresenter: currentUser?.presenter,
    meetingLayout: layout,
    selectedLayout,
    settingsLayout: selectedLayout?.replace('Push', ''),
    pushLayoutToEveryone: selectedLayout?.includes('Push'),
    audioAlertEnabled: AppSettings.chatAudioAlerts,
    pushAlertEnabled: AppSettings.chatPushAlerts,
    shouldShowScreenshare,
    shouldShowPresentation: !shouldShowScreenshare && !shouldShowExternalVideo,
    shouldShowExternalVideo,
    isLargeFont: Session.get('isLargeFont'),
    presentationRestoreOnUpdate: getFromUserSettings(
      'bbb_force_restore_presentation_on_new_events',
      Meteor.settings.public.presentation.restoreOnUpdate,
    ),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
    hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
    isModalOpen: !!getModal(),
    currentMeeting: currentMeeting,
    pollTypes,
    startPoll,
    startCustomPoll,
  };
})(AppContainer)));

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
