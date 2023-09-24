import { check } from 'meteor/check';
import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

export default function userResponded({ body }) {
  const { pollId, userId, answerId, gAnswerTime } = body;

  check(pollId, String);
  check(userId, String);
  check(answerId, Number);
  check(gAnswerTime, String);

  const selector = {
    id: pollId,
  };

  const modifier = {
    $pull: {
      users: userId,
    },
    $push: {
      responses: { userId, answerId, gAnswerTime },
    },
  };

  try {
    const numberAffected = Polls.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updating Poll response (userId: ${userId}, response: ${answerId}, pollId: ${pollId})`);
    }
  } catch (err) {
    Logger.error(`Updating Poll responses: ${err}`);
  }
}
