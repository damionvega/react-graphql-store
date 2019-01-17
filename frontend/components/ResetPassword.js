import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from '../queries';

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

export default class ResetPassword extends Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
  };

  state = {
    password: '',
    confirmPassword: '',
  };

  saveToState = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onFormSubmit = async (event, resetPassword) => {
    event.preventDefault();

    await resetPassword();

    this.setState({
      password: '',
      confirmPassword: '',
    });
  };

  renderForm = (resetPassword, { error, loading }) => {
    return (
      <Form
        method="post"
        onSubmit={event => this.onFormSubmit(event, resetPassword)}
      >
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Reset Your Password</h2>

          <Error error={error} />

          <label htmlFor="password">
            Password
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.saveToState}
            />
          </label>

          <label htmlFor="confirmPassword">
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={this.state.confirmPassword}
              onChange={this.saveToState}
            />
          </label>

          <button type="submit">Reset Password</button>
        </fieldset>
      </Form>
    );
  };

  render() {
    const { password, confirmPassword } = this.state;

    return (
      <Mutation
        mutation={RESET_PASSWORD_MUTATION}
        variables={{
          resetToken: this.props.token,
          password,
          confirmPassword,
        }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {this.renderForm}
      </Mutation>
    );
  }
}
