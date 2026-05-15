// Usamos rutas relativas CORRECTAS
jest.mock('../../../backend/src/config/database');
jest.mock('../../../backend/src/api/repositories/objectiveRepository');
jest.mock('../../../backend/src/api/repositories/progressRepository');
jest.mock('../../../backend/src/api/repositories/activityLogRepository');

const objectivesService = require('../../../backend/src/api/services/objectivesService');
const objectiveRepository = require('../../../backend/src/api/repositories/objectiveRepository');
const progressRepository = require('../../../backend/src/api/repositories/progressRepository');
const activityLogRepository = require('../../../backend/src/api/repositories/activityLogRepository');
const db = require('../../../backend/src/config/database');

describe('ObjectivesService', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
  };

  beforeEach(() => {
    // La configuración de Jest `clearMocks: true` limpia esto
    db.sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  it('createObjective debería llamar a los métodos de creación', async () => {
    const objectiveData = { name: 'Aprender', initialValue: 10, targetValue: 100 };
    const newObjective = { id: 1, ...objectiveData, userId: 1, toJSON: () => newObjective };
    
    objectiveRepository.create.mockResolvedValue(newObjective);
    objectivesService.getObjectiveById = jest.fn().mockResolvedValue(newObjective.toJSON());

    await objectivesService.createObjective(objectiveData, 1);

    expect(objectiveRepository.create).toHaveBeenCalled();
    expect(progressRepository.create).toHaveBeenCalled(); 
    expect(activityLogRepository.create).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});