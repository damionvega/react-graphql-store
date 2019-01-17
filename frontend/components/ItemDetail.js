import { Query } from 'react-apollo';
import React, { Component } from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import { appTitle } from '../config';
import ErrorMessage from './ErrorMessage';
import { SINGLE_ITEM_QUERY } from '../queries';

const SingleItemStyled = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;

export default class ItemDetail extends Component {
  querySingleItem = ({ data, error, loading }) => {
    if (error) return <ErrorMessage error={error} />;
    if (loading) return <p>Loading...</p>;
    if (!data.item) return <p>No item found!</p>;

    const { item } = data;

    return (
      <SingleItemStyled>
        <Head>
          <title>
            {appTitle} | {item.title}
          </title>
        </Head>

        {item.largeImage && <img src={item.largeImage} alt={item.title} />}

        <div className="details">
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
      </SingleItemStyled>
    );
  };

  render() {
    const { id } = this.props;

    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
        {this.querySingleItem}
      </Query>
    );
  }
}
