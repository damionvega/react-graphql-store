import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from 'styled-components';
import { CURRENT_USER_QUERY } from '../queries';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  color: ${props => props.theme.red};

  &:hover {
    cursor: pointer;
  }
`;

class RemoveFromCart extends Component {
  static propTypes = {
    cartItemId: PropTypes.string.isRequired,
  };

  // This is called as soon as we receive a response from the server
  // after the mutation has been performed
  update = (cache, payload) => {
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    const cartItemId = payload.data.removeFromCart.id;

    data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);

    cache.writeQuery({
      query: CURRENT_USER_QUERY,
      data,
    });
  };

  render() {
    const { cartItemId } = this.props;

    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id: cartItemId,
          },
        }}
        update={this.update}
        variables={{ id: cartItemId }}
      >
        {(removeFromCart, { loading }) => (
          <BigButton
            disabled={loading}
            onClick={() => removeFromCart().catch(err => alert(err.message))}
            title="Delete Item"
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
