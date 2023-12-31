import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoProvider from './component';
import VideoService from './service';

const VideoProviderContainer = ({ children, ...props }) => {
  const { streams } = props;
  return (!streams.length ? null : <VideoProvider {...props}>{children}</VideoProvider>);
};

export default withTracker(({ swapLayout, ...rest }) => {
  // getVideoStreams returns a dictionary consisting of:
  // {
  //  streams: array of mapped streams
  //  totalNumberOfStreams: total number of shared streams in the server
  // }
  const {
    streams,
    totalNumberOfStreams,
  } = VideoService.getVideoStreams();
  console.log("streams")
  console.log(streams)
  console.log("totalNumberOfStreams")
  console.log(totalNumberOfStreams)
  return {
    swapLayout,
    streams,
    totalNumberOfStreams,
    isUserLocked: VideoService.isUserLocked(),
    currentVideoPageIndex: VideoService.getCurrentVideoPageIndex(),
    ...rest,
  };
})(VideoProviderContainer);
