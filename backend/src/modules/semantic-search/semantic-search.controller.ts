import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { SemanticSearchDto } from './dto/semantic-search.dto';
import { SemanticSearchService } from './semantic-search.service';

@ApiTags('Semantic search')
@Controller('semantic-search')
export class SemanticSearchController {
  constructor(private readonly semanticSearchService: SemanticSearchService) {}

  @Public()
  @Post()
  search(@Body() semanticSearchDto: SemanticSearchDto) {
    return this.semanticSearchService.search(semanticSearchDto.query);
  }
}
