import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import toggleInactiveTabDetection from '../modifiers/toggleInactiveTabDetection';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function toggleMeetingInactiveTabDetection(toggleValue) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(meetingId, String);
    check(requesterUserId, String);
    check(toggleValue, Boolean);

    Logger.verbose(`Inactive tab detection from meeting ${meetingId}`);

    toggleInactiveTabDetection(meetingId, toggleValue);
  } catch (err) {
    Logger.error(`Exception while invoking method toggleMeetingInactiveTabDetection ${err.stack}`);
  }
}
