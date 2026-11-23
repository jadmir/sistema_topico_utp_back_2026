import { Test, TestingModule } from '@nestjs/testing';
import { ExistenciasController } from './existencias.controller.js';

describe('ExistenciasController', () => {
  let controller: ExistenciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExistenciasController],
    }).compile();

    controller = module.get<ExistenciasController>(ExistenciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
