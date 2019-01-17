import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';

import { CURRENT_USER_QUERY } from '../queries';

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

export default class AddToCart extends Component {
  render() {
    const { id } = this.props;

    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        variables={{
          id,
        }}
      >
        {(addToCart, { loading }) => (
          <button disabled={loading} type="button" onClick={addToCart}>
            Add{loading && 'ing'} To Cart 🛒
          </button>
        )}
      </Mutation>
    );
  }
}
