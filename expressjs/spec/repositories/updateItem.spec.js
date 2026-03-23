import db from '../../src/persistence/mysql.js';
import todoRepository from '../../src/repositories/todoRepository.js';

jest.mock('../../src/persistence/mysql.js', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

test('todoRepository.updateItemById updates item correctly', async () => {
    const id = 1234;
    const item = { name: 'New title', completed: false };

    db.query.mockResolvedValue(undefined);

    await todoRepository.updateItemById(id, item);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(
        'UPDATE todo_items SET name=?, completed=? WHERE id=?',
        ['New title', 0, 1234]
    );
});
