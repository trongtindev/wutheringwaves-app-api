export class BaseResponse {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    this.status = status;
    this.body = body;
  }

  json() {
    if (this.status === 500) {
      console.error(JSON.stringify(this.body));
    }

    const res = new Response(JSON.stringify(this.body), {
      status: this.status
    });
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set(
      'Access-Control-Allow-Headers',
      'authorization, content-type'
    );

    return res;
  }
}

export class ListResponse extends BaseResponse {}
