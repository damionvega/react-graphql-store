import Link from 'next/link';
import { Mutation } from 'react-apollo';

import CartCount from './CartCount';
import { getCartCount } from '../lib';
import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import { TOGGLE_CART_MUTATION } from '../queries';

export default () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/">
          <a>Shop</a>
        </Link>

        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>

            <Link href="/orders">
              <a>Orders</a>
            </Link>

            <Link href="/me">
              <a>Account</a>
            </Link>

            <Link href="/">
              <a>
                <Signout />
              </a>
            </Link>

            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button onClick={toggleCart}>
                  My Cart
                  <CartCount count={getCartCount(me.cart)} />
                </button>
              )}
            </Mutation>
          </>
        )}

        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);
