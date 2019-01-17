import { Query } from 'react-apollo';
import React from 'react';

import { CURRENT_USER_QUERY } from '../queries';
import Signin from './Signin';

export default props => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading...</p>;

      if (!data.me) {
        return (
          <div>
            <p>Please sign in to sell an item</p>
            <Signin />
          </div>
        );
      }

      return props.children;
    }}
  </Query>
);
