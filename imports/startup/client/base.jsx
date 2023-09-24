import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import { Session } from 'meteor/session';
import { FormattedMessage } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Meetings, { RecordMeetings } from '../../api/meetings';
import AppService from '/imports/ui/components/app/service';
import Breakouts from '/imports/api/breakouts';
import AudioService from '/imports/ui/components/audio/service';
import { notify } from '/imports/ui/services/notification';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { LayoutContextFunc } from '../../ui/components/layout/context';
import VideoService from '/imports/ui/components/video-provider/service';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS, PANELS } from '../../ui/components/layout/enums';
import { makeCall } from '/imports/ui/services/api';

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const BREAKOUT_END_NOTIFY_DELAY = 50;

const HTML = document.getElementsByTagName('html')[0];

let breakoutNotified = false;
let checkedUserSettings = false;

const propTypes = {
  subscriptionsReady: PropTypes.bool,
  approved: PropTypes.bool,
  meetingHasEnded: PropTypes.bool.isRequired,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  approved: false,
  meetingExist: false,
  subscriptionsReady: false,
};

const fullscreenChangedEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];


const visibilityChangedEvents = [
  'visibilitychange',
  'msvisibilitychange',
  'webkitvisibilitychange',
];

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      meetingExisted: false,
      isLoaded: false,
      meetingDataIsLoaded: false,
      MeetingDataSuccess: false,
      Welcome: "ٌWelcome message is loading ...",
      gamesList: [
        {
          "GameID": "1",
          "Title": "Who are YOU?!",
          "QuestionsNumber": 5,
          "Difficulty": "Professional",
          "Time": "10",
          "QuestionsList":[
            {
              "QuestionGameID": "1",
              "QuestionID": "1",
              "QuestionAnswer": "am",
              "QuestionType": "Custom",
              "QuestionTitle": "I ... a developer.",
              "QuestionOptions": ["are","don't", "am", "is"],
              "GameTitle": "Who are YOU?!",
              "QuestionTime": "300",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "1",
              "QuestionID": "2",
              "QuestionAnswer": "bus",
              "QuestionType": "Response",
              "QuestionTitle": "I go to work by ... .",
              "QuestionOptions": [],
              "GameTitle": "Who are YOU?!",
              "QuestionTime": "20",
              "QuestionFile": "https://i.pinimg.com/564x/8a/79/dd/8a79ddaa356bf536d806e0ec0b6bf6d5.jpg",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "1",
              "QuestionID": "3",
              "QuestionAnswer": "Esteghlal",
              "QuestionType": "Response",
              "QuestionTitle": "I love ... football club. (Answer: Esteghlal) :))",
              "QuestionOptions": [],
              "GameTitle": "Who are YOU?!",
              "QuestionTime": "10",
              "QuestionFile": "https://media.farsnews.ir/Uploaded/Files/Images/1398/08/08/13980808000549_Test_PhotoN.jpg",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "1",
              "QuestionID": "4",
              "QuestionAnswer": "play",
              "QuestionType": "Custom",
              "QuestionTitle": "I ... guitar.",
              "QuestionOptions": ["likes", "play", "breaks", "broken"],
              "GameTitle": "Who are YOU?!",
              "QuestionTime": "15",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "1",
              "QuestionID": "5",
              "QuestionAnswer": "most interesting",
              "QuestionType": "Custom",
              "QuestionTitle": "My job is the ... job in the world.",
              "QuestionOptions": ["most interesting", "more interesting"],
              "GameTitle": "Who are YOU?!",
              "QuestionTime": "20",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
          ],
        },
        {
          "GameID": "2",
          "Title": "Are you QUICK enough?",
          "QuestionsNumber": 4,
          "Difficulty": "Beginner",
          "Time": "5",
          "QuestionsList":[
            {
              "QuestionGameID": "2",
              "QuestionID": "1",
              "QuestionAnswer": "G2Q1 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 1 Game #2",
              "QuestionOptions": ["G2Q1 Opt1","G2Q1 Opt2","G2Q1 Opt3"],
              "GameTitle": "Are you QUICK enough?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "2",
              "QuestionID": "2",
              "QuestionAnswer": "G2Q2 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 2 Game #2",
              "QuestionOptions": ["G2Q2 Opt1","G2Q2 Opt2","G2Q2 Opt3"],
              "GameTitle": "Are you QUICK enough?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "2",
              "QuestionID": "3",
              "QuestionAnswer": "G2Q3 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 3 Game #2",
              "QuestionOptions": ["G2Q3 Opt1","G2Q3 Opt2","G2Q3 Opt3"],
              "GameTitle": "Are you QUICK enough?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "2",
              "QuestionID": "4",
              "QuestionAnswer": "G2Q4 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 4 Game #2",
              "QuestionOptions": ["G2Q4 Opt1","G2Q4 Opt2","G2Q4 Opt3"],
              "GameTitle": "Are you QUICK enough?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            }
          ],
        },
        {
          "GameID": "3",
          "Title": "Are you a good PLAYER?",
          "QuestionsNumber": 2,
          "Difficulty": "Intermediate",
          "Time": "10",
          "QuestionsList":[
            {
              "QuestionGameID": "3",
              "QuestionID": "1",
              "QuestionAnswer": "G3Q1 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 1 Game #3",
              "QuestionOptions": ["G3Q1 Opt1","G3Q1 Opt2","G3Q1 Opt3"],
              "GameTitle": "Who is the smartest?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            },
            {
              "QuestionGameID": "3",
              "QuestionID": "2",
              "QuestionAnswer": "G3Q2 Opt1",
              "QuestionType": "Custom",
              "QuestionTitle": "Question Number 2 Game #3",
              "QuestionOptions": ["G3Q2 Opt1","G3Q2 Opt2","G3Q2 Opt3"],
              "GameTitle": "Who is the smartest?",
              "QuestionTime": "30",
              "QuestionFile": "",
              "QuestionFileMIME": ""
            }
          ],
        },
      ]
    };
    this.updateLoadingState = this.updateLoadingState.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  handleVisibilityChange() {
    const {isInactiveTabDetectionEnabled} = this.props;
    if (isInactiveTabDetectionEnabled) {
      if (document.hidden
        || document.msHidden
        || document.webkitHidden) {
        // Session.set('isVisible', true);
        makeCall('setEmojiStatus', Auth.userID, 'inactiveTab')
      } else {
        // Session.set('isVisible', false);
        makeCall('setEmojiStatus', Auth.userID, 'none')
      }
    }
  }

  handleFullscreenChange() {
    const { layoutContextDispatch } = this.props;

    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      Session.set('isFullscreen', true);
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
      Session.set('isFullscreen', false);
    }
  }
  fetchGetBBBNeeds(meetingID) {
    let { Url } = this.state;
    if (! Url.includes("https") ) {
      let serverUrl2 =  Url.split("http");
      Url = "https" + serverUrl2[1];
    }

    let fetchURL = Url + "Api/BBB/GetBBBNeeds?internalMeetingId=" + meetingID;
    try {
      fetch(fetchURL)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              meetingDataIsLoaded: true,
              Logo: result.Logo,
              Welcome: result.Welcome,
              Presentation: result.Presentation,
              Title: result.Title,
              WebcamLimitedCon: result.WebcamLimitedCon,
              MeetingDataSuccess: result.Success,
              MeetingDataMessage: result.Message,
            });
            var link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = result.Logo;
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              meetingDataIsLoaded: true,
              error
            });
            console.log("ERR HERE: " + error);
          }
        )
    } catch (e) {
      this.setState({
        meetingDataIsLoaded: true,
        Logo: "",
        Welcome: "false",
        Presentation: "",
        Title: "",
        MeetingDataSuccess: false,
        MeetingDataMessage: "Default Title",
      });
    }
  }


  fetchGameIDs(meetingID) {
    // let { Url } = this.state;
    // if (! Url.includes("https") ) {
    //   let serverUrl2 =  Url.split("http");
    //   Url = "https" + serverUrl2[1];
    // }

    let fetchURL = Url + "Api/QuizGame/GetQuizGameInfo?internalMeetingId=" + meetingID;
    try {
      fetch(fetchURL)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              gameIDsIsLoaded: true,
              gameIDsData: result.Data,
              gameIDsSuccess: result.Success,
              gameIDsMessage: result.Message,
            });
          },
          (error) => {
            this.setState({
              gameIDsIsLoaded: true,
              error
            });
            console.log("GameIds ERR HERE: " + error);
          }
        )
    } catch (e) {
      this.setState({
        gameIDsIsLoaded: true,
        gameIDsData: [],
        gameIDsSuccess: false,
        gameIDsMessage: "",
      });
    }
  }


  componentDidMount() {
    const { animations, usersVideo, layoutContextDispatch } = this.props;
    const meetingID = Auth.meetingID;

    layoutContextDispatch({
      type: ACTIONS.SET_NUM_CAMERAS,
      value: usersVideo.length,
    });

    try {
      fetch("https://service.nscom.ir/Api/OnlineTraining/GetPortalUrlByUserPaln_CalendarCodedId_New?internalMeetingId=" + meetingID)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              Url: result.Url,
              Success: result.Success,
              Message: result.Message,
              ProjectID: result.ProjectID
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
            console.log("ERR HERE: " + error);
          }
        )
    } catch (e) {
      this.setState({
        isLoaded: true,
        Url: "false",
        Success: false,
        Message: "",
        ProjectID: -1
      });
    }
    const {
      userID: localUserId,
    } = Auth;

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
    Session.set('isFullscreen', false);

    visibilityChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleVisibilityChange);
    });

    // TODO move this find to container
    const users = Users.find({
      meetingId: Auth.meetingID,
      validated: true,
      userId: { $ne: localUserId },
    }, { fields: { name: 1, userId: 1 } });

    users.observe({
      added: (user) => {
        const subscriptionsReady = Session.get('subscriptionsReady');

        if (!subscriptionsReady) return;

        const {
          userJoinAudioAlerts,
          userJoinPushAlerts,
        } = Settings.application;

        if (!userJoinAudioAlerts && !userJoinPushAlerts) return;

        if (userJoinAudioAlerts) {
          AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
            + Meteor.settings.public.app.basename
            + Meteor.settings.public.app.instanceId}`
            + '/resources/sounds/userJoin.mp3');
        }

        if (userJoinPushAlerts) {
          notify(
            <FormattedMessage
              id="app.notification.userJoinPushAlert"
              description="Notification for a user joins the meeting"
              values={{
                0: user.name,
              }}
            />,
            'info',
            'user',
          );
        }
      },
      removed: (user) => {
        const subscriptionsReady = Session.get('subscriptionsReady');

        if (!subscriptionsReady) return;

        const {
          userLeaveAudioAlerts,
          userLeavePushAlerts,
        } = Settings.application;

        if (!userLeaveAudioAlerts && !userLeavePushAlerts) return;

        if (userLeaveAudioAlerts) {
          AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
            + Meteor.settings.public.app.basename
            + Meteor.settings.public.app.instanceId}`
            + '/resources/sounds/notify.mp3');
        }

        if (userLeavePushAlerts) {
          notify(
            <FormattedMessage
              id="app.notification.userLeavePushAlert"
              description="Notification for a user leaves the meeting"
              values={{
                0: user.name,
              }}
            />,
            'info',
            'user',
          );
        }
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      approved,
      meetingExist,
      animations,
      ejected,
      isMeteorConnected,
      subscriptionsReady,
      layoutContextDispatch,
      layoutContextState,
      usersVideo,
    } = this.props;
    const {
      loading,
      meetingExisted,
    } = this.state;

    const { input } = layoutContextState;
    const { sidebarContent } = input;
    const { sidebarContentPanel } = sidebarContent;

    if (usersVideo !== prevProps.usersVideo) {
      layoutContextDispatch({
        type: ACTIONS.SET_NUM_CAMERAS,
        value: usersVideo.length,
      });
    }

    if (!prevProps.subscriptionsReady && subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
    }

    if (prevProps.meetingExist && !meetingExist && !meetingExisted) {
      this.setMeetingExisted(true);
    }

    // In case the meteor restart avoid error log
    if (isMeteorConnected && (prevState.meetingExisted !== meetingExisted) && meetingExisted) {
      this.setMeetingExisted(false);
    }

    // In case the meeting delayed to load
    if (!subscriptionsReady || !meetingExist) return;

    if (approved && loading) this.updateLoadingState(false);

    if (prevProps.ejected || ejected) {
      Session.set('codeError', '403');
      Session.set('isMeetingEnded', true);
    }

    // In case the meteor restart avoid error log
    if (isMeteorConnected && (prevState.meetingExisted !== meetingExisted)) {
      this.setMeetingExisted(false);
    }

    const enabled = HTML.classList.contains('animationsEnabled');
    const disabled = HTML.classList.contains('animationsDisabled');

    if (animations && animations !== prevProps.animations) {
      if (disabled) HTML.classList.remove('animationsDisabled');
      HTML.classList.add('animationsEnabled');
    } else if (!animations && animations !== prevProps.animations) {
      if (enabled) HTML.classList.remove('animationsEnabled');
      HTML.classList.add('animationsDisabled');
    }

    if (sidebarContentPanel === PANELS.NONE || Session.equals('subscriptionsReady', true)) {
      if (!checkedUserSettings) {
        if (getFromUserSettings('bbb_show_participants_on_login', Meteor.settings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (CHAT_ENABLED && getFromUserSettings('bbb_show_public_chat_on_login', !Meteor.settings.public.chat.startClosed)) {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.CHAT,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_ID_CHAT_OPEN,
              value: PUBLIC_CHAT_ID,
            });
          } else {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
          }
        } else {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
        }

        if (Session.equals('subscriptionsReady', true)) {
          checkedUserSettings = true;
        }
      }
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleFullscreenChange);
    });
    const {isInactiveTabDetectionEnabled} = this.props;

    visibilityChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleVisibilityChange);
    });
  }

  setMeetingExisted(meetingExisted) {
    this.setState({ meetingExisted });
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  renderByState() {
    const { isLoaded, Success, Url, ProjectID, Message } = this.state;

    const { meetingDataIsLoaded, MeetingDataSuccess, Title, MeetingDataMessage, WebcamLimitedCon, gamesList } = this.state;
    let {Welcome} = this.state;
    const { updateLoadingState } = this;
    const stateControls = { updateLoadingState };
    const { loading } = this.state;
    const {
      codeError,
      ejected,
      ejectedReason,
      meetingExist,
      meetingHasEnded,
      meetingEndedReason,
      meetingIsBreakout,
      subscriptionsReady,
      User,
      meetingLockSettingsProps,
    } = this.props;

    if ((loading || !subscriptionsReady) && !meetingHasEnded && meetingExist) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    if (ejected) {
      return (<MeetingEnded code="403" ejectedReason={ejectedReason} />);
    }

    if ((meetingHasEnded || User?.loggedOut) && meetingIsBreakout) {
      window.close();
      return null;
    }

    if (((meetingHasEnded && !meetingIsBreakout)) || (codeError && User?.loggedOut)) {
      return (
        <MeetingEnded
          code={codeError}
          endedReason={meetingEndedReason}
          ejectedReason={ejectedReason}
        />
      );
    }

    if (codeError && !meetingHasEnded) {
      // 680 is set for the codeError when the user requests a logout
      if (codeError !== '680') {
        return (<ErrorScreen code={codeError} />);
      }
      return (<MeetingEnded code={codeError} />);
    }
    let serverUrl = "false";
    let projectID = -1;
    if (isLoaded && Success)
    {
      serverUrl = Url;
      projectID = ProjectID;
    }
    if (isLoaded && Success && !meetingDataIsLoaded) {
      const meetingID = Auth.meetingID;
      this.fetchGetBBBNeeds(meetingID);
      this.fetchGameIDs(meetingID);
    }
    if (!MeetingDataSuccess || !meetingDataIsLoaded)
      Welcome = "false"
    if((!isLoaded) || (isLoaded && Success && !meetingDataIsLoaded))
      return (<LoadingScreen />);
    else
    {
      if(!meetingLockSettingsProps.applied && meetingLockSettingsProps.disableCamLimitedCon !== WebcamLimitedCon && typeof WebcamLimitedCon != 'undefined')
      {
        console.log("WebcamLimitedCon")
        console.log(typeof WebcamLimitedCon != 'undefined')
        meetingLockSettingsProps.disableCamLimitedCon = WebcamLimitedCon;
        makeCall('toggleLockSettings', meetingLockSettingsProps);
      }
      return (<AppContainer {...this.props} gamesList={gamesList} projectID={projectID} success={Success} serverUrl={serverUrl} institutionWelcomeMessage={Welcome} meetingTitleText={Title} baseControls={stateControls} />);
    }
  }

  render() {
    const {
      meetingExist,
    } = this.props;
    const { meetingExisted } = this.state;
    return (
      <>
        {meetingExist && Auth.loggedIn && <DebugWindow />}
        {
          (!meetingExisted && !meetingExist && Auth.loggedIn)
            ? <LoadingScreen />
            : this.renderByState()
        }
      </>
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const BaseContainer = withTracker(() => {
  const {
    animations,
  } = Settings.application;

  const {
    credentials,
    loggedIn,
  } = Auth;

  const { meetingId } = credentials;
  let breakoutRoomSubscriptionHandler;
  let meetingModeratorSubscriptionHandler;

  const fields = {
    approved: 1,
    authed: 1,
    ejected: 1,
    ejectedReason: 1,
    color: 1,
    effectiveConnectionType: 1,
    extId: 1,
    guest: 1,
    intId: 1,
    locked: 1,
    loggedOut: 1,
    meetingId: 1,
    userId: 1,
    inactivityCheck: 1,
    responseDelay: 1,
    lockSetting: 1,
  };
  const User = Users.findOne({ intId: credentials.requesterUserId }, { fields });
  const meeting = Meetings.findOne({ meetingId }, {
    fields: {
      meetingEnded: 1,
      meetingEndedReason: 1,
      meetingProp: 1,
      lockSettingsProps: 1,
      inactiveTabDetectionEnabled: 1,
    },
  });
  if (meeting && meeting.meetingEnded) {
    Session.set('codeError', '410');
  }
  let meetingLockSettingsProps = {};
  if (meeting)
      meetingLockSettingsProps = meeting["lockSettingsProps"];
  const approved = User?.approved && User?.guest;
  const ejected = User?.ejected;
  const ejectedReason = User?.ejectedReason;
  const meetingEndedReason = meeting?.meetingEndedReason;

  let userSubscriptionHandler;

  Breakouts.find({}, { fields: { _id: 1 } }).observeChanges({
    added() {
      breakoutNotified = false;
    },
    removed() {
      // Need to check the number of breakouts left because if a user's role changes to viewer
      // then all but one room is removed. The data here isn't reactive so no need to filter
      // the fields
      const numBreakouts = Breakouts.find().count();
      if (!AudioService.isUsingAudio() && !breakoutNotified && numBreakouts === 0) {
        if (meeting && !meeting.meetingEnded && !meeting.meetingProp.isBreakout) {
          // There's a race condition when reloading a tab where the collection gets cleared
          // out and then refilled. The removal of the old data triggers the notification so
          // instead wait a bit and check to see that records weren't added right after.
          setTimeout(() => {
            if (breakoutNotified) {
              notify(
                <FormattedMessage
                  id="app.toast.breakoutRoomEnded"
                  description="message when the breakout room is ended"
                />,
                'info',
                'rooms',
              );
            }
          }, BREAKOUT_END_NOTIFY_DELAY);
        }
        breakoutNotified = true;
      }
    },
  });

  RecordMeetings.find({ meetingId }, { fields: { recording: 1 } }).observe({
    changed: (newDocument, oldDocument) => {
      if (newDocument) {
        if (!oldDocument.recording && newDocument.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStart"
              description="Notification for when the recording starts"
            />,
            'success',
            'record',
          );
        }

        if (oldDocument.recording && !newDocument.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingPaused"
              description="Notification for when the recording stops"
            />,
            'error',
            'record',
          );
        }
      }
    },
  });

  const codeError = Session.get('codeError');
  const { streams: usersVideo } = VideoService.getVideoStreams();
  const tabEnabled = !meeting || meeting.inactiveTabDetectionEnabled || typeof meeting.inactiveTabDetectionEnabled === 'undefined' ? true : false;

  return {
    approved,
    ejected,
    ejectedReason,
    userSubscriptionHandler,
    breakoutRoomSubscriptionHandler,
    meetingModeratorSubscriptionHandler,
    animations,
    User,
    isMeteorConnected: Meteor.status().connected,
    meetingExist: !!meeting,
    meetingHasEnded: !!meeting && meeting.meetingEnded,
    meetingEndedReason,
    meetingIsBreakout: AppService.meetingIsBreakout(),
    subscriptionsReady: Session.get('subscriptionsReady'),
    loggedIn,
    codeError,
    usersVideo,
    meetingLockSettingsProps,
    isInactiveTabDetectionEnabled: tabEnabled,
  };
})(LayoutContextFunc.withContext(Base));

export default BaseContainer;
