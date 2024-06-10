import { Global, Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';

@Global()
@Module({
  imports: [],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService]
})
export class BackupModule {}
