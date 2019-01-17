import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React, { Component } from 'react';
import Router from 'next/router';

import Error from './ErrorMessage';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

export const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ) {
      id
    }
  }
`;

export default class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    price: 0,
    image: '',
    largeImage: '',
  };

  handleChange = event => {
    const { name, type, value } = event.target;

    const val = type === 'number' ? formatMoney(parseFloat(value)) : value;

    this.setState({
      [name]: val,
    });
  };

  uploadFile = async event => {
    const files = event.target.files;

    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sick fits');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dfrhdbgr4/image/upload',
      {
        method: 'POST',
        body: data,
      },
    );

    const file = await res.json();

    if (!file.error) {
      this.setState({
        image: file.secure_url,
        largeImage: file.eager[0].secure_url,
      });
    }
  };

  onSubmit = async (event, createItem) => {
    event.preventDefault();

    const res = await createItem();

    Router.push({
      pathname: '/item',
      query: { id: res.data.createItem.id },
    });
  };

  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={event => this.onSubmit(event, createItem)}>
            <Error error={error} />

            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img src={this.state.image} alt="Image upload" width="200" />
                )}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>

              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}
