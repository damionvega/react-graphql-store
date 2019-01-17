import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';
import React, { Component } from 'react';
import Router from 'next/router';

import Error from './ErrorMessage';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import { SINGLE_ITEM_QUERY } from '../queries';

export const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
    }
  }
`;

export default class UpdateItem extends Component {
  state = {};

  handleChange = event => {
    const { name, type, value } = event.target;

    const val = type === 'number' ? formatMoney(parseFloat(value)) : value;

    this.setState({
      [name]: val,
    });
  };

  onSubmit = async (event, updateItem) => {
    event.preventDefault();

    await updateItem({
      variables: {
        id: this.props.id,
        ...this.state,
      },
    });

    Router.push({ pathname: '/' });
  };

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No item found!</p>;

          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={event => this.onSubmit(event, updateItem)}>
                  <Error error={error} />

                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="text"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                      />
                    </label>

                    <button type="submit">
                      Sav{loading ? 'ing' : 'e'} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}
