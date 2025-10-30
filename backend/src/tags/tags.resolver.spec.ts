import { Test, TestingModule } from '@nestjs/testing';
import { TagsResolver } from './tags.resolver';
import { TagsService } from './tags.service';

describe('TagsResolver', () => {
  let resolver: TagsResolver;

  const mockTag = {
    id: 1,
    name: 'Test Tag',
    color: '#FF0000',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockTagsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    assignTag: jest.fn(),
    unassignTag: jest.fn(),
    getTagsByTestCase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsResolver,
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    resolver = module.get<TagsResolver>(TagsResolver);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createTag', () => {
    it('should create a tag', async () => {
      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await resolver.createTag({
        name: 'Test Tag',
        color: '#FF0000',
      });

      expect(result).toEqual(mockTag);
      expect(mockTagsService.create).toHaveBeenCalledWith({
        name: 'Test Tag',
        color: '#FF0000',
      });
    });
  });

  describe('tags', () => {
    it('should return all tags', async () => {
      const mockTags = [mockTag];
      mockTagsService.findAll.mockResolvedValue(mockTags);

      const result = await resolver.tags();

      expect(result).toEqual(mockTags);
      expect(mockTagsService.findAll).toHaveBeenCalled();
    });
  });

  describe('tag', () => {
    it('should return a tag by id', async () => {
      mockTagsService.findOne.mockResolvedValue(mockTag);

      const result = await resolver.tag(1);

      expect(result).toEqual(mockTag);
      expect(mockTagsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateTag', () => {
    it('should update a tag', async () => {
      const updatedTag = { ...mockTag, name: 'Updated Tag' };
      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await resolver.updateTag({
        id: 1,
        name: 'Updated Tag',
      });

      expect(result).toEqual(updatedTag);
      expect(mockTagsService.update).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated Tag',
      });
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      mockTagsService.remove.mockResolvedValue(mockTag);

      const result = await resolver.deleteTag(1);

      expect(result).toEqual(mockTag);
      expect(mockTagsService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('assignTag', () => {
    it('should assign a tag to a test case', async () => {
      mockTagsService.assignTag.mockResolvedValue(true);

      const result = await resolver.assignTag({
        testCaseId: 1,
        tagId: 1,
      });

      expect(result).toBe(true);
      expect(mockTagsService.assignTag).toHaveBeenCalledWith({
        testCaseId: 1,
        tagId: 1,
      });
    });
  });

  describe('unassignTag', () => {
    it('should unassign a tag from a test case', async () => {
      mockTagsService.unassignTag.mockResolvedValue(true);

      const result = await resolver.unassignTag(1, 1);

      expect(result).toBe(true);
      expect(mockTagsService.unassignTag).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('tagsByTestCase', () => {
    it('should return tags for a test case', async () => {
      const mockTags = [mockTag];
      mockTagsService.getTagsByTestCase.mockResolvedValue(mockTags);

      const result = await resolver.tagsByTestCase(1);

      expect(result).toEqual(mockTags);
      expect(mockTagsService.getTagsByTestCase).toHaveBeenCalledWith(1);
    });
  });
});
