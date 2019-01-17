import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';

import { CURRENT_USER_QUERY } from '../queries';
import Form from './styles/Form';
import Error from './ErrorMessage';
// import signup from '../pages/signup';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $name: String!
    $email: String!
    $password: String!
  ) {
    signup(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`;

export default class Signup extends Component {
  state = {
    name: '',
    email: '',
    password: '',
  };

  saveToState = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  onFormSubmit = async (event, signup) => {
    event.preventDefault();

    await signup();

    this.setState({
      name: '',
      email: '',
      password: '',
    });
  };

  renderForm = (signup, { error, loading }) => {
    return (
      <Form method="post" onSubmit={event => this.onFormSubmit(event, signup)}>
        <fieldset disabled={loading} aria-busy={loading}>
          <h2>Sign Up For An Account</h2>

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

          <label htmlFor="name">
            Name
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={this.state.name}
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

          <button type="submit">Sign Up</button>
        </fieldset>
      </Form>
    );
  };

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {this.renderForm}
      </Mutation>
    );
  }
}
