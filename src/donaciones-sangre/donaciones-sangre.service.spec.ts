import { Test, TestingModule } from '@nestjs/testing';
import { DonacionesSangreService } from './donaciones-sangre.service.js';

describe('DonacionesSangreService', () => {
  let service: DonacionesSangreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonacionesSangreService],
    }).compile();

    service = module.get<DonacionesSangreService>(DonacionesSangreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
