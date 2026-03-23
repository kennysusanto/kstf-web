import db from '../../src/persistence/mysql.js';
import todoRepository from '../../src/repositories/todoRepository.js';
const ITEMS = [{ id: 12345 }];

jest.mock('../../src/persistence/mysql.js', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

test('todoRepository.getItems returns items correctly', async () => {
    db.query.mockResolvedValue(ITEMS);

    const result = await todoRepository.getItems();

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM todo_items');
    expect(result).toEqual(ITEMS);
});
