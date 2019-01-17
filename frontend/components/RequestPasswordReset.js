import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';

import Form from './styles/Form';
import Error from './ErrorMessage';

const REQUEST_PASSWORD_RESET = gql`
  mutation REQUEST_PASSWORD_RESET($email: String!) {
    requestPasswordReset(email: $email) {
      message
    }
  }
`;

export default class RequestPasswordReset extends Component {
  state = {
    email: '',
    password: '',
  };

  saveToState = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onFormSubmit = async (event, reset) => {
    event.preventDefault();

    await reset();

    this.setState({
      email: '',
    });
  };

  renderForm = (reset, { called, error, loading }) => {
    return (
      <Form method="post" onSubmit={event => this.onFormSubmit(event, reset)}>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Request Password Reset</h2>

          <Error error={error} />

          {called && !error && !loading && (
            <p>Success! Check your email for a reset link!</p>
          )}

          <label htmlFor="email">
            Email
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.saveToState}
            />
          </label>

          <button type="submit">Send Request</button>
        </fieldset>
      </Form>
    );
  };

  render() {
    return (
      <Mutation mutation={REQUEST_PASSWORD_RESET} variables={this.state}>
        {this.renderForm}
      </Mutation>
    );
  }
}
