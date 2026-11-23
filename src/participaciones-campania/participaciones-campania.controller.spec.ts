import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionesCampaniaController } from './participaciones-campania.controller.js';

describe('ParticipacionesCampaniaController', () => {
  let controller: ParticipacionesCampaniaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipacionesCampaniaController],
    }).compile();

    controller = module.get<ParticipacionesCampaniaController>(ParticipacionesCampaniaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
