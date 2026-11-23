import { Test, TestingModule } from '@nestjs/testing';
import { CargasController } from './cargas.controller.js';

describe('CargasController', () => {
  let controller: CargasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CargasController],
    }).compile();

    controller = module.get<CargasController>(CargasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
