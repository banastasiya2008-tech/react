import { UserRepository } from '../repositories/user.repository.js';
const userRepo = new UserRepository();

export class UserService {
  async getUserById(id: number) { return userRepo.getById(id); }
  async getLibrary(userId: number) { return userRepo.getLibrary(userId); }
  async addToLibrary(userId: number, gameId: number) { return userRepo.addToLibrary(userId, gameId); }
  async removeFromLibrary(userId: number, gameId: number) { return userRepo.removeFromLibrary(userId, gameId); }
  async addToCart(userId: number, gameId: number) { return userRepo.addToCart(userId, gameId); }
  async removeFromCart(userId: number, gameId: number) { return userRepo.removeFromCart(userId, gameId); }
  async getCart(userId: number) { return userRepo.getCart(userId); }
  async clearCart(userId: number) { return userRepo.clearCart(userId); }
}