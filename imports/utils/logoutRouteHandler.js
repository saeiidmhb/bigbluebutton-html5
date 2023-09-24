import Auth from '/imports/ui/services/auth';

const logoutRouteHandler = (end) => {
  Auth.logout()
    .then((logoutURL) => {
      if (logoutURL) {
        const protocolPattern = /^((http|https):\/\/)/;
        if(protocolPattern.test(logoutURL))
        {
          if (end)
            logoutURL += '?ended=true';
          else
            logoutURL += '?ended=false'
          window.location.href = logoutURL;
        }
        else
          window.location.href = `http://${logoutURL}`;
      }
    });
};

export default logoutRouteHandler;
