import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'KALIX API',
      timestamp: new Date().toISOString(),
    };
  }
}
