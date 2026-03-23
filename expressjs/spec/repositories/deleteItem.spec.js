import db from '../../src/persistence/mysql.js';
import todoRepository from '../../src/repositories/todoRepository.js';

jest.mock('../../src/persistence/mysql.js', () => ({
    __esModule: true,
    default: {
        query: jest.fn(),
    },
}));

test('todoRepository.deleteItemById removes item correctly', async () => {
    const id = 12345;

    db.query.mockResolvedValue(undefined);

    await todoRepository.deleteItemById(id);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith('DELETE FROM todo_items WHERE id = ?', [12345]);
});
