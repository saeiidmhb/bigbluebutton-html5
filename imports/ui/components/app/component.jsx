import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { defineMessages, injectIntl } from 'react-intl';
import Modal from 'react-modal';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import PollingContainer from '/imports/ui/components/polling/container';
import GameContainer from '/imports/ui/components/gameS/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import UserInfoContainer from '/imports/ui/components/user-info/container';
import BreakoutRoomInvitation from '/imports/ui/components/breakout-room/invitation/container';
import { Meteor } from 'meteor/meteor';
import ToastContainer from '../toast/container';
import ModalContainer from '../modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatAlertContainer from '../chat/alert/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import WaitingNotifierContainer from '/imports/ui/components/waiting-users/alert/container';
import LockNotifier from '/imports/ui/components/lock-viewers/notify/container';
import StatusNotifier from '/imports/ui/components/status-notifier/container';
import MediaService from '/imports/ui/components/media/service';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import UploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import RandomUserSelectContainer from '/imports/ui/components/modal/random-user/container';
import NewWebcamContainer from '../webcam/container';
import PresentationAreaContainer from '../presentation/presentation-area/container';
import ScreenshareContainer from '../screenshare/container';
import ExternalVideoContainer from '../external-video-player/container';
import { styles } from './styles';
import {
  LAYOUT_TYPE, DEVICE_TYPE, ACTIONS, PANELS,
} from '../layout/enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from '../layout/utils';
import CustomLayout from '../layout/layout-manager/customLayout';
import SmartLayout from '../layout/layout-manager/smartLayout';
import PresentationFocusLayout from '../layout/layout-manager/presentationFocusLayout';
import VideoFocusLayout from '../layout/layout-manager/videoFocusLayout';
import NavBarContainer from '../nav-bar/container';
import SidebarNavigationContainer from '../sidebar-navigation/container';
import SidebarContentContainer from '../sidebar-content/container';
import { makeCall } from '/imports/ui/services/api';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import { NAVBAR_HEIGHT, LARGE_NAVBAR_HEIGHT } from '/imports/ui/components/layout/defaultValues';
import Settings from '/imports/ui/services/settings';
import LayoutService from '/imports/ui/components/layout/service';
import { registerTitleView } from '/imports/utils/dom-utils';

import ActionsBarContainer from '../actions-bar/container';

import confetti from "canvas-confetti";
import Typist from "react-typist";
import Service from '/imports/ui/components/gameT/service';
import _ from 'lodash';
import AudioService from '/imports/ui/components/audio/service';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = Meteor.settings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const OVERRIDE_LOCALE = APP_CONFIG.defaultSettings.application.overrideLocale;

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
  clearedEmoji: {
    id: 'app.toast.clearedEmoji.label',
    description: 'message for cleared emoji status',
  },
  setEmoji: {
    id: 'app.toast.setEmoji.label',
    description: 'message when a user emoji has been set',
  },
  raisedHand: {
    id: 'app.toast.setEmoji.raiseHand',
    description: 'toast message for raised hand notification',
  },
  loweredHand: {
    id: 'app.toast.setEmoji.lowerHand',
    description: 'toast message for lowered hand notification',
  },
  meetingMuteOn: {
    id: 'app.toast.meetingMuteOn.label',
    description: 'message used when meeting has been muted',
  },
  meetingMuteOff: {
    id: 'app.toast.meetingMuteOff.label',
    description: 'message used when meeting has been unmuted',
  },
  pollPublishedLabel: {
    id: 'app.whiteboard.annotations.poll',
    description: 'message displayed when a poll is published',
  },
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name apended to document title',
  },
  questionErr: {
    id: 'app.poll.questionErr',
    description: 'question text area error label',
  },
  optionErr: {
    id: 'app.poll.optionErr',
    description: 'poll input error label',
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
  lastQuestionWinners: {
    id: 'app.game.lastQuestionWinners',
    description: 'Last question winners',
  },
  lastQuestionNoWinner: {
    id: 'app.game.lastQuestionNoWinner',
    description: 'Last question has no winner',
  },
  gameScoreBoard: {
    id: 'app.game.gameScoreBoard',
    description: 'Game scoreboard',
  },
});

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  locale: PropTypes.string,

  serverUrl: PropTypes.string,
  projectID: PropTypes.number,
  success: PropTypes.bool,
};

const defaultProps = {
  navbar: null,
  sidebar: null,
  actionsbar: null,
  captions: null,
  locale: OVERRIDE_LOCALE || navigator.language,
  serverUrl: 'false',
  projectID: -1,
  success: null,
};

const LAYERED_BREAKPOINT = 640;
const isLayeredView = window.matchMedia(`(max-width: ${LAYERED_BREAKPOINT}px)`);

class App extends Component {
  static renderWebcamsContainer(hideWebcam) {
    return <NewWebcamContainer hideWebcam={hideWebcam}/>;
  }

  constructor(props) {
    super(props);
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
      typeFinished: true
    };

    this.play = this.play.bind(this);
    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);
    this.renderWebcamsContainer = App.renderWebcamsContainer.bind(this);

    this.throttledDeviceType = throttle(() => this.setDeviceType(),
      50, { trailing: true, leading: true }).bind(this);
  }
  componentDidMount() {
    const {
      locale,
      notify,
      intl,
      validIOSVersion,
      layoutContextDispatch,
      meetingLayout,
      settingsLayout,
      isRTL,
      hidePresentation,
    } = this.props;

    makeCall("setServerTimeDif", new Date().toString());

    const { browserName } = browserInfo;
    const { osName } = deviceInfo;
    registerTitleView(intl.formatMessage(intlMessages.defaultViewLabel));

    layoutContextDispatch({
      type: ACTIONS.SET_IS_RTL,
      value: isRTL,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: !hidePresentation,
    });

    MediaService.setSwapLayout(layoutContextDispatch);
    Modal.setAppElement('#app');

    const fontSize = isMobile() ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
    document.getElementsByTagName('html')[0].lang = locale;
    document.getElementsByTagName('html')[0].style.fontSize = fontSize;

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(fontSize.slice(0, -2), 10),
    });

    const currentLayout = settingsLayout || meetingLayout;

    Settings.application.selectedLayout = currentLayout;
    Settings.save();

    const body = document.getElementsByTagName('body')[0];

    if (browserName) {
      body.classList.add(`browser-${browserName.split(' ').pop()
        .toLowerCase()}`);
    }

    body.classList.add(`os-${osName.split(' ').shift().toLowerCase()}`);

    if (!validIOSVersion()) {
      notify(
        intl.formatMessage(intlMessages.iOSWarning), 'error', 'warning',
      );
    }

    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize, false);
    window.addEventListener('localeChanged', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_IS_RTL,
        value: Settings.application.isRTL,
      });
    });
    window.ondragover = (e) => { e.preventDefault(); };
    window.ondrop = (e) => { e.preventDefault(); };

    if (isMobile()) makeCall('setMobileUser');

    ConnectionStatusService.startRoundTripTime();

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');
  }
  handleToggleUserList() {
    const {
      sidebarNavigationIsOpen,
      sidebarContentIsOpen,
      layoutContextDispatch,
    } = this.props;

    if (sidebarNavigationIsOpen) {
      if (sidebarContentIsOpen) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      }

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.NONE,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.USERLIST,
      });
    }
  }
  componentDidUpdate(prevProps) {
    const {
      meetingMuted,
      notify,
      currentUserEmoji,
      intl,
      hasPublishedPoll,
      mountModal,
      deviceType,
      meetingLayout,
      selectedLayout, // full layout name
      settingsLayout, // shortened layout name (without Push)
      layoutType,
      pushLayoutToEveryone, // is layout pushed
      layoutContextDispatch,
      mountRandomUserModal,
      currentPoll,
      usernames,
      sidebarNavigationIsOpen,
      sidebarContentIsOpen,
      gamesList
    } = this.props;
    let {currentPollState} = this.state;

    if(currentPoll)
    {
      if(currentPollState !== currentPoll)
      {
        let qAns = "";
        this.setState({
          currentPollState: currentPoll
        });
        for (const [index, game] of gamesList.entries()) {
          if (currentPoll.gameID == game["GameID"]){
            for (const [index1, question] of game["QuestionsList"].entries()) {
              if (currentPoll.gameQuestionID == question["QuestionID"])
                qAns = question["QuestionAnswer"];
            }
          }
        }
        const {
          answers, responses, users, numRespondents, pollType
        } = currentPoll;

        let userAnswers = responses
          ? [...users, ...responses.map(u => u.userId)]
          : [...users];
        userAnswers = userAnswers.map(id => usernames[id])
          .map((user) => {
            let answer = '';
            let time = '';
            let rightAnswer = false;
            if (responses) {
              const response = responses.find(r => r.userId === user.userId);
              if (response){
                answer = answers[response.answerId].key;
                time = response.gAnswerTime;
                rightAnswer = answers[response.answerId].key == qAns ? true : false;
              }

            }

            return {
              name: user.name,
              answer,
              time,
              rightAnswer,
            };
          })
          .sort(Service.sortUsers)

        this.setState({
          userAnswers: userAnswers
        });
      }
    }
    let {typeFinished} = this.state;

    if (meetingLayout !== prevProps.meetingLayout) {
      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_TYPE,
        value: meetingLayout,
      });

      Settings.application.selectedLayout = meetingLayout;
      Settings.save();
    }

    if (selectedLayout !== prevProps.selectedLayout
      || settingsLayout !== layoutType) {
      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_TYPE,
        value: settingsLayout,
      });

      if (pushLayoutToEveryone) {
        LayoutService.setMeetingLayout(settingsLayout);
      }
    }

    if (mountRandomUserModal) mountModal(<RandomUserSelectContainer />);

    if (prevProps.currentUserEmoji.status !== currentUserEmoji.status) {
      const formattedEmojiStatus = intl.formatMessage({ id: `app.actionsBar.emojiMenu.${currentUserEmoji.status}Label` })
        || currentUserEmoji.status;

      const raisedHand = currentUserEmoji.status === 'raiseHand';

      let statusLabel = '';
      if (currentUserEmoji.status === 'none') {
        statusLabel = prevProps.currentUserEmoji.status === 'raiseHand'
          ? intl.formatMessage(intlMessages.loweredHand)
          : intl.formatMessage(intlMessages.clearedEmoji);
      } else {
        statusLabel = raisedHand
          ? intl.formatMessage(intlMessages.raisedHand)
          : intl.formatMessage(intlMessages.setEmoji, ({ 0: formattedEmojiStatus }));
      }

      notify(
        statusLabel,
        'info',
        currentUserEmoji.status === 'none'
          ? 'clear_status'
          : 'user',
      );
    }
    if (!prevProps.meetingMuted && meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOn), 'info', 'mute',
      );
    }
    if (prevProps.meetingMuted && !meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOff), 'info', 'unmute',
      );
    }
    if (!prevProps.hasPublishedPoll && hasPublishedPoll) {
      setTimeout(
        function() {
          if(currentPollState.isGame == 'true') {
            this.setState({typeFinished: false, hideWebcam: true})
            MediaService.toggleSwapLayout(layoutContextDispatch);
            if (sidebarContentIsOpen || sidebarNavigationIsOpen)
              this.handleToggleUserList();
            this.showWinnersConfetti(currentPollState);
            const {currentUserRole} = this.props;
            const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
            const currentUserIsModerator = currentUserRole === ROLE_MODERATOR;
            setTimeout(
              function() {
                this.setState({typeFinished: true, hideWebcam: false})
                MediaService.toggleSwapLayout(layoutContextDispatch);
                if(currentUserIsModerator)
                {
                  this.handleToggleUserList();
                  if (Session.equals('gameInitiated', true)) {
                    Session.set('resetGamePanel', true);
                  }
                  layoutContextDispatch({
                    type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                    value: true,
                  });
                  layoutContextDispatch({
                    type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                    value: PANELS.GAME,
                  });
                  Session.set('forceGameOpen', true);
                }
              }
              .bind(this),
              30000
            );
          } else {
              notify(
                intl.formatMessage(intlMessages.pollPublishedLabel), 'info', 'polling',
              );
          }
        }
        .bind(this),
        2000
      );
    }

    if (deviceType === null || prevProps.deviceType !== deviceType) this.throttledDeviceType();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize, false);
    ConnectionStatusService.stopRoundTripTime();
  }

  play(type) {
    if (type == "laugh")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/applause-and-laugh.wav');
    else if (type == "applause")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/audience-clapping.wav');
    else if (type == "last")
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/male-voice-congratulations.mp3');
    else
      AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
        + Meteor.settings.public.app.basename
        + Meteor.settings.public.app.instanceId}`
        + '/resources/sounds/race-countdown-beeps');
  }

  handleWindowResize() {
    const { enableResize } = this.state;
    const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
    if (enableResize === shouldEnableResize) return;

    this.setState({ enableResize: shouldEnableResize });
    this.throttledDeviceType();
  }

  setDeviceType() {
    const { deviceType, layoutContextDispatch } = this.props;
    let newDeviceType = null;
    if (isMobile()) newDeviceType = DEVICE_TYPE.MOBILE;
    if (isTablet()) newDeviceType = DEVICE_TYPE.TABLET;
    if (isTabletPortrait()) newDeviceType = DEVICE_TYPE.TABLET_PORTRAIT;
    if (isTabletLandscape()) newDeviceType = DEVICE_TYPE.TABLET_LANDSCAPE;
    if (isDesktop()) newDeviceType = DEVICE_TYPE.DESKTOP;

    if (newDeviceType !== deviceType) {
      layoutContextDispatch({
        type: ACTIONS.SET_DEVICE_TYPE,
        value: newDeviceType,
      });
    }
  }

  shouldAriaHide() {
    const { sidebarNavigationIsOpen, sidebarContentIsOpen, isPhone } = this.props;
    return sidebarNavigationIsOpen
      && sidebarContentIsOpen
      && (isPhone || isLayeredView.matches);
  }

  renderCaptions() {

    const {
      captions,
      captionsStyle,
    } = this.props;

    if (!captions) return null;

    return (
      <div
        role="region"
        className={styles.captionsWrapper}
        style={
          {
            position: 'absolute',
            left: captionsStyle.left,
            right: captionsStyle.right,
            maxWidth: captionsStyle.maxWidth,
          }
        }
      >
        {captions}
      </div>
    );
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
  renderResult() {
    const {
      intl,
      hasPublishedPoll,
    } = this.props;
    if (!hasPublishedPoll) return null;
    let { gameScoreBoard } = this.props;
    let { userAnswers } = this.state;
    let { currentPollState } = this.state;
    let lastQuestionWinners = [];
    let gameWinners = [];
    if(currentPollState){
        if(gameScoreBoard !== ''){
          const gsbGameID = gameScoreBoard.split('*')[0];
          const gsbPlayers = gameScoreBoard.split('*')[1];
          const gsbPlayersScores = gsbPlayers.split('|');
          let gsbPlayersLastQuestion = [];
          let gsbPlayersTotalGame = [];
          for (const [index, value] of gsbPlayersScores.entries()) {
            if(value != '')
            {
              let playerFields = value.split(',');
              gsbPlayersLastQuestion.push(playerFields[0] + "," + playerFields[1] + "," + playerFields[2] + "," + playerFields[6]);
              gsbPlayersTotalGame.push(playerFields[0] + "," + playerFields[3] + "," + playerFields[4] + "," + playerFields[6]);
            }
          }
          gsbPlayersLastQuestion = this.sortPlayers(gsbPlayersLastQuestion,0);
          gsbPlayersTotalGame = this.sortPlayers(gsbPlayersTotalGame,0);
          for (const [index, value] of gsbPlayersLastQuestion.entries()) {
            const name = value.split(",")[0];
            const score = value.split(",")[1];
            const avatar = value.split(",")[3];
            if(index == 0)
            {
              if (score != 0){
                lastQuestionWinners.push(
                  <div>
                    <Typist.Delay ms={1000} />
                    <p> <img style={{width: '8%'}} src={avatar} className='rounded-circle'/> {name}
                      <span className="badge bg-primary rounded-pill fs-5">{score}</span><span style={{fontWeight: '500', fontSize:'xx-large'}}>&#129351;</span>
                    </p>

                  </div>
                );
              }
            }
            else if(index == 1)
            {
              if (score != 0){
                lastQuestionWinners.push(
                  <div>
                    <Typist.Delay ms={500} />
                    <p> <img style={{width: '8%'}} src={avatar} className='rounded-circle'/> {name}
                      <span className="badge bg-primary rounded-pill fs-5">{score}</span><span style={{fontWeight: '500', fontSize:'xx-large'}}>&#129352;</span>
                    </p>

                  </div>
                );
              }
            }
            else if(index == 2)
            {
              if (score != 0){
                lastQuestionWinners.push(
                  <div>
                    <Typist.Delay ms={500} />
                    <p> <img style={{width: '8%'}} src={avatar} className='rounded-circle'/> {name}
                      <span className="badge bg-primary rounded-pill fs-5">{score}</span><span style={{fontWeight: '500', fontSize:'xx-large'}}>&#129353;</span>
                    </p>

                  </div>
                );
              }
            }
          }

          for (const [index, value] of gsbPlayersTotalGame.entries()) {
            const name = value.split(",")[0];
            const score = value.split(",")[1];
            const avatar = value.split(",")[3];
            if(index==0)
            {
              gameWinners.push(
                <li style={{padding: '0.4rem 1rem'}} className="list-group-item d-flex justify-content-between align-items-start" style={{backgroundColor: 'gold'}}>
                  <img style={{width: '5%'}} src={avatar} className="rounded-circle" alt="Sheep"/>
                  <div className="ms-2 me-auto">
                    <div className="fw-bold fs-4">{name}</div>

                  </div>
                  <span className="badge bg-primary rounded-pill fs-5">{score}</span>
                </li>
              );
            }
            else {
              gameWinners.push(
                <li style={{padding: '0.4rem 1rem'}} className="list-group-item d-flex justify-content-between align-items-start">
                  <img style={{width: '5%'}} src={avatar} className="rounded-circle" alt="Sheep"/>
                  <div className="ms-2 me-auto">
                    <div className="fw-bold fs-4">{name}</div>
                  </div>
                  <span className="badge bg-primary rounded-pill fs-5">{score}</span>
                </li>
              );
            }
          }
        }

    }
    let {typeFinished} = this.state;
    let winnersTypeWriter = [];
    let lastQWinnersText = "";
    let noWinner = false;
    const baseName = Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename + Meteor.settings.public.app.instanceId;
    lastQuestionWinners.length > 0 ? lastQWinnersText = intl.formatMessage(intlMessages.lastQuestionWinners) : lastQWinnersText = intl.formatMessage(intlMessages.lastQuestionNoWinner);
    let typistBackground = styles.typistBackground;
    let winnersText = styles.winnersText;
    let rowStyle = {height: '80%'};
    let maxHeight = '80%';
    let colmd5 = styles.colmd5;
    if (isMobile()) {
      typistBackground = styles.typistBackgroundMobile;
      winnersText = styles.winnersTextMobile;
      rowStyle = {};
      maxHeight = '40%';
      if (lastQuestionWinners.length >  2)
        maxHeight = '35%';

      if (gameWinners.length <= 3)
        maxHeight = '80%';
      else if (gameWinners.length <= 8)
        maxHeight = '70%';
      // else if (lastQuestionWinners.length == 0)
      //   maxHeight = '45%';
      // else if (lastQuestionWinners.length <= 2)
      //   maxHeight = '40%';
      // colmd5 = styles.colmd5Mobile;
    }
    if(!typeFinished) {
      winnersTypeWriter.push(
        <>
        <br/>
        <br/>
        <br/>
        <div className="row"  style={rowStyle}>
          <div className="col-md-1 col-sm-1 d-none d-sm-block"></div>
          <div className={colmd5 + " col-xs-12 " + typistBackground} style={{ backgroundImage: `url('${baseName}/resources/images/gameBackground.png')`}}>
            <h1 style={{color: 'white'}}><strong>{lastQWinnersText}</strong>{lastQuestionWinners.length > 0 ? <span>&#128522;&#128525;&#129321;</span> : <span>&#128533;&#129320;&#128548;</span>}</h1>

            <div className={winnersText}>
              <Typist style={{ minHeight: '200px' }} avgTypingDelay={200} cursor={{show: false}}>
                  {lastQuestionWinners}
              </Typist>
            </div>
          </div>
          <div className={styles.colmd5 + " col-xs-12"}>
            <h1 style={{color: 'white'}}><strong>{intl.formatMessage(intlMessages.gameScoreBoard)}</strong></h1>
            <div className={styles.scrollableList} style={{overflowY: 'auto', maxHeight: maxHeight}}>
              <ol className="list-group list-group-numbered" style={{direction: "ltr"}}>
                {gameWinners}
              </ol>
            </div>
          </div>
        </div>
        </>
      );
    }
    return (
      winnersTypeWriter
    );
  }

  renderActionsBar() {
    const {
      actionsbar,
      intl,
      actionsBarStyle,
      hideActionsBar,
    } = this.props;

    if (!actionsbar || hideActionsBar) return null;
    let { serverUrl, projectID, success } = this.props;

    let actionsbar1 = (<ActionsBarContainer serverUrl={serverUrl} success={success} projectID={projectID} />);
    return (
      <section
        role="region"
        className={styles.actionsbar}
        aria-label={intl.formatMessage(intlMessages.actionsBarLabel)}
        aria-hidden={this.shouldAriaHide()}
        style={
          {
            position: 'absolute',
            top: actionsBarStyle.top,
            left: actionsBarStyle.left,
            height: actionsBarStyle.height,
            width: actionsBarStyle.width,
            padding: actionsBarStyle.padding,
          }
        }
      >
        {actionsbar1}
      </section>
    );
  }

  renderActivityCheck() {
    const { User } = this.props;

    const { inactivityCheck, responseDelay } = User;

    return (inactivityCheck ? (
      <ActivityCheckContainer
        inactivityCheck={inactivityCheck}
        responseDelay={responseDelay}
      />
    ) : null);
  }

  renderUserInformation() {
    const { UserInfo, User } = this.props;

    return (UserInfo.length > 0 ? (
      <UserInfoContainer
        UserInfo={UserInfo}
        requesterUserId={User.userId}
        meetingId={User.meetingId}
      />
    ) : null);
  }


  showWinnersConfetti(currentPollState) {
    const {gamesList, currentMeeting, pollTypes, isDefaultPoll, checkPollType, startCustomPoll, startPoll, intl} = this.props;
    const {userAnswers} = this.state;
    let GQNumber = 0;
    for (const [index, game] of gamesList.entries()) {
      if (currentPollState.gameID == game["GameID"]){
        GQNumber = game["QuestionsNumber"];
      }
    }
    const playedQs = currentMeeting.playedQuestions;
    const prvPlayedQuestions = playedQs;
    const playedQsSplit = playedQs.split("|");
    function checkGame(item) {
      return item.rightAnswer;
    }
    for (const [index, value] of playedQsSplit.entries()) {
     const valueSplit = value.split("*");
     const playedQsGameID = valueSplit[0];
     if(currentPollState.gameID == playedQsGameID)
     {
       if (valueSplit[1][valueSplit[1].length - 1] != ',') {
         this.play("last");
         setTimeout(
           function() {
             this.play("applause");
           }
           .bind(this),
           2000
         );
       }
       else
         userAnswers.filter(checkGame).length > 0 ? this.play("applause") : this.play("laugh");
     }
   }

    var end = Date.now() + (30 * 1000);

    // go Buckeyes!
    var colors = ['#bb0000', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
      else {
        const isAutoPlay = currentMeeting.isAutoPlay;
        if(isAutoPlay == 'true')
        {
          const prvGameScoreBoard = currentMeeting.gameScoreBoard;
          const playedQs = currentMeeting.playedQuestions;
          const prvPlayedQuestions = playedQs;
          const playedQsSplit = playedQs.split("|");
          let notPlayedQuestionGameID = "";
          let notPlayedQuestionID = "";
          let playedQsQuestionIDsSplit = [];
          for (const [index, value] of playedQsSplit.entries()) {
            const valueSplit = value.split("*");
            const playedQsGameID = valueSplit[0];
            if(currentPollState.gameID == playedQsGameID)
            {
              notPlayedQuestionGameID = playedQsGameID;
              playedQsQuestionIDsSplit = valueSplit[1].split(",");
              break;
            }
          }
          let foundQ = false;
          for (const [index, value] of gamesList.entries()) {
            if(foundQ)
              break;
            if(value["GameID"] == notPlayedQuestionGameID)
            {
              for (const [index1, value1] of value["QuestionsList"].entries()) {
                foundQ = false;
                for (const [index2, value2] of playedQsQuestionIDsSplit.entries()) {
                  if(value1["QuestionID"] == value2)
                  {
                    foundQ = true;
                    break;
                  }
                }

                if (!foundQ)
                {
                  foundQ = true;
                  notPlayedQuestionID = value1["QuestionID"];
                  let gQuestionType = "";
                  let questionOptList = [];
                  if (value1["QuestionType"] == "Custom")
                    gQuestionType = pollTypes.Custom;
                  else if (value1["QuestionType"] == "Response")
                    gQuestionType = pollTypes.Response;
                  value1["QuestionOptions"].forEach((opt) => {
                    questionOptList.push(opt);
                  });

                  const question = value1["QuestionTitle"];
                  const optList = questionOptList;
                  const type = gQuestionType;

                  const defaultPoll = isDefaultPoll(type);
                  let hasVal = false;
                  optList.forEach((o) => {
                    if (o && o != "") hasVal = true;
                  });
                  let err = null;
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
                  setTimeout(
                    function() {
                      if (verifiedPollType === pollTypes.Custom) {
                        startCustomPoll(
                          value1["QuestionGameID"],
                          value1["QuestionID"],
                          value1["QuestionTime"],
                          value1["QuestionAnswer"],
                          value1["QuestionFile"],
                          value1["QuestionFileMIME"],
                          prvGameScoreBoard,
                          prvPlayedQuestions,
                          'true',
                          verifiedPollType,
                          question,
                          _.compact(verifiedOptions),
                        );
                      } else {
                        startPoll(value1["QuestionGameID"], value1["QuestionID"], value1["QuestionTime"], value1["QuestionAnswer"], value1["QuestionFile"], value1["QuestionFileMIME"], prvGameScoreBoard, prvPlayedQuestions, 'true', verifiedPollType, question);
                      }
                    }
                    .bind(this),
                  1000);
                  break;
                }
              }
            }
          }
        }
      }
    }());
  }

  renderLayoutManager() {
    const { layoutType } = this.props;
    switch (layoutType) {
      case LAYOUT_TYPE.CUSTOM_LAYOUT:
        return <CustomLayout />;
      case LAYOUT_TYPE.SMART_LAYOUT:
        return <SmartLayout />;
      case LAYOUT_TYPE.PRESENTATION_FOCUS:
        return <PresentationFocusLayout />;
      case LAYOUT_TYPE.VIDEO_FOCUS:
        return <VideoFocusLayout />;
      default:
        return <CustomLayout />;
    }
  }

  render() {
    const {
      customStyle,
      customStyleUrl,
      audioAlertEnabled,
      pushAlertEnabled,
      shouldShowPresentation,
      shouldShowScreenshare,
      shouldShowExternalVideo,
      isPresenter,
      serverUrl,
      projectID,
      success,
      gamesList,
      currentMeeting,
    } = this.props;
    const {hideWebcam} = this.state;

    return (
      <>
        {this.renderLayoutManager()}
        <div
          id="layout"
          className={styles.layout}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          {this.renderActivityCheck()}
          {this.renderUserInformation()}
          <BannerBarContainer />
          <NotificationsBarContainer />
          <SidebarNavigationContainer />
          <SidebarContentContainer gamesList={gamesList}/>
          <NavBarContainer main="new" />
          {this.renderWebcamsContainer(hideWebcam)}
          {shouldShowPresentation ? <PresentationAreaContainer /> : null}
          {shouldShowScreenshare ? <ScreenshareContainer /> : null}
          {
            shouldShowExternalVideo
              ? <ExternalVideoContainer isPresenter={isPresenter} />
              : null
          }
          {this.renderResult()}
          {this.renderCaptions()}
          <UploaderContainer serverUrl={serverUrl} projectID={projectID} success={success} />
          <BreakoutRoomInvitation />
          <AudioContainer />
          <ToastContainer rtl />
          {(audioAlertEnabled || pushAlertEnabled)
            && (
              <ChatAlertContainer
                audioAlertEnabled={audioAlertEnabled}
                pushAlertEnabled={pushAlertEnabled}
              />
            )}
          <WaitingNotifierContainer />
          <LockNotifier />
          <StatusNotifier status="raiseHand" />
          <ManyWebcamsNotifier />
          <PollingContainer />
          <GameContainer gamesList={gamesList} />
          <ModalContainer />
          {this.renderActionsBar()}
          {customStyleUrl ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
          {customStyle ? <link rel="stylesheet" type="text/css" href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`} /> : null}
        </div>
      </>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default injectIntl(App);
