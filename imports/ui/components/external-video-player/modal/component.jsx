import React, { Component, useState, useEffect } from 'react';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';

import Auth from '/imports/ui/services/auth';

import { defineMessages, injectIntl } from 'react-intl';
import { isUrlValid } from '../service';

import { styles } from './styles';

const intlMessages = defineMessages({
  start: {
    id: 'app.externalVideo.start',
    description: 'Share external video',
  },
  urlError: {
    id: 'app.externalVideo.urlError',
    description: 'Not a video URL error',
  },
  input: {
    id: 'app.externalVideo.input',
    description: 'Video URL',
  },
  urlInput: {
    id: 'app.externalVideo.urlInput',
    description: 'URL input field placeholder',
  },
  title: {
    id: 'app.externalVideo.title',
    description: 'Modal title',
  },
  close: {
    id: 'app.externalVideo.close',
    description: 'Close',
  },
  note: {
    id: 'app.externalVideo.noteLabel',
    description: 'provides hint about Shared External videos',
  },
  extURLTabTitle: {
    id: 'app.externalVideo.externalURLTabTitle',
    description: 'External URL tab title',
  },
  instructorTabTitle: {
    id: 'app.externalVideo.instructorTabTitle',
    description: 'Instructor tab title',
  },
  institutionTabTitle: {
    id: 'app.externalVideo.institutionTabTitle',
    description: 'Institution tab title',
  },
  schoolTabTitle: {
    id: 'app.externalVideo.schoolTabTitle',
    description: 'School tab title',
  }
});



class ExternalVideoModal extends Component {
  constructor(props) {
    super(props);

    const { videoUrl } = props;

    this.state = {
      url: videoUrl,
      sharing: videoUrl,
      error: null,
      isLoaded: false,
      breadcrumbInstitutionHtml: [],
      breadcrumbTeacherHtml: [],
      teacherCurrentDirectory: "/",
      institutionCurrentDirectory: "/"
    };
    this.startWatchingHandler = this.startWatchingHandler.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
    this.updateVideoUrlFromTabsHandler = this.updateVideoUrlFromTabsHandler.bind(this);
    this.renderUrlError = this.renderUrlError.bind(this);
    this.renderLimsTabs = this.renderLimsTabs.bind(this);
    this.updateVideoUrlHandler = this.updateVideoUrlHandler.bind(this);
    this.updateVideoUrlFromTabsHandler = this.updateVideoUrlFromTabsHandler.bind(this);
    this.updateBreadcrumbTeacherHandler = this.updateBreadcrumbTeacherHandler.bind(this);
    this.updateBreadcrumbInstitutionHandler = this.updateBreadcrumbInstitutionHandler.bind(this);
    this.updateBreadcrumbFromBreadcrumbHandler = this.updateBreadcrumbFromBreadcrumbHandler.bind(this);

  }

  renderLimsTabs(items, institutionItems) {
    let { isLims, isNovinSchool, Success, isLoaded } = this.state;
    const { intl, closeModal } = this.props;
    const { url, sharing } = this.state;
    if (isLoaded && Success && (isLims || isNovinSchool)) {
      let tabTitle = "";
      if (isLims)
        tabTitle = intl.formatMessage(intlMessages.institutionTabTitle);
      else if (isNovinSchool) {
        tabTitle = intl.formatMessage(intlMessages.schoolTabTitle)
      }
      return (
        <>
        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="extURL-tab" data-bs-toggle="tab" data-bs-target="#defaultExtVideoAudio" type="button" role="tab" aria-controls="extURL" aria-selected="true"> {intl.formatMessage(intlMessages.extURLTabTitle)} </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link" id="instructor-tab" data-bs-toggle="tab" data-bs-target="#instructorVideoAudio" type="button" role="tab" aria-controls="InstructorRepo" aria-selected="false"> {intl.formatMessage(intlMessages.instructorTabTitle)} </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link" id="institution-tab" data-bs-toggle="tab" data-bs-target="#institutionVideoAudio" type="button" role="tab" aria-controls="InstitutionRepo" aria-selected="false"> {tabTitle} </button>
          </li>
        </ul>

        <div className="tab-content" id="myTabContent">
          <div className={styles.videoUrl + " tab-pane fade show active"} id="defaultExtVideoAudio" role="tabpanel" aria-labelledby="extURL-tab">
            <label htmlFor="video-modal-input">
              <strong>{intl.formatMessage(intlMessages.input)}</strong>
              <input
                id="video-modal-input"
                onChange={this.updateVideoUrlHandler}
                name="video-modal-input"
                placeholder={intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
                aria-describedby="exernal-video-note"
              />
            </label>
            <div className={styles.externalVideoNote} id="external-video-note">
              {intl.formatMessage(intlMessages.note)}
            </div>
            <div>
            </div>
          </div>

          <div className="tab-pane fade" id="instructorVideoAudio" role="tabpanel" aria-labelledby="instructor-tab">
            <nav aria-label="breadcrumb" style={{"fontSize": "large", "backgroundColor": "aliceblue"}}>
              <ol className="breadcrumb breadcrumbTeacher" style={{marginLeft: "2%"}}>
                {this.state.breadcrumbTeacherHtml}
              </ol>
            </nav>
            <div className="row" style={{width: "100%"}}>
                {items}
            </div>
          </div>

          <div className="tab-pane fade" id="institutionVideoAudio" role="tabpanel" aria-labelledby="institution-tab">
            <nav aria-label="breadcrumb" style={{"fontSize": "large", "backgroundColor": "aliceblue"}}>
              <ol className="breadcrumb breadcrumbInstitution" >
                {this.state.breadcrumbInstitutionHtml}
              </ol>
            </nav>
            <div className="row" style={{width: "100%"}}>
              {institutionItems}
            </div>
          </div>
        </div>
        </>
      );
    }
    else {
      return (
        <>

        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link active" id="extURL-tab" data-bs-toggle="tab" data-bs-target="#defaultExtVideoAudio" type="button" role="tab" aria-controls="extURL" aria-selected="true"> {intl.formatMessage(intlMessages.extURLTabTitle)} </button>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent">
          <div className={styles.videoUrl + " tab-pane fade show active"} id="defaultExtVideoAudio" role="tabpanel" aria-labelledby="extURL-tab">
            <label htmlFor="video-modal-input">
              <strong>{intl.formatMessage(intlMessages.input)}</strong>
              <input
                id="video-modal-input"
                onChange={this.updateVideoUrlHandler}
                name="video-modal-input"
                placeholder={intl.formatMessage(intlMessages.urlInput)}
                disabled={sharing}
                aria-describedby="exernal-video-note"
              />
            </label>
            <div className={styles.externalVideoNote} id="external-video-note">
              {intl.formatMessage(intlMessages.note)}
            </div>
            <div>
            </div>
          </div>
        </div>
        </>
      );
    }
  }
  componentDidMount() {
    // GET request using fetch with set headers
    let { serverUrl, projectID, success } = this.props;
    let fetchAPI = false;
    if(!success || !serverUrl)
      this.setState({ isLims: false, isNovinSchool: false});
    else if(projectID === 1)
    {
      this.setState({ isLims: true, isNovinSchool: false});
      fetchAPI = true;
    }
    else if(projectID === 2)
    {
      this.setState({ isLims: false, isNovinSchool: true});
      fetchAPI = true;
    }

    if(fetchAPI) {
      const meetingID = Auth.meetingID;
      if (! serverUrl.includes("https") ) {
        let serverUrl2 =  serverUrl.split("http");
        serverUrl = "https" + serverUrl2[1];
      }
      let fetchURL = serverUrl + "Api/BBB/GetVideos?internalMeetingId=" + meetingID;

      try {
        fetch(fetchURL)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState({
                isLoaded: true,
                Results: result.Results,
                Success: result.Success,
                Message: result.Message,
                teacherCurrentDirectory: "/",
                institutionCurrentDirectory: "/",
              });
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
              this.setState({
                isLoaded: true,
                error
              });
              console.log("ERR HERE: " + error);
            }
          )
      } catch (e) {
        this.setState({ isLims: false, isNovinSchool: false});
      }
    }
  }

  startWatchingHandler() {
    const {
      startWatching,
      closeModal,
    } = this.props;

    const { url } = this.state;

    startWatching(url.trim());
    closeModal();
  }

  updateVideoUrlHandler(ev) {
    this.setState({ url: ev.target.value });
  }

  updateVideoUrlFromTabsHandler(ev) {
    let fileButtons = document.getElementsByClassName('btn-success');
    let fileButtonsLen= fileButtons.length;
    for(let i = 0; i < fileButtonsLen; i++ )
    {
      if (!fileButtons[i].className.includes("file-folder2") )
        fileButtons[i].setAttribute("class", "btn btn-light isfile file-folder");
      else
        fileButtons[i].setAttribute("class", "btn btn-light isfile file-folder2");
    }
    this.setState({ url: ev.target.getAttribute("attachedurl") });
    if ( ev.target.className.includes("isfile") ){
      if ( ev.target.className.includes("file-folder2") )
       ev.target.className  = "btn btn-success isfile file-folder2";
      else
       ev.target.className  = "btn btn-success isfile file-folder";
    }
    else if (ev.target.className.includes("video") || ev.target.className.includes("audio")) {
      if (ev.target.parentNode.parentNode.className.includes("file-folder2"))
        ev.target.parentNode.parentNode.setAttribute("class", "btn btn-success isfile file-folder2");
      else
        ev.target.parentNode.parentNode.setAttribute("class", "btn btn-success isfile file-folder");
      this.setState({ url: ev.target.parentNode.parentNode.getAttribute("attachedurl")});
    }
    else
    {
      if (ev.target.parentNode.className.includes("file-folder2"))
        ev.target.parentNode.setAttribute("class", "btn btn-success isfile file-folder2");
      else
        ev.target.parentNode.setAttribute("class", "btn btn-success isfile file-folder");
      this.setState({ url: ev.target.parentNode.getAttribute("attachedurl")});
    }
  }

  updateBreadcrumbTeacherHandler(ev) {
    var cd = ev.target.getAttribute("directoryname");
    if (!cd){
      cd = ev.target.parentNode.getAttribute("directoryname");
      if (!cd)
        cd = ev.target.parentNode.parentNode.getAttribute("directoryname");
    }
    var innerHTMLTemp = [];
    this.setState({
      teacherCurrentDirectory: cd,
      items: innerHTMLTemp,
    });
    var cdSplit = cd.split("/");
    var dirtemp = "";
    for (let [index, dir] of cdSplit.entries()) {
      if(index == 0)
      {
        dirtemp += dir;
        continue;
      }
      else if(index == 1 || index == 2)
      {
        dirtemp += "/" + dir;
        continue;
      }
      else
        dirtemp += "/" + dir;

      if (innerHTMLTemp.length === 0) dir = "Files";

      innerHTMLTemp.push(
        <li className='breadcrumb-item'>
          <a className='breadcrumb-item-a' href='#' directoryname={dirtemp} onClick={this.updateBreadcrumbTeacherHandler} style={{textDecoration: "none"}}>
            {dir}
          </a>
        </li>
      )
    };
    this.setState({
      breadcrumbTeacherHtml: innerHTMLTemp,
    })

  }
  updateBreadcrumbInstitutionHandler(ev) {

    var cd = ev.target.getAttribute("directoryname");
    if (!cd){
      cd = ev.target.parentNode.getAttribute("directoryname");
      if (!cd)
        cd = ev.target.parentNode.parentNode.getAttribute("directoryname");
    }
    var innerHTMLTemp = [];
    this.setState({
      institutionCurrentDirectory: cd,
      items: innerHTMLTemp,
    });
    var cdSplit = cd.split("/");
    var dirtemp = "";
    for (let [index, dir] of cdSplit.entries()) {
      if(index == 0)
      {
        dirtemp += dir;
        continue;
      }
      else if(index == 1 || index == 2)
      {
        dirtemp += "/" + dir;
        continue;
      }
      else
        dirtemp += "/" + dir;

      if (innerHTMLTemp.length === 0) dir = "Sessions";

      innerHTMLTemp.push(
        <li className='breadcrumb-item'>
          <a className='breadcrumb-item-a' href='#' directoryname={dirtemp} onClick={this.updateBreadcrumbInstitutionHandler} style={{textDecoration: "none"}}>
            {dir}
          </a>
        </li>
      )
    };

    this.setState({
      breadcrumbInstitutionHtml: innerHTMLTemp,
    })

  }

  updateBreadcrumbFromBreadcrumbHandler(ev) {
    let filesFolders = document.getElementsByClassName("file-folder");
    let breadcrumbItems = document.getElementsByClassName("breadcrumb-item-a");
    let fDirectory = "";
    for(let j = 0; j < breadcrumbItems.length; j++ )
    {
      fDirectory += breadcrumbItems[j].getAttribute("val");
    }

    for(let i = 0; i < filesFolders.length; i++ )
    {
      if(filesFolders[i].getAttribute("directoryname") == ev.target.innerText || ((filesFolders[i].getAttribute("directoryname") == "/") && ev.target.innerText == "/ Sessions"))
        filesFolders[i].removeAttribute("hidden");
      else
        filesFolders[i].setAttribute("hidden", "hidden");
    }

    let innerHTML = [];

    if(ev.target.innerText == "/"){
      innerHTML.push(
        <li className='breadcrumb-item'>
          <a className='breadcrumb-item-a' href='#' val="/" onClick={this.updateBreadcrumbFromBreadcrumbHandler} style={{textDecoration: "none"}}>
            /
          </a>
        </li>
      );
    }

    this.setState({
      breadcrumbHtml: innerHTML
    });
  }

  renderUrlError() {
    const { intl } = this.props;
    const { url } = this.state;

    const valid = (!url || url.length <= 3) || isUrlValid(url);

    return (
      !valid
        ? (
          <div className={styles.urlError}>
            {intl.formatMessage(intlMessages.urlError)}
          </div>
        )
        : null
    );
  }

  render() {
      const { intl, closeModal } = this.props;
      const { url, sharing } = this.state;

      const { isLims, isNovinSchool } = this.state;
      const items = [];
      const institutionItems = [];
      const { error, isLoaded, Results, Success, Message, teacherCurrentDirectory, institutionCurrentDirectory} = this.state;

      const startDisabled = !isUrlValid(url);
      if (error) {
        return <div>Error: {error.message}</div>;
      } else if (!isLoaded  && (isLims || isNovinSchool)) {
        items.push(<div>Loading...</div>)
        institutionItems.push(<div>Loading...</div>)
      } else if (isLoaded && Success && (isLims || isNovinSchool)) {
        for (const [index, value] of Results.entries()) {
          if(value.Category == 1)
          {
            if(value.Type == 1)
            {
              if(value.directories == institutionCurrentDirectory || institutionCurrentDirectory == "/")
              {
                let vTitle = institutionCurrentDirectory == "/" ? "Sessions" : value.Title;
                institutionItems.push(
                  <div className="btn btn-light folder file-folder2"
                    style={{width: "20%", marginBottom: "5%", marginLeft: "3%"}}
                    directoryname={value.FullAddress}
                    directories = {value.directories}
                    onClick={this.updateBreadcrumbInstitutionHandler}
                  >
                    <span><i className="fa fa-folder fa-3x" aria-hidden="true"></i></span>
                    <span style={{display: "block"}} >{vTitle}</span>
                  </div>
                );
                if(institutionCurrentDirectory == "/")
                  break;
              }
            }
            else
            {
              if(value.directories == institutionCurrentDirectory || institutionCurrentDirectory == "/")
              {
                institutionItems.push(
                  <div className="btn btn-light isfile file-folder2"
                    style={{width: "20%", marginBottom: "5%", marginLeft: "3%"}}
                    directoryname={value.FullAddress}
                    attachedurl={value.Url}
                    directories = {value.directories}
                    idd={value.ID}
                    onClick={this.updateVideoUrlFromTabsHandler}
                  >
                    <span><i className={"fa fa-file-" + value.FileType + "-o fa-3x"} aria-hidden="true"></i></span>
                    <span style={{display: "block"}} >{value.Title}</span>
                  </div>
                )
              }
            }
          }
        }
        for (const [index, value] of Results.entries()) {
          if(value.Category == 0) {
              if(value.Type == 1)
              {
                let vTitle = teacherCurrentDirectory == "/" ? "Files" : value.Title;
                if(value.directories == teacherCurrentDirectory || teacherCurrentDirectory == "/")
                {
                  items.push(
                    <div className="btn btn-light folder file-folder2"
                      style={{width: "20%", marginBottom: "5%", marginLeft: "3%"}}
                      directoryname={value.FullAddress}
                      directories = {value.directories}
                      onClick={this.updateBreadcrumbTeacherHandler}
                    >
                      <span><i className="fa fa-folder fa-3x" aria-hidden="true"></i></span>
                      <span style={{display: "block"}} >{vTitle}</span>
                    </div>
                  );
                  if(teacherCurrentDirectory == "/")
                    break;
                }
              }
              else
              {
                if(value.directories == teacherCurrentDirectory || teacherCurrentDirectory == "/")
                {
                  items.push(
                    <div className="btn btn-light isfile file-folder2"
                      style={{width: "20%", marginBottom: "5%", marginLeft: "3%"}}
                      directoryname={value.FullAddress}
                      attachedurl={value.Url}
                      directories = {value.directories}
                      idd={value.ID}
                      onClick={this.updateVideoUrlFromTabsHandler}
                    >
                      <span><i className={"fa fa-file-" + value.FileType + "-o fa-3x"} aria-hidden="true"></i></span>
                      <span style={{display: "block"}} >{value.Title}</span>
                    </div>
                  )
                }
              }
          }
        }
    }

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        contentLabel={intl.formatMessage(intlMessages.title)}
        hideBorder
      >
        <header data-test="videoModalHeader" className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.title)}</h3>
        </header>
        <br/>
        <div className={styles.content}>
          {this.renderLimsTabs(items, institutionItems)}
          <div>
            {this.renderUrlError()}
          </div>
          <br/>
          <Button
            className={styles.startBtn}
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.startWatchingHandler}
            disabled={startDisabled}
          />
        </div>
      </Modal>

    );
  }
}

export default injectIntl(withModalMounter(ExternalVideoModal));
