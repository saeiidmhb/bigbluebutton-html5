import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import Settings from '/imports/ui/services/settings';

import UserAvatar from '/imports/ui/components/user-avatar/component';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  absentUsersTitle: {
    id: 'app.userList.absentUsersTitle',
    description: 'Title for the Header',
  },
});

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserParticipants extends Component {
  constructor() {
    super();

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      keyMapper: () => 1,
    });

    this.state = {
      selectedUser: null,
      isOpen: false,
      scrollArea: false,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
    this.selectEl = this.selectEl.bind(this);
  }

  componentDidMount() {
    document.getElementById('user-list-virtualized-scroll')?.getElementsByTagName('div')[0]?.firstElementChild?.setAttribute('aria-label', 'Users list');

    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  selectEl(el) {
    if (!el) return null;
    if (el.getAttribute('tabindex')) return el?.focus();
    this.selectEl(el?.firstChild);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (!firstChild.isEqualNode(document.activeElement)) {
        this.selectEl(selectedUser);
      }
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  rowRenderer({
    index,
    parent,
    style,
    key,
  }) {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { scrollArea } = this.state;
    const user = users[index];
    const isRTL = Settings.application.isRTL;

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={key}
          id={`user-${user.userId}`}
        >
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
              scrollArea,
              isRTL,
            }}
            user={user}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </span>
      </CellMeasurer>
    );
  }

  handleClickSelectedUser(event) {
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.className && p.className.includes('participantsList'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser, scrollArea } = this.state;
    const usersItemsRef = findDOMNode(scrollArea.firstChild);
    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }

  isUserPresent(user){
    const {users} = this.props;
    return (
      users.find(function(u, index) {
      if(u.name == user)
        return true;
      })
    )
  }

  getAbsentUsersLen(completeUserslist){
    const {users} = this.props;
    let absentUsersCount = 0;
    for (const [index0, user] of completeUserslist.entries()) {
      if (
        !(users.find(function(u, index) {
        if(u.name == user)
          return true;
        }))
      )
        absentUsersCount ++;
    }
    return absentUsersCount;
  }
  absentUsersRenderer(completeUserslist) {
    let liList = [];
    for (const [index0, value] of completeUserslist.entries()) {
      if (this.isUserPresent(value))
        continue;
      const li = <div className={"row " + styles.divRow}>
        <div className={"col-md-2 col-1 " + styles.divCol}>
          <UserAvatar
            moderator={false}
            presenter={false}
            talking={false}
            muted={false}
            listenOnly={false}
            voice={false}
            noVoice={true}
            color={"GRAY"}
            whiteboardAccess={false}
            emoji={false}
            avatar={""}
            inAbsentList={true}
          >
            {
              value.toLowerCase().slice(0, 2)
            }
          </UserAvatar>
        </div>
        <div className={"col-8"} style={{paddingTop: '3.5%', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {value}
        </div>
        <br/>
        <br/>
      </div>;
      liList.push(li);
    }
    return liList;
  }

  render() {
    const {
      intl,
      users,
      compact,
      clearAllEmojiStatus,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { isOpen, scrollArea } = this.state;
    const completeUserslist = [
      'Ahmadreza Pourghodrat',
      'Ahmadreza',
      'Maryam',
      'Alireza',
      'Akbar',
      'Zahra',
      'Hosein',
      'admin',
      'Ahmadreza',
      'Maryam',
      'Alireza',
      'Akbar',
      'Zahra',
      'Hosein',
      'admin',
      'Ahmadreza',
      'Maryam',
      'Alireza',
      'Akbar',
      'Zahra',
      'Hosein',
      'admin',
      'Ahmadreza',
      'Maryam',
      'Alireza',
      'Akbar',
      'Zahra',
      'Hosein',
      'admin',
      'Ahmadreza',
      'Maryam',
      'Alireza',
      'Akbar',
      'Zahra',
      'Hosein',
      'admin',
      // And so on...
    ];
    const AbsentUsersCount = this.getAbsentUsersLen(completeUserslist);
    let minHeight = null;
    let maxHeight = null;
    if(AbsentUsersCount != 0) {
      minHeight = users.length * 50;
      if (!currentUser.mobile)
        minHeight = minHeight > 650 ? 652 : minHeight + 2;
      maxHeight = minHeight + 3;
    }

    if (currentUser.mobile && currentUser.role === ROLE_MODERATOR && AbsentUsersCount != 0) {
      return (
      <>
      <ul className="nav nav-tabs" id="usersTabs" role="tablist">
        <li className="nav-item">
          <button className="nav-link active" id="users-tab" data-bs-toggle="tab" data-bs-target="#usersTab" type="button" role="tab" aria-selected="true">
            <h2 className={styles.smallTitle2}>
              {intl.formatMessage(intlMessages.usersTitle)}
            </h2>
          </button>
        </li>
        <li className="nav-item">
          <button className="nav-link" id="absentUsers-tab" data-bs-toggle="tab" data-bs-target="#absentUsersTab" type="button" role="tab" aria-selected="false">
            <h2 className={styles.smallTitle2}>
              {intl.formatMessage(intlMessages.absentUsersTitle)}
            </h2>
          </button>
        </li>
      </ul>
      <div className="tab-content" style={{height: '82%'}}>
        <div className={styles.userListColumn + " tab-pane fade show active"} id="usersTab" style={{height: '100%'}}>
          {
            !compact
              ? (
                <div className={styles.container}>
                  <h2 className={styles.smallTitle}>
                    {intl.formatMessage(intlMessages.usersTitle)}
                    &nbsp;(
                    {users.length}
                    )
                  </h2>
                  {currentUser.role === ROLE_MODERATOR
                    ? (
                      <UserOptionsContainer {...{
                        users,
                        clearAllEmojiStatus,
                        meetingIsBreakout,
                      }}
                      />
                    ) : null
                  }

                </div>
              )
              : <hr className={styles.separator} />
          }
          <div
            id={'user-list-virtualized-scroll'}
            className={styles.virtulizedScrollableList}
            tabIndex={0}
            ref={(ref) => {
              this.refScrollContainer = ref;
            }}
            style={{height: '92%'}}
          >
            <span id="participants-destination" />
            <AutoSizer>
              {({ height, width }) => (
                <List
                  {...{
                    isOpen,
                    users,
                  }}
                  ref={(ref) => {
                    if (ref !== null) {
                      this.listRef = ref;
                    }

                    if (ref !== null && !scrollArea) {
                      this.setState({ scrollArea: findDOMNode(ref) });
                    }
                  }}
                  rowHeight={this.cache.rowHeight}
                  rowRenderer={this.rowRenderer}
                  rowCount={users.length}
                  height={height - 1}
                  width={width - 1}
                  className={styles.scrollStyle}
                  overscanRowCount={30}
                  deferredMeasurementCache={this.cache}
                  tabIndex={-1}
                />
              )}
            </AutoSizer>
          </div>
        </div>
        <div id="absentUsersTab" className="tab-pane fade" style={{height: '100%'}}>
          <div style={{height: '7%'}}>
            <h2 className={styles.smallTitle2}>
              {intl.formatMessage(intlMessages.absentUsersTitle)}&nbsp;(
              {AbsentUsersCount}
              )
            </h2>
          </div>
          <div style={{height: '93%'}}>
            <ul className={"list-group " + styles.ulGroup + " " + styles.scrollableList} style={{height: '93%'}}>
              {this.absentUsersRenderer(completeUserslist)}
            </ul>
          </div>
        </div>
      </div>
      </>
      )
    }
    else {
    return (
      <div className={styles.userListColumn}>
        {
          !compact
            ? (
              <div className={styles.container}>
                <h2 className={styles.smallTitle}>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  &nbsp;(
                  {users.length}
                  )
                </h2>
                {currentUser.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      clearAllEmojiStatus,
                      meetingIsBreakout,
                    }}
                    />
                  ) : null
                }

              </div>
            )
            : <hr className={styles.separator} />
        }
        <div
          id={'user-list-virtualized-scroll'}
          aria-label="Users list"
          role="region"
          className={styles.virtulizedScrollableList}
          tabIndex={0}
          ref={(ref) => {
            this.refScrollContainer = ref;
          }}
          style={{minHeight: minHeight, maxHeight: maxHeight}}
        >
          <span id="participants-destination" />
          <AutoSizer>
            {({ height, width }) => (
              <List
                {...{
                  isOpen,
                  users,
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;
                  }

                  if (ref !== null && !scrollArea) {
                    this.setState({ scrollArea: findDOMNode(ref) });
                  }
                }}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                rowCount={users.length}
                height={height - 1}
                width={width - 1}
                className={styles.scrollStyle}
                overscanRowCount={30}
                deferredMeasurementCache={this.cache}
                tabIndex={-1}
              />
            )}
          </AutoSizer>
        </div>
        {currentUser.role === ROLE_MODERATOR && AbsentUsersCount != 0 ? (
          <>
          <h2 className={styles.smallTitle2}>
            {intl.formatMessage(intlMessages.absentUsersTitle)}&nbsp;(
            {AbsentUsersCount}
            )
          </h2>
          <ul className={"list-group " + styles.ulGroup + " " + styles.scrollableList}>
            {this.absentUsersRenderer(completeUserslist)}
          </ul>
          </>
        ): null}
      </div>
    );
  }
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
