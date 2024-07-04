import { Processor } from '@nestjs/bull';

@Processor('convene')
export class ConveneQueue {}
