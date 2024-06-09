import { BaseResponse } from './api/common/response';

export async function GET(req: Request) {}
export async function POST(req: Request) {}
export async function HEAD(req: Request) {}
export async function PATCH(req: Request) {}

export async function OPTIONS(req: Request) {
  return new BaseResponse(200, {}).json();
}
