import { Test, TestingModule } from '@nestjs/testing';
import { DetalleAtencionesController } from './detalle-atenciones.controller.js';

describe('DetalleAtencionesController', () => {
  let controller: DetalleAtencionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleAtencionesController],
    }).compile();

    controller = module.get<DetalleAtencionesController>(DetalleAtencionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
