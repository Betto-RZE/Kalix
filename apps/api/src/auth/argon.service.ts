import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class ArgonService {
    /**
     * Genera un hash seguro con Argon2id a partir de una contraseña en texto plano
     */
    async hash(plainText: string): Promise<string> {
        return argon2.hash(plainText, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64MB
            timeCost: 3,
            parallelism: 1,
        });
    }

    /**
     * Compara una contraseña en texto plano contra un hash existente de Argon2
     */
    async verify(hash: string, plainText: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, plainText);
        } catch {
            return false;
        }
    }
}
