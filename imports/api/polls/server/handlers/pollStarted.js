import { check } from 'meteor/check';
import addPoll from '../modifiers/addPoll';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';

export default function pollStarted({ body }, meetingId) {
  const {
    userId, poll, pollType, isGame, gStartTime, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, secretPoll, question,
  } = body;

  check(meetingId, String);
  check(userId, String);
  check(poll, Object);
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
  check(question, String);

  setPublishedPoll(meetingId, false, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay);

  return addPoll(meetingId, userId, poll, pollType, isGame, gStartTime, gameID, gameQuestionID, gQuestionTime, gameQuestionAnswer, gQuestionFile, gQuestionFileMIME, prvGameScoreBoard, prvPlayedQuestions, prvIsAutoPlay, secretPoll, question);
}
