import React from 'react';
import SidebarContent from './component';
import { LayoutContextFunc } from '../layout/context';

const SidebarContentContainer = (props) => {
  const { layoutContextState, layoutContextDispatch, gamesList } = props;
  const {
    output, input,
  } = layoutContextState;
  const { sidebarContent: sidebarContentInput } = input;
  const { sidebarContentPanel } = sidebarContentInput;
  const { sidebarContent } = output;

  if (sidebarContent.display === false) return null;

  return (
    <SidebarContent gamesList={gamesList}
      {...sidebarContent}
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default LayoutContextFunc.withConsumer(SidebarContentContainer);
