import { formatZodIssues } from './zodException.filter.js';

describe('formatZodIssues', () => {
  it('maps issues to field and message only', () => {
    expect(
      formatZodIssues([
        {
          path: ['productToken'],
          message: 'Field is required.',
        } as never,
        {
          path: ['stock', 'quantity'],
          message: 'Field must be a valid number.',
        } as never,
      ]),
    ).toEqual([
      { field: 'productToken', message: 'Field is required.' },
      { field: 'stock.quantity', message: 'Field must be a valid number.' },
    ]);
  });
});
