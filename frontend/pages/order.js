import Order from '../components/Order';
import PleaseSignIn from '../components/PleaseSignIn';

export default ({ query: { id } }) => (
  <PleaseSignIn>
    <Order id={id} />
  </PleaseSignIn>
);
