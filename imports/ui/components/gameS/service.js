import { makeCall } from '/imports/ui/services/api';
import Polls from '/imports/api/polls';
import { debounce } from 'lodash';

const MAX_CHAR_LENGTH = 25;

const handleVote = (pollId, answerId, gAnswerTime='') => {
  makeCall('publishVote', pollId, answerId.id, gAnswerTime);
};

const handleTypedVote = (pollId, answer, gAnswerTime='') => {
  makeCall('publishTypedVote', pollId, answer, gAnswerTime);
};

const mapPolls = () => {
  const poll = Polls.findOne({});
  if (!poll || (poll.isGame === "false")) {
    return { pollExists: false };
  }

  const { answers } = poll;
  let stackOptions = false;

  answers.map((obj) => {
    if (stackOptions) return obj;
    if (obj.key.length > MAX_CHAR_LENGTH) {
      stackOptions = true;
    }
    return obj;
  });
  const amIRequester = poll.requester !== 'userId';
  return {
    poll: {
      answers: poll.answers,
      pollId: poll.id,
      pollType: poll.pollType,
      isGame: poll.isGame,
      gameID: poll.gameID,
      gameQuestionID: poll.gameQuestionID,
      gQuestionTime: poll.gQuestionTime,
      gameQuestionAnswer: poll.gameQuestionAnswer,
      gQuestionFile: poll.gQuestionFile,
      gQuestionFileMIME: poll.gQuestionFileMIME,
      stackOptions,
      question: poll.question,
      gStartTime: poll.gStartTime,
    },
    pollExists: true,
    amIRequester,
    handleVote: debounce(handleVote, 500, { leading: true, trailing: false }),
    handleTypedVote: debounce(handleTypedVote, 500, { leading: true, trailing: false }),
  };
};

export default { mapPolls };
