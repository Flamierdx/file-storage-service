export interface ICrudService {
  create(...args: unknown[]): unknown;
  update(...args: unknown[]): unknown;
  delete(...args: unknown[]): unknown;
  findOne(...args: unknown[]): unknown;
  findAll(...args: unknown[]): unknown;
}
