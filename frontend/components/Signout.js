import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import React from 'react';

import { CURRENT_USER_QUERY } from '../queries';

const SIGNOUT_MUTATION = gql`
  mutation SIGNOUT_MUTATION {
    signout {
      message
    }
  }
`;

export default () => (
  <Mutation
    mutation={SIGNOUT_MUTATION}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {signout => <div onClick={signout}>Sign Out</div>}
  </Mutation>
);
