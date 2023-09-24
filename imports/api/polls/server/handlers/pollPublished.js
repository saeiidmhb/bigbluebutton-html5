import { check } from 'meteor/check';
import setPublishedPoll from '../../../meetings/server/modifiers/setPublishedPoll';
import handleSendSystemChatForPublishedPoll from './sendPollChatMsg';

const POLL_CHAT_MESSAGE = Meteor.settings.public.poll.chatMessage;

export default function pollPublished({ body }, meetingId) {
  const { pollId, gameScoreBoard, playedQuestions, isAutoPlay } = body;
  check(meetingId, String);
  check(pollId, String);
  check(gameScoreBoard, String);
  check(playedQuestions, String);
  check(isAutoPlay, String);

  setPublishedPoll(meetingId, true, gameScoreBoard, playedQuestions, isAutoPlay);

  if (POLL_CHAT_MESSAGE) {
    handleSendSystemChatForPublishedPoll({ body }, meetingId);
  }
}
