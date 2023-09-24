import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { withModalMounter } from '/imports/ui/components/modal/service';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '../icon/component';
import { styles } from './styles.scss';
import Button from '/imports/ui/components/button/component';
import RecordingIndicator from './recording-indicator/container';
import TalkingIndicatorContainer from '/imports/ui/components/nav-bar/talking-indicator/container';
import ConnectionStatusButton from '/imports/ui/components/connection-status/button/container';
import ConnectionStatusService from '/imports/ui/components/connection-status/service';
import SettingsDropdownContainer from './settings-dropdown/container';
import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import { PANELS, ACTIONS } from '../layout/enums';

import _ from 'lodash';

const intlMessages = defineMessages({
  toggleUserListLabel: {
    id: 'app.navBar.userListToggleBtnLabel',
    description: 'Toggle button label',
  },
  languageToggleBtnLabel: {
    id: 'app.navBar.languageToggleBtnLabel',
    description: 'Toggle language button label',
  },
  toggleUserListAria: {
    id: 'app.navBar.toggleUserList.ariaLabel',
    description: 'description of the lists inside the userlist',
  },
  newMessages: {
    id: 'app.navBar.toggleUserList.newMessages',
    description: 'label for toggleUserList btn when showing red notification',
  },
  savedAlertLabel: {
    id: 'app.settings.save-notification.label',
    description: 'label shown in toast when settings are saved',
  },
});

const propTypes = {
  presentationTitle: PropTypes.string,
  hasUnreadMessages: PropTypes.bool,
  shortcuts: PropTypes.string,
  meetingTitleText: PropTypes.string,
};

const defaultProps = {
  presentationTitle: 'Default Room Title',
  hasUnreadMessages: false,
  shortcuts: '',
  meetingTitleText: 'Default Title',
};

class NavBar extends Component {
  constructor(props) {
    super(props);

    const {
      dataSaving, application,
    } = props;
    this.state = {
      current: {
        dataSaving: _.clone(dataSaving),
        application: _.clone(application),
      }
    };

    this.handleToggleUserList = this.handleToggleUserList.bind(this);
    this.handleToggleLanguage = this.handleToggleLanguage.bind(this);
  }

  componentDidMount() {
    const {
      processOutsideToggleRecording,
      connectRecordingObserver,
      shortcuts: TOGGLE_USERLIST_AK,
    } = this.props;

    const { isFirefox } = browserInfo;
    const { isMacos } = deviceInfo;

    if (Meteor.settings.public.allowOutsideCommands.toggleRecording
      || getFromUserSettings('bbb_outside_toggle_recording', false)) {
      connectRecordingObserver();
      window.addEventListener('message', processOutsideToggleRecording);
    }

    // accessKey U does not work on firefox for macOS for some unknown reason
    if (isMacos && isFirefox && TOGGLE_USERLIST_AK === 'U') {
      document.addEventListener('keyup', (event) => {
        const { key, code } = event;
        const eventKey = key?.toUpperCase();
        const eventCode = code;
        if (event?.altKey && (eventKey === TOGGLE_USERLIST_AK || eventCode === `Key${TOGGLE_USERLIST_AK}`)) {
          this.handleToggleUserList();
        }
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  handleToggleLanguage() {
    const {current} = this.state;
    const {intl, updateSettings} = this.props;
    const localeLang = current.application.locale;
    current.application.locale = localeLang !== "fa-IR" ? "fa-IR" : "en"
    updateSettings(current, intl.formatMessage(intlMessages.savedAlertLabel));
    document.getElementsByTagName('html')[0].lang = current.application.locale;
  }
  handleToggleUserList() {
    const {
      sidebarNavigation,
      sidebarContent,
      layoutContextDispatch,
    } = this.props;

    if (sidebarNavigation.isOpen) {
      if (sidebarContent.isOpen) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      }

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.NONE,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.USERLIST,
      });
    }
  }

  render() {
    const {
      hasUnreadMessages,
      hasUnreadNotes,
      // isExpanded,
      intl,
      shortcuts: TOGGLE_USERLIST_AK,
      mountModal,
      presentationTitle,
      amIModerator,
      style,
      main,
      sidebarNavigation,
      meetingTitleText,
    } = this.props;
    const hasNotification = hasUnreadMessages || hasUnreadNotes;
    const toggleBtnClasses = {};
    toggleBtnClasses[styles.btn] = true;
    toggleBtnClasses[styles.btnWithNotificationDot] = hasNotification;

    let ariaLabel = intl.formatMessage(intlMessages.toggleUserListAria);
    ariaLabel += hasNotification ? (` ${intl.formatMessage(intlMessages.newMessages)}`) : '';

    const isExpanded = sidebarNavigation.isOpen;
    const langLable = intl.formatMessage(intlMessages.languageToggleBtnLabel).includes("English") ? "English" : "فارسی";
    return (
      <header
        className={styles.navbar}
        style={
          main === 'new'
            ? {
              position: 'absolute',
              top: style.top,
              left: style.left,
              height: style.height,
              width: style.width,
            }
            : {
              position: 'relative',
              height: style.height,
              width: '100%',
            }
        }
      >
        <div className={styles.top}>
          <div className={styles.left}>
            {isExpanded && document.dir === 'ltr'
              && <Icon iconName="left_arrow" className={styles.arrowLeft} />}
            {!isExpanded && document.dir === 'rtl'
              && <Icon iconName="left_arrow" className={styles.arrowLeft} />}
            <Button
              onClick={this.handleToggleUserList}
              ghost
              circle
              hideLabel
              data-test={hasNotification ? 'hasUnreadMessages' : null}
              label={intl.formatMessage(intlMessages.toggleUserListLabel)}
              tooltipLabel={intl.formatMessage(intlMessages.toggleUserListLabel)}
              aria-label={ariaLabel}
              icon="user"
              className={cx(toggleBtnClasses)}
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
            />
            {!isExpanded && document.dir === 'ltr'
              && <Icon iconName="right_arrow" className={styles.arrowRight} />}
            {isExpanded && document.dir === 'rtl'
              && <Icon iconName="right_arrow" className={styles.arrowRight} />}
          </div>
          <div className={styles.center}>
            {meetingTitleText!="Default Title" ? <h1 className={styles.presentationTitle}>{meetingTitleText}</h1> : <h1 className={styles.presentationTitle}>{presentationTitle}</h1>}

            <RecordingIndicator
              mountModal={mountModal}
              amIModerator={amIModerator}
            />
          </div>
          <div className={styles.right}>
            <Button
              onClick={this.handleToggleLanguage}
              ghost
              circle
              hideLabel
              data-test='toggleLanguage'
              label={intl.formatMessage(intlMessages.languageToggleBtnLabel)}
              tooltipLabel={intl.formatMessage(intlMessages.languageToggleBtnLabel)}
              icon={langLable}
              aria-expanded={isExpanded}
              accessKey={TOGGLE_USERLIST_AK}
            />
            {ConnectionStatusService.isEnabled() ? <ConnectionStatusButton /> : null}
            <SettingsDropdownContainer amIModerator={amIModerator} />
          </div>
        </div>
        <div className={styles.bottom}>
          <TalkingIndicatorContainer amIModerator={amIModerator} />
        </div>
      </header>
    );
  }
}

NavBar.propTypes = propTypes;
NavBar.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(NavBar)), 'toggleUserList');
