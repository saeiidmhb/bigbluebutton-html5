import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import VideoPreviewContainer from '/imports/ui/components/video-preview/container';
import JoinVideoButton from './component';
import VideoService from '../service';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';

const JoinVideoOptionsContainer = (props) => {
  const {
    hasVideoStream,
    disableReason,
    intl,
    mountModal,
    stats,
    ...restProps
  } = props;
  const mountVideoPreview = () => { mountModal(<VideoPreviewContainer />); };
  return (
    <JoinVideoButton {...{
      mountVideoPreview, hasVideoStream, disableReason, stats, ...restProps,
    }}
    />
  );
};

export default withModalMounter(injectIntl(withTracker(() => ({
  hasVideoStream: VideoService.hasVideoStream(),
  disableReason: VideoService.disableReason(),
  stats: ConnectionStatusService.getStats(),
}))(JoinVideoOptionsContainer)));
