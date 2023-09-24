import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';

import Polls from '/imports/api/polls';
import Service from '../poll/service';
import { Meteor } from 'meteor/meteor';
import Users from '/imports/api/users';

const getFontSize = () => {
  const applicationSettings = Settings.application;
  return applicationSettings ? applicationSettings.fontSize : '16px';
};

const getBreakoutRooms = () => Breakouts.find().fetch();

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const currentUser = Users.findOne(
  { userId: Auth.userID },
  {
    fields:
    {
      approved: 1, emoji: 1, userId: 1, presenter: 1, role: 1,
    },
  },
);
const currentUserRole = currentUser?.role;

const getBreakoutRooms = () => Breakouts.find().fetch();

getCurrentPoll = () => currentUserRole === ROLE_MODERATOR ? Service.currentPoll() : Polls.findOne({ meetingId: Auth.meetingID });


function meetingIsBreakout() {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.isBreakout': 1 } });
  return (meeting && meeting.meetingProp.isBreakout);
}
const validIOSVersion = () => {
  const { isIos, isIosVersionSupported } = deviceInfo;

  if (isIos) {
    return isIosVersionSupported();
  }
  return true;
};

export {
  getFontSize,
  meetingIsBreakout,
  getBreakoutRooms,
  validIOSVersion,
  getCurrentPoll
};
