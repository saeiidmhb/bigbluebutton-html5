import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import setTimeDif from '../modifiers/setTimeDif';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function setServerTimeDif(clientTime) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(clientTime, String);
    const nt = new Date();
    const ct = new Date(clientTime);
    const diff = nt - ct;
    Logger.verbose(`Assigned serverTimeDif user diff=${diff}`);

    setTimeDif(meetingId, requesterUserId, diff);
  } catch (err) {
    Logger.error(`Exception while invoking method serverTimeDif ${err.stack}`);
  }
}
