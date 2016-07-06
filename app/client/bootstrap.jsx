import ReactDOM from 'react-dom';
import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

ReactDOM.render(
    <h1>Captain's Log</h1>,
    document.getElementById('react-container')
);
