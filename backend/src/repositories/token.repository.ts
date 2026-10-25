import { LessThan } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { RefreshToken } from '../entities/RefreshToken.js';

const tokenRepository = AppDataSource.getRepository(RefreshToken);

export class TokenRepository {
  async create(userId: number, token: string, expiresAt: Date) {
    await tokenRepository.save(tokenRepository.create({ userId, token, expiresAt }));
  }

  async findByToken(token: string) {
    return tokenRepository.findOneBy({ token });
  }

  async deleteByToken(token: string) {
    await tokenRepository.delete({ token });
  }

  async deleteAllByUser(userId: number) {
    await tokenRepository.delete({ userId });
  }

  async deleteExpired() {
    await tokenRepository.delete({ expiresAt: LessThan(new Date()) });
  }
}