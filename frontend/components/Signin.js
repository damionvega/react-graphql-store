import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';

import { CURRENT_USER_QUERY } from '../queries';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signin extends Component {
  state = {
    email: '',
    password: '',
  };

  saveToState = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onFormSubmit = async (event, signin) => {
    event.preventDefault();

    await signin();

    this.setState({
      email: '',
      password: '',
    });
  };

  renderForm = (signin, { error, loading }) => {
    return (
      <Form method="post" onSubmit={event => this.onFormSubmit(event, signin)}>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Log In</h2>

          <Error error={error} />

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

          <button type="submit">Log In</button>
        </fieldset>
      </Form>
    );
  };

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {this.renderForm}
      </Mutation>
    );
  }
}
