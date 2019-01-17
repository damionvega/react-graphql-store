import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import formatMoney from '../lib/formatMoney';
import RemoveFromCart from './RemoveFromCart';

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.lightGrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;

  img {
    width: 5rem;
    height: 5rem;
    margin-right: 2rem;
  }

  p {
    margin: 0;
  }
`;

const CartItem = ({ cartItem }) => {
  if (!cartItem.item) {
    return (
      <CartItemStyles>
        <p>The seller has removed this item</p>
      </CartItemStyles>
    );
  }

  return (
    <CartItemStyles>
      <img src={cartItem.item.image} alt={cartItem.item.title} />

      <div>
        <p>{cartItem.item.title}</p>

        <p>
          {cartItem.quantity} &times; {formatMoney(cartItem.item.price)}
        </p>
      </div>

      <RemoveFromCart cartItemId={cartItem.id} />
    </CartItemStyles>
  );
};

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
};

export default CartItem;
