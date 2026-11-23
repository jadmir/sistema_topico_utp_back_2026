import { Test, TestingModule } from '@nestjs/testing';
import { DetalleAtencionesService } from './detalle-atenciones.service.js';

describe('DetalleAtencionesService', () => {
  let service: DetalleAtencionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleAtencionesService],
    }).compile();

    service = module.get<DetalleAtencionesService>(DetalleAtencionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
