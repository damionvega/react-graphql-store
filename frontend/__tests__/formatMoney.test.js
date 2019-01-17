import { formatMoney } from '../lib';

describe('formatMoney function', () => {
  test('works with fractional dollars', () => {
    expect(formatMoney(1)).toEqual('$0.01');
    expect(formatMoney(10)).toEqual('$0.10');
    expect(formatMoney(9)).toEqual('$0.09');
    expect(formatMoney(41)).toEqual('$0.41');
  });

  test('works with whole dollars', () => {
    expect(formatMoney(100)).toEqual('$1');
    expect(formatMoney(5000)).toEqual('$50');
    expect(formatMoney(50000)).toEqual('$500');
    expect(formatMoney(66600)).toEqual('$666');
  });

  test('works with whole and fractional dollars', () => {
    expect(formatMoney(110)).toEqual('$1.10');
    expect(formatMoney(144)).toEqual('$1.44');
    expect(formatMoney(5044)).toEqual('$50.44');
    expect(formatMoney(65098)).toEqual('$650.98');
  });
});
