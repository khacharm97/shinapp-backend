import { Test, TestingModule } from '@nestjs/testing';
import { MastersController } from './masters.controller';
import { MastersService } from './masters.service';

describe('MastersController', () => {
  let mastersController: MastersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MastersController],
      providers: [MastersService],
    }).compile();

    mastersController = app.get<MastersController>(MastersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mastersController.getHello()).toBe('Hello World!');
    });
  });
});
