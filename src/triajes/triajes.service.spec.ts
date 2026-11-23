import { Test, TestingModule } from '@nestjs/testing';
import { TriajesService } from './triajes.service.js';

describe('TriajesService', () => {
  let service: TriajesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriajesService],
    }).compile();

    service = module.get<TriajesService>(TriajesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
