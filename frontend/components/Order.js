import { format } from 'date-fns';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import React from 'react';

import Error from './ErrorMessage';
import { formatMoney } from '../lib';
import OrderStyles from './styles/OrderStyles';

const ORDER_QUERY = gql`
  query ORDER_QUERY($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`;

const Order = ({ id }) => {
  return (
    <Query query={ORDER_QUERY} variables={{ id }}>
      {({ data, error, loading }) => {
        if (error) return <Error error={error} />;
        if (loading) return <div>Loading...</div>;

        const { order } = data;

        return (
          <OrderStyles>
            <p>
              <span>Order ID</span>
              <span>{id}</span>
            </p>
            <p>
              <span>Charge ID</span>
              <span>{order.charge}</span>
            </p>

            <p>
              <span>Date</span>
              <span>{format(order.createdAt, 'MMMM d, YYYY hh:mm a')}</span>
            </p>

            <p>
              <span>Order Total</span>
              <span>{formatMoney(order.total)}</span>
            </p>

            <p>
              <span>Item count</span>
              <span>{order.items.length}</span>
            </p>

            <div className="items">
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.image} alt={item.title} />

                  <div className="item-details">
                    <h2>{item.title}</h2>
                    <p>Qty: {item.quantity}</p>
                    <p>Each: {formatMoney(item.price)}</p>
                    <p>Subtotal: {formatMoney(item.quantity * item.price)}</p>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </OrderStyles>
        );
      }}
    </Query>
  );
};

Order.propTypes = {
  id: PropTypes.string.isRequired,
};

export default Order;
