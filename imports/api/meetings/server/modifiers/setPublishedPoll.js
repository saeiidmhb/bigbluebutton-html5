import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function setPublishedPoll(meetingId, isPublished, gameScoreBoard, playedQuestions, isAutoPlay) {
  check(meetingId, String);
  check(gameScoreBoard, String);
  check(playedQuestions, String);
  check(isAutoPlay, String);
  check(isPublished, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      publishedPoll: isPublished,
      gameScoreBoard: gameScoreBoard,
      playedQuestions: playedQuestions,
      isAutoPlay: isAutoPlay,
    },
  };

  try {
    const { numberAffected } = Meetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set publishedPoll=${isPublished} in meeitingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting publishedPoll=${isPublished} for meetingId=${meetingId}`);
  }
}
