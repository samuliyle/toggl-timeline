import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import { NavMenu } from './components/NavMenu';
import Toggl from './components/Toggl';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
      return (
        <div>
            <NavMenu />
            <Container>
                <Toggl />
            </Container>
        </div>
    );
  }
}
