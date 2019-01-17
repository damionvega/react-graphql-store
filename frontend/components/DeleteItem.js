import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';

import { ALL_ITEMS_QUERY } from './Items';
import { CURRENT_USER_QUERY } from '../queries';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

export default class DeleteItem extends Component {
  update = (cache, payload) => {
    // Manually update the cache on the client to match the server
    // 1. Read cache to find what we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });

    // 2. Filter the deleted item from the page
    data.items = data.items.filter(
      item => item.id !== payload.data.deleteItem.id,
    );

    // 3. Update list of items
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        update={this.update}
        variables={{ id: this.props.id }}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this item?')) {
                deleteItem();
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}
