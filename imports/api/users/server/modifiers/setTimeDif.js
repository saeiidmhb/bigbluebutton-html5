import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function setTimeDif(meetingId, userId, diff) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      serverTimeDif: diff,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned serverTimeDif user id=${userId} meeting=${meetingId} diff=${diff}`);
    }
  } catch (err) {
    Logger.error(`Assigning serverTimeDif: ${err}`);
  }
}
