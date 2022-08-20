import React from 'react';
import ReactDOM from 'react-dom';

import './style.scss';

import App from './component/MainContainer';

if (module.hot)
{
  module.hot.accept();
}

ReactDOM.render(
  <App />,
  document.getElementById("InfoDiv")
);