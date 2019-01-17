import Link from 'next/link';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import formatMoney from '../lib/formatMoney';
import ItemStyles from './styles/ItemStyles';
import PriceTag from './styles/PriceTag';
import Title from './styles/Title';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      largeImage: PropTypes.string.isRequired,
    }),
  };

  render() {
    const { item } = this.props;

    return (
      <ItemStyles>
        <Link href={{ pathname: '/item', query: { id: item.id } }}>
          <a>
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                style={{ cursor: 'pointer' }}
              />
            )}
          </a>
        </Link>

        <Link href={{ pathname: '/item', query: { id: item.id } }}>
          <Title>
            <a style={{ cursor: 'pointer' }}>{item.title}</a>
          </Title>
        </Link>

        <PriceTag>{formatMoney(item.price)}</PriceTag>
        <p>{item.description}</p>

        <div className="buttonList">
          <Link href={{ pathname: 'update', query: { id: item.id } }}>
            <a>Edit ✏️</a>
          </Link>

          <AddToCart id={item.id} />

          <DeleteItem id={item.id}>Delete Item 🗑</DeleteItem>
        </div>
      </ItemStyles>
    );
  }
}
