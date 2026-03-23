import db from '../../src/persistence/mysql.js';
import todoRepository from '../../src/repositories/todoRepository.js';

jest.mock('../../src/persistence/mysql.js', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

test('todoRepository.insertItem stores item correctly', async () => {
    const item = { id: 'something-not-a-uuid', name: 'A sample item', completed: false };

    db.query.mockResolvedValue(undefined);

    await todoRepository.insertItem(item);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        ['something-not-a-uuid', 'A sample item', 0]
    );
});
