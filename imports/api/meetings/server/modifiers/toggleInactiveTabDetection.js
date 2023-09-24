import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';

export default function toggleInactiveTabDetection(meetingId, toggleValue) {
  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      inactiveTabDetectionEnabled: toggleValue,
    },
  };

  try {
    const numberAffected = Meetings.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned inactiveTabDetectionEnabled=${toggleValue} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning inactiveTabDetectionEnabled: ${err}`);
  }
}
