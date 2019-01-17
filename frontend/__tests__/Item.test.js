import Item from '../components/Item';
import { shallow } from 'enzyme';
import { PassThrough } from 'stream';

const fakeItem = {
  id: '3',
  title: 'Fake item',
  price: 33300,
  description: 'This is a big fake item',
  image: 'fake.jpg',
  largeImage: 'fake-large.jpg',
};

describe('<Item/>', () => {
  test('renders and displays properly', () => {
    const wrapper = shallow(<Item item={fakeItem} />);

    const PriceTag = wrapper.find('PriceTag');

    expect(PriceTag.children().text()).toBe('$333');
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);

    const img = wrapper.find('img');
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  test('renders button properly', () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const buttonList = wrapper.find('.buttonList');

    expect(buttonList.children()).toHaveLength(3);
    expect(buttonList.find('Link')).toBeTruthy();
    expect(buttonList.find('AddToCart')).toBeTruthy();
    expect(buttonList.find('DeleteItem')).toBeTruthy();
  });
});
