import { makeCall } from '/imports/ui/services/api';
import Polls from '/imports/api/polls';
import { debounce } from 'lodash';
import Auth from '/imports/ui/services/auth';

const MAX_CHAR_LENGTH = 5;
const handleVote = (pollId, answerId, gAnswerTime = '') => makeCall('publishVote', pollId, answerId.id, gAnswerTime);


const handleTypedVote = (pollId, answer, gAnswerTime = '') => {
  makeCall('publishTypedVote', pollId, answer, gAnswerTime = '');
}

const mapPolls = () => {
  let close = false;
  const poll = Polls.findOne({});
  if(poll && poll.responses)
  {
    for (const [index, value] of poll.responses.entries()) {
      if(Auth.userID == value.userId)
      {
        close = true;
        break;
      }
    }
  }

  if (close || !poll || (poll.isGame === "true")) {
    return { pollExists: false };
  }

  const { answers } = poll;
  let stackOptions = false;

  answers.map((obj) => {
    if (stackOptions) return obj;
    if (obj.key && obj.key.length > MAX_CHAR_LENGTH) {
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
      stackOptions,
      question: poll.question,
      secretPoll: poll.secretPoll,
    },
    pollExists: true,
    amIRequester,
    handleVote: debounce(handleVote, 500, { leading: true, trailing: false }),
    handleTypedVote: debounce(handleTypedVote, 500, { leading: true, trailing: false }),
  };
};

export default { mapPolls };
