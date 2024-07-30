import { Global, Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubEvents } from './github.events';
import { GithubController } from './github.controller';

@Global()
@Module({
  imports: [],
  controllers: [GithubController],
  providers: [GithubService, GithubEvents],
  exports: [GithubService]
})
export class GithubModule {}
