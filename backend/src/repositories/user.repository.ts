import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source.js';
import { User } from '../entities/User.js';
import { UserLibrary } from '../entities/UserLibrary.js';
import { CartItem } from '../entities/CartItem.js';
import { toApiGame } from '../utils/game.mapper.js';

const userRepository = AppDataSource.getRepository(User);
const libraryRepository = AppDataSource.getRepository(UserLibrary);
const cartRepository = AppDataSource.getRepository(CartItem);

export class UserRepository {
  // Регистрация
  async register(data: any) {
    if (await userRepository.existsBy({ email: data.email })) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const saved = await userRepository.save(
      userRepository.create({
        username: data.username,
        email: data.email,
        password: hashedPassword,
      })
    );

    return this.getByIdOrThrow(saved.id);
  }

  // Логин: пароль (select: false) достаём явно, только здесь
  async login(data: any) {
    const user = await userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: data.email })
      .getOne();
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    return this.getByIdOrThrow(user.id);
  }

  // Публичные данные пользователя (без пароля)
  async getById(id: number) {
    return userRepository.findOne({
      where: { id },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
  }

  private async getByIdOrThrow(id: number) {
    const user = await this.getById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  // LIBRARY
  async getLibrary(userId: number) {
    const rows = await libraryRepository.find({ where: { userId }, select: { gameId: true } });
    return rows.map((r) => r.gameId);
  }

  async addToLibrary(userId: number, gameId: number) {
    if (await libraryRepository.existsBy({ userId, gameId })) throw new Error('Already in library');
    await libraryRepository.save(libraryRepository.create({ userId, gameId }));
  }

  async removeFromLibrary(userId: number, gameId: number) {
    await libraryRepository.delete({ userId, gameId });
  }

  // CART
  async addToCart(userId: number, gameId: number) {
    if (await cartRepository.existsBy({ userId, gameId })) throw new Error('Already in cart');
    await cartRepository.save(cartRepository.create({ userId, gameId }));
  }

  async removeFromCart(userId: number, gameId: number) {
    await cartRepository.delete({ userId, gameId });
  }

  // Корзина с играми ОДНИМ запросом (relations -> JOIN), без N+1
  async getCart(userId: number) {
    const items = await cartRepository.find({
      where: { userId },
      relations: { game: true },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => toApiGame(item.game));
  }

  async clearCart(userId: number) {
    await cartRepository.delete({ userId });
  }
}