import { Test, TestingModule } from '@nestjs/testing';
import { DerivacionesController } from './derivaciones.controller.js';

describe('DerivacionesController', () => {
  let controller: DerivacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DerivacionesController],
    }).compile();

    controller = module.get<DerivacionesController>(DerivacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
