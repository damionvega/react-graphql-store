import { ApolloConsumer } from 'react-apollo';
import Downshift, { resetIdCounter } from 'downshift';
import debounce from 'lodash/debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';
import gql from 'graphql-tag';
import React, { Component } from 'react';
import Router from 'next/router';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  });
}

export default class AutoComplete extends Component {
  state = {
    items: [],
    loading: false,
  };

  onChange = debounce(async (event, client) => {
    const value = event.target.value.trim();
    if (!value) return;

    this.setState({
      loading: true,
    });

    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: {
        searchTerm: value,
      },
    });

    this.setState({ items: res.data.items, loading: false });
  }, 500);

  render() {
    resetIdCounter();

    return (
      <SearchStyles>
        <Downshift
          onChange={routeToItem}
          itemToString={item => (item === null ? '' : item.title)}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex,
          }) => (
            <div>
              <ApolloConsumer>
                {client => (
                  <input
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Search for an item',
                      id: 'search',
                      className: this.state.loading ? 'loading' : '',
                      onChange: event => {
                        event.persist();
                        this.onChange(event, client);
                      },
                    })}
                  />
                )}
              </ApolloConsumer>

              {isOpen && (
                <DropDown>
                  {this.state.items.map((item, index) => (
                    <DropDownItem
                      {...getItemProps({ item })}
                      key={item.id}
                      highlighted={index === highlightedIndex}
                    >
                      <img src={item.image} alt={item.title} width="50" />
                      <p>{item.title}</p>
                    </DropDownItem>
                  ))}

                  {!this.state.items.length && !this.state.loading && (
                    <DropDownItem>
                      No products found with search "{inputValue}"
                    </DropDownItem>
                  )}
                </DropDown>
              )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}
