
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageLogService } from './message-log.service';
import { MessageLogEntity } from './entities/message-log.entity';

describe('MessageLogService', () => {
  let service: MessageLogService;
  let repo: Repository<MessageLogEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageLogService,
        {
          provide: getRepositoryToken(MessageLogEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageLogService>(MessageLogService);
    repo = module.get<Repository<MessageLogEntity>>(getRepositoryToken(MessageLogEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logMessage', () => {
    it('should create and save message log', async () => {
      const messageData = {
        telegramMessageId: '123',
        telegramChatId: '456',
        textContent: 'Test message',
      };

      const savedMessage = { ...messageData, id: 1 };
      jest.spyOn(repo, 'create').mockReturnValue(savedMessage as MessageLogEntity);
      jest.spyOn(repo, 'save').mockResolvedValue(savedMessage as MessageLogEntity);

      const result = await service.logMessage(messageData);
      expect(result).toEqual(savedMessage);
    });
  });
});
