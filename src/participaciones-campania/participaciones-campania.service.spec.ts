import { Test, TestingModule } from '@nestjs/testing';
import { ParticipacionesCampaniaService } from './participaciones-campania.service.js';

describe('ParticipacionesCampaniaService', () => {
  let service: ParticipacionesCampaniaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipacionesCampaniaService],
    }).compile();

    service = module.get<ParticipacionesCampaniaService>(ParticipacionesCampaniaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
