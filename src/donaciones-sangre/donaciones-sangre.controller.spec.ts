import { Test, TestingModule } from '@nestjs/testing';
import { DonacionesSangreController } from './donaciones-sangre.controller.js';

describe('DonacionesSangreController', () => {
  let controller: DonacionesSangreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DonacionesSangreController],
    }).compile();

    controller = module.get<DonacionesSangreController>(DonacionesSangreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
