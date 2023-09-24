import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import LearningDashboardService from '/imports/ui/components/learning-dashboard/service';
import UserListService from '/imports/ui/components/user-list/service';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import logger from '/imports/startup/client/logger';
import { defineMessages, injectIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import UserOptions from './component';

import { makeCall } from '/imports/ui/services/api';

const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

const intlMessages = defineMessages({
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
  InactiveTabsDetectionDisabledMessage: {
    id: 'app.userList.content.participants.options.InactiveTabsDetectionDisabled',
    description: 'Used in toast notification when inacti tabs detection disabled',
  },
  InactiveTabsDetectionEnabledMessage: {
    id: 'app.userList.content.participants.options.InactiveTabsDetectionEnabled',
    description: 'Used in toast notification when inacti tabs detection enabled',
  },
});

const { dynamicGuestPolicy } = Meteor.settings.public.app;

const meetingMuteDisabledLog = () => logger.info({
  logCode: 'useroptions_unmute_all',
  extraInfo: { logType: 'moderator_action' },
}, 'moderator disabled meeting mute');

const UserOptionsContainer = withTracker((props) => {
  const {
    users,
    clearAllEmojiStatus,
    intl,
  } = props;

  const toggleStatus = () => {
    clearAllEmojiStatus(users);

    notify(
      intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
    );
  };

  const toggleInactiveTabDetection = () => {
    const enabled = isInactiveTabDetectionEnabled();
    makeCall('toggleMeetingInactiveTabDetection', !enabled);
    message = enabled ? intl.formatMessage(intlMessages.InactiveTabsDetectionDisabledMessage) : intl.formatMessage(intlMessages.InactiveTabsDetectionEnabledMessage);
    notify(
      message , 'info', 'user',
    );
  };

  const isMeetingMuteOnStart = () => {
    const { voiceProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceProp.muteOnStart': 1 } });
    const { muteOnStart } = voiceProp;
    return muteOnStart;
  };

  const isInactiveTabDetectionEnabled = () => {
    const inactiveTabDetectionEnabled = Meetings.findOne({ meetingId: Auth.meetingID }).inactiveTabDetectionEnabled;
    return inactiveTabDetectionEnabled || typeof inactiveTabDetectionEnabled === 'undefined' ? true : false;;
  };

  const getMeetingName = () => {
    const { meetingProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'meetingProp.name': 1 } });
    const { name } = meetingProp;
    return name;
  };

  return {
    toggleMuteAllUsers: () => {
      UserListService.muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      UserListService.muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
    toggleStatus,
    toggleInactiveTabDetection,
    isMeetingMuted: isMeetingMuteOnStart(),
    amIModerator: ActionsBarService.amIModerator(),
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    hasBreakoutRoom: UserListService.hasBreakoutRoom(),
    isBreakoutEnabled: ActionsBarService.isBreakoutEnabled(),
    isBreakoutRecordable: ActionsBarService.isBreakoutRecordable(),
    users: ActionsBarService.users(),
    guestPolicy: WaitingUsersService.getGuestPolicy(),
    isMeteorConnected: Meteor.status().connected,
    meetingName: getMeetingName(),
    learningDashboardEnabled: LearningDashboardService.isLearningDashboardEnabled(),
    openLearningDashboardUrl: LearningDashboardService.openLearningDashboardUrl,
    isInactiveTabDetectionEnabled: isInactiveTabDetectionEnabled(),
    dynamicGuestPolicy,
  };
})(UserOptions);

UserOptionsContainer.propTypes = propTypes;

export default injectIntl(UserOptionsContainer);
