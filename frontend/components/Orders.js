import gql from 'graphql-tag';
import formatDistance from 'date-fns/formatDistance';
import Link from 'next/link';
import { Query } from 'react-apollo';
import React from 'react';
import styled from 'styled-components';

import Error from './ErrorMessage';
import { formatMoney } from '../lib';
import OrderItemStyles from './styles/OrderItemStyles';

const OrderUl = styled.ul`
  display: grid;
  grid-gap: 4rem;
  grid-template-columns: repeat(auto-fit, minmax(40%, 1fr));
`;

const ORDERS_QUERY = gql`
  query OrdersQuery {
    orders(orderBy: createdAt_DESC) {
      charge
      id
      total
      createdAt
      items {
        id
        image
        quantity
        title
      }
    }
  }
`;

const Orders = React.memo(() => {
  const totalItems = items => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Query query={ORDERS_QUERY}>
      {({ data, error, loading }) => {
        if (error) return <Error error={error} />;
        if (loading) return <div>Loading...</div>;

        const { orders } = data;

        if (!orders.length) {
          return (
            <OrderItemStyles>
              <h1>No orders made!</h1>
            </OrderItemStyles>
          );
        }

        return (
          <OrderUl>
            {orders.map(order => (
              <OrderItemStyles key={order.id}>
                <Link href={{ pathname: '/order', query: { id: order.id } }}>
                  <a>
                    <div className="order-meta">
                      <p>
                        {order.items.length} Product
                        {order.items.length === 0 || order.items.length > 1
                          ? 's'
                          : ''}
                      </p>

                      <p>{totalItems(order.items)} Items</p>
                      <p>{formatMoney(order.total)}</p>

                      <span>
                        {formatDistance(order.createdAt, new Date())} ago
                      </span>
                    </div>

                    <div className="images">
                      {order.items.map(item => (
                        <div key={item.id}>
                          <p>{item.title}</p>
                          <img src={item.image} alt={item.title} />
                        </div>
                      ))}
                    </div>
                  </a>
                </Link>
              </OrderItemStyles>
            ))}
          </OrderUl>
        );
      }}
    </Query>
  );
});

export default Orders;
