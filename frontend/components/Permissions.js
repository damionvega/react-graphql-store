import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import React, { Component } from 'react';

import Error from './ErrorMessage';
import SickButton from './styles/SickButton';
import Table from './styles/Table';

// Another option is to query these from the db
const availablePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USERS_QUERY = gql`
  query ALL_USERS_QUERY {
    users {
      id
      email
      name
      permissions
    }
  }
`;

export default class Permissions extends Component {
  renderUsers = ({ data, error, loading }) => {
    if (loading) return <p>Loading...</p>;
    if (error) return <Error error={error} />;

    return (
      <div>
        <h2>Manage Permissions</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {availablePermissions.map((permission, i) => (
                <th key={i}>{permission}</th>
              ))}
              {/* <th>👇</th> */}
            </tr>
          </thead>

          <tbody>
            {data.users.map(user => (
              <UserPermissions key={user.id} user={user} />
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  render() {
    return <Query query={ALL_USERS_QUERY}>{this.renderUsers}</Query>;
  }
}

const UPDATE_USER_MUTATION = gql`
  mutation UPDATE_USER_MUTATION($id: ID!, $permissions: [Permission]) {
    updatePermissions(id: $id, permissions: $permissions) {
      permissions
    }
  }
`;

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  };

  state = {
    // Using props as initial state is considered bad practice, but in this case it
    // can be used as we're only "seeding" the initial data and changing local state until
    // the data is sent to the back end
    permissions: this.props.user.permissions,
  };

  onPermissionChange = async (event, updatePermissions) => {
    const checkbox = event.target;

    let updatedPermissions = [...this.state.permissions];

    // Check if permission needs to be added or removed
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(
        permission => permission !== checkbox.value,
      );
    }

    this.setState({ permissions: updatedPermissions }, updatePermissions);
  };

  render() {
    const { user } = this.props;

    return (
      <Mutation
        mutation={UPDATE_USER_MUTATION}
        variables={{
          id: user.id,
          permissions: this.state.permissions,
        }}
      >
        {(updatePermissions, { data, loading, error }) => {
          return (
            <>
              {error && (
                <tr>
                  <td colspan="8">
                    <Error error={error} />
                  </td>
                </tr>
              )}

              <tr>
                <td>{user.name}</td>
                <td>{user.email}</td>

                {availablePermissions.map((permission, i) => {
                  const hasPermission = this.state.permissions.includes(
                    permission,
                  );

                  return (
                    <td key={i}>
                      <label htmlFor={`${user.id}-permission-${permission}`}>
                        <input
                          id={`${user.id}-permission-${permission}`}
                          checked={hasPermission}
                          onChange={event =>
                            this.onPermissionChange(event, updatePermissions)
                          }
                          ref=""
                          type="checkbox"
                          value={permission}
                        />
                      </label>
                    </td>
                  );
                })}

                {/* <td>
                  <SickButton
                    disabled={loading}
                    aria-busy={loading}
                    type="button"
                    onClick={updatePermissions}
                  >
                    Updat{loading ? 'ing' : 'e'}
                  </SickButton>
                </td> */}
              </tr>
            </>
          );
        }}
      </Mutation>
    );
  }
}
