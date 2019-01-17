import { adopt } from 'react-adopt';
import { Mutation, Query } from 'react-apollo';
import React from 'react';

import { calcTotalPrice, getCartCount } from '../lib';
import CartItem from './CartItem';
import CartStyles from './styles/CartStyles';
import CloseButton from './styles/CloseButton';
import formatMoney from '../lib/formatMoney';
import { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION } from '../queries';
import SickButton from './styles/SickButton';
import Supreme from './styles/Supreme';
import TakeMyMoney from './TakeMyMoney';
import User from './User';

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

export default React.memo(() => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      if (!user.data.me) return null;

      const { me } = user.data;
      const cartCount = getCartCount(me.cart);

      return (
        <CartStyles open={localState.data.cartOpen}>
          <header>
            <CloseButton title="close" onClick={toggleCart}>
              &times;
            </CloseButton>

            <Supreme>{me.name}'s Cart</Supreme>

            <p>
              You have {cartCount || 'no'}{' '}
              {cartCount > 1 || cartCount === 0 ? 'items' : 'item'} in your
              Cart.
            </p>
          </header>

          <ul>
            {me.cart.map(cartItem => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </ul>

          <footer>
            <p>Total: {formatMoney(calcTotalPrice(me.cart))}</p>

            {me.cart.length ? (
              <TakeMyMoney>
                <SickButton>Checkout</SickButton>
              </TakeMyMoney>
            ) : null}
          </footer>
        </CartStyles>
      );
    }}
  </Composed>
));
