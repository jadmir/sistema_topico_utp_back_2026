import { Test, TestingModule } from '@nestjs/testing';
import { TriajesController } from './triajes.controller.js';

describe('TriajesController', () => {
  let controller: TriajesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TriajesController],
    }).compile();

    controller = module.get<TriajesController>(TriajesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
