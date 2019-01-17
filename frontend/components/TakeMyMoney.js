import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';

import { calcTotalPrice, getCartCount } from '../lib';
import { CURRENT_USER_QUERY } from '../queries';
import Error from './ErrorMessage';
import User from './User';
import { stripeKey } from '../config';

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  createOrder: ({ render }) => (
    <Mutation
      mutation={CREATE_ORDER_MUTATION}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {render}
    </Mutation>
  ),
});

export default class TakeMyMoney extends Component {
  onToken = async (res, createOrder) => {
    NProgress.start();

    const order = await createOrder({
      variables: {
        token: res.id,
      },
    }).catch(err => alert(err.message));

    Router.push({
      pathname: '/order',
      query: {
        id: order.data.createOrder.id,
      },
    });
  };

  getFirstItemImage = cart => {
    const firstItem = cart.filter(
      cartItem =>
        cartItem.hasOwnProperty('item') && cartItem.item && cartItem.item.image,
    )[0];

    return firstItem && firstItem.item && firstItem.item.image;
  };

  render() {
    return (
      <Composed>
        {({ user, createOrder }) => {
          if (!user.data.me) return null;

          const {
            data: { me },
          } = user;

          return (
            <StripeCheckout
              amount={calcTotalPrice(me.cart)}
              currency="USD"
              description={`Order of ${getCartCount(me.cart)} items!`}
              email={me.email}
              image={this.getFirstItemImage(me.cart)}
              name="Sick Fits"
              stripeKey={stripeKey}
              token={res => this.onToken(res, createOrder)}
            >
              {this.props.children}
            </StripeCheckout>
          );
        }}
      </Composed>
    );
  }
}
