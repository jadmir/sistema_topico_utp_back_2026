import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosInventarioController } from './movimientos-inventario.controller.js';

describe('MovimientosInventarioController', () => {
  let controller: MovimientosInventarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosInventarioController],
    }).compile();

    controller = module.get<MovimientosInventarioController>(MovimientosInventarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
