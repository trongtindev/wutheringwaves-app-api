import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { IGithubCommitCreateArgs } from './github.interface';
import axios, { AxiosInstance } from 'axios';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class GithubService implements OnApplicationBootstrap {
  private logger = new Logger(GithubService.name);
  private github: AxiosInstance;

  constructor(
    private eventEmitter: EventEmitter2,
    private userService: UserService
  ) {}

  onApplicationBootstrap() {
    this.logger.verbose('onApplicationBootstrap');

    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env;
    this.github = axios.create({
      baseURL: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
  }

  async commit(user: UserDocument, args: IGithubCommitCreateArgs) {
    const { GITHUB_BRANCH } = process.env;
    const NEW_BRANCH = 'a_' + user._id.toString() + '_' + createId();
    const FILE_NAME = args.path.split('/')[args.path.split('/').length - 1];
    const FILE_PATH = args.path;
    const FILE_CONTENT = args.content;
    const COMMIT_MESSAGE = `Update ${FILE_NAME}`;
    const PR_TITLE = `${user.name} update ${FILE_NAME}`;
    const PR_BODY = ``;

    // Step 1: Get the reference of the base branch
    const { data: baseBranchData } = await this.github.get(
      `/git/ref/heads/${GITHUB_BRANCH}`
    );
    const baseSha = baseBranchData.object.sha;

    // Step 2: Create a new branch
    await this.github.post(`/git/refs`, {
      ref: `refs/heads/${NEW_BRANCH}`,
      sha: baseSha
    });

    // Step 3: Create a new blob for the file
    const { data: blobData } = await this.github.post(`/git/blobs`, {
      content: Buffer.from(FILE_CONTENT).toString('base64'),
      encoding: 'base64'
    });

    // Step 4: Get the latest commit's tree
    const { data: commitData } = await this.github.get(
      `/git/commits/${baseSha}`
    );
    const treeSha = commitData.tree.sha;

    // Step 5: Create a new tree including the new blob
    const { data: newTreeData } = await this.github.post(`/git/trees`, {
      base_tree: treeSha,
      tree: [
        {
          path: FILE_PATH,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    });

    // Step 6: Create a new commit with the tree
    const { data: newCommitData } = await this.github.post(`/git/commits`, {
      message: COMMIT_MESSAGE,
      tree: newTreeData.sha,
      parents: [baseSha]
    });

    // Step 7: Update the reference to point to the new commit
    await this.github.patch(`/git/refs/heads/${NEW_BRANCH}`, {
      sha: newCommitData.sha
    });

    // Step 8: Create a pull request
    const { data: pullRequestData } = await this.github.post(`/pulls`, {
      title: PR_TITLE,
      head: NEW_BRANCH,
      base: GITHUB_BRANCH,
      body: PR_BODY
    });

    return pullRequestData;
  }
}
