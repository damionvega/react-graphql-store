import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import React, { Component } from 'react';
import styled from 'styled-components';

import Error from './ErrorMessage';
import Item from './Item';
import Pagination from './Pagination';
import { perPage } from '../config';

export const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  fetchItems = ({ data, error, loading }) => {
    if (loading) return <p>Loading...</p>;
    if (error) return <Error error={error.message} />;

    return (
      <ItemsList>
        {data.items.map(item => (
          <Item key={item.id} item={item} />
        ))}
      </ItemsList>
    );
  };

  render() {
    return (
      <Center>
        <Pagination page={this.props.page} />
        <Query
          fetchPolicy="network-only"
          query={ALL_ITEMS_QUERY}
          variables={{
            skip: this.props.page * perPage - perPage,
            first: 4,
          }}
        >
          {this.fetchItems}
        </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}

export default Items;
