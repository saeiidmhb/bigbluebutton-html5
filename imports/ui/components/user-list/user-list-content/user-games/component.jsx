import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import { ACTIONS, PANELS } from '../../../layout/enums';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';

const intlMessages = defineMessages({
  gameLabel: {
    id: 'app.game.gamePaneTitle',
    description: 'label for user-list game button',
  },
});

const UserGames = ({
  intl,
  isPresenter,
  gameIsOpen,
  forceGameOpen,
  sidebarContentPanel,
  layoutContextDispatch,
}) => {
  if (!isPresenter) return null;
  if (!gameIsOpen && !forceGameOpen) return null;

  const handleClickToggleGame = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.GAME,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.GAME
        ? PANELS.NONE
        : PANELS.GAME,
    });
  };

  return (
    <div className={styles.messages}>
      <div className={styles.container}>
        <h2 className={styles.smallTitle}>
          {intl.formatMessage(intlMessages.gameLabel)}
        </h2>
      </div>
      <div className={styles.list}>
        <div className={styles.scrollableList}>
          <div
            role="button"
            tabIndex={0}
            className={styles.listItem}
            data-test="gameMenuButton"
            onClick={handleClickToggleGame}
            onKeyPress={() => {}}
          >
            <Icon iconName="happy" />
            <span>{intl.formatMessage(intlMessages.gameLabel)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default injectIntl(UserGames);

UserGames.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPresenter: PropTypes.bool.isRequired,
  gameIsOpen: PropTypes.bool.isRequired,
  forceGameOpen: PropTypes.bool.isRequired,
};
