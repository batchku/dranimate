import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/primitives/button';
import ServerCollection from 'components/ServerCollection';
import userService from 'services/api/userService';
import styles from './styles.scss';

class User extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={ styles.profileContents }>
        <div className={`${styles.row} ${styles.bottomMargin}`}>
          <h1>User Profile:</h1>
          <Button
            onClick={ userService.signOut.bind(userService) }
            className={ styles.formButton }
          >
            Sign Out
          </Button>
          <Button
            onClick={ this.props.onClose }
            className={ styles.formButton }
          >
            Close
          </Button>
        </div>
        <ServerCollection
          className={ styles.puppetCollection }
          openLoader={ this.props.openLoader }
          closeLoader={ this.props.closeLoader }
          />
      </div>
    );
  }
}

User.propTypes = {
  onClose: PropTypes.func.isRequired,
  openLoader: PropTypes.func.isRequired,
  closeLoader: PropTypes.func.isRequired
};

export default User;
