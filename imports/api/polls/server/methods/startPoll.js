import RedisPubSub from '/imports/startup/server/redis';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Logger from '/imports/startup/server/logger';

export default function startPoll(pollTypes, pollType, isGame, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, pollId, secretPoll, question, answers) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  let EVENT_NAME = 'StartPollReqMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    const gStartTime = new Date().toString();
    check(meetingId, String);
    check(requesterUserId, String);
    check(pollId, String);
    check(pollType, String);
    check(isGame, String);
    check(gStartTime, String);
    check(gameID, String);
    check(gameQuestionID, String);
    check(gQuestionTime, String);
    check(gameQuestionAnswer, String);
    check(gQuestionFile, String);
    check(gQuestionFileMIME, String);
    check(prvGameScoreBoard, String);
    check(prvPlayedQuestions, String);
    check(prvIsAutoPlay, String);
    check(secretPoll, Boolean);
    console.log("secretPoll")
    console.log(secretPoll)
    console.log("isGame")
    console.log(isGame)
    const payload = {
      requesterId: requesterUserId,
      pollId: `${pollId}/${new Date().getTime()}`,
      pollType,
      isGame,
      gStartTime,
      gameID,
      gameQuestionID,
      gQuestionTime,
      gameQuestionAnswer,
      gQuestionFile,
      gQuestionFileMIME,
      prvGameScoreBoard,
      prvPlayedQuestions,
      prvIsAutoPlay,
      secretPoll,
      question,
    };

    if (pollType === pollTypes.Custom) {
      EVENT_NAME = 'StartCustomPollReqMsg';
      check(answers, Array);
      payload.answers = answers;
    }

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method startPoll ${err.stack}`);
  }
}
