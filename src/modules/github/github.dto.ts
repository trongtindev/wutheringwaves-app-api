import { IsJSON, IsString } from 'class-validator';

export class GithubCommitBodyDto {
  @IsJSON()
  data: string;

  @IsString()
  path: string;
}
