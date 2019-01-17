import ItemDetail from '../components/ItemDetail';

export default ({ query }) => (
  <div>
    <ItemDetail id={query.id} />
  </div>
);
