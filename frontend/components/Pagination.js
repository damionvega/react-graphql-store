import gql from 'graphql-tag';
import Head from 'next/head';
import Link from 'next/link';
import { Query } from 'react-apollo';
import React from 'react';

import { appTitle } from '../config';
import Error from './ErrorMessage';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

export default props => {
  const fetchPagination = ({ data, error, loading }) => {
    if (error) return <Error error={error} />;
    if (loading) return <p>Loading...</p>;

    const count = data.itemsConnection.aggregate.count;
    const pages = Math.ceil(count / perPage);
    const { page } = props;

    return (
      <PaginationStyles>
        <Head>
          <title>
            {appTitle} | Page {page} of {pages}
          </title>
        </Head>

        <Link prefetch href={{ pathname: 'items', query: { page: page - 1 } }}>
          <a className="prev" aria-disabled={page <= 1}>
            ← Prev
          </a>
        </Link>

        <p>
          Page {page} of {pages}
        </p>

        <p>{count} total items</p>

        <Link
          prefetch
          href={{
            pathname: 'items',
            query: { page: page + 1 },
          }}
        >
          <a className="next" aria-disabled={page >= pages}>
            Next →
          </a>
        </Link>
      </PaginationStyles>
    );
  };

  return <Query query={PAGINATION_QUERY}>{fetchPagination}</Query>;
};
